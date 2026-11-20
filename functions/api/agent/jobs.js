const MAX_BODY_BYTES = 16 * 1024
const MAX_TAGS = 12

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

async function tokenMatches(received, env) {
  const candidates = (env.MAGANGRAD_AGENT_TOKENS || '')
    .split(/\r?\n/)
    .map((token) => token.trim())
    .filter(Boolean)

  if (!received || !candidates.length) return false

  const digest = async (value) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))
  const receivedDigest = await digest(received)
  let matched = false

  for (const candidate of candidates) {
    const expectedDigest = await digest(candidate)
    let difference = 0
    for (let index = 0; index < receivedDigest.length; index += 1) {
      difference |= receivedDigest[index] ^ expectedDigest[index]
    }
    matched = matched || difference === 0
  }

  return matched
}

async function authorize(request, env) {
  const authorization = request.headers.get('Authorization') || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  if (!env.MAGANGRAD_AGENT_TOKENS) return { error: 'Agent API is not configured.', status: 503 }
  if (!match || !(await tokenMatches(match[1].trim(), env))) return { error: 'Unauthorized.', status: 401 }
  return null
}

function supabaseConfig(env) {
  const url = env.VITE_SUPABASE_URL
  const key = env.SUPABASE_SECRET_KEY
  if (!url || !key) return null
  return { url: url.replace(/\/$/, ''), key }
}

function cleanJob(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be a JSON object.' }
  }

  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const company = typeof input.company === 'string' ? input.company.trim() : ''
  const location = typeof input.location === 'string' ? input.location.trim() : ''
  const workplace = typeof input.workplace === 'string' ? input.workplace.trim() : ''
  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const rawUrl = typeof input.url === 'string' ? input.url.trim() : ''

  if (!title || title.length > 180) return { error: 'title is required and must be 180 characters or fewer.' }
  if (!company || company.length > 160) return { error: 'company is required and must be 160 characters or fewer.' }
  if (!location || location.length > 120) return { error: 'location is required and must be 120 characters or fewer.' }
  if (!['On-site', 'Hybrid', 'Remote'].includes(workplace)) return { error: 'workplace must be On-site, Hybrid, or Remote.' }
  if (description.length > 8000) return { error: 'description must be 8000 characters or fewer.' }

  let parsedUrl
  try {
    parsedUrl = new URL(rawUrl)
  } catch {
    return { error: 'url must be a valid HTTPS job listing URL.' }
  }
  if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password) {
    return { error: 'url must be a valid HTTPS job listing URL.' }
  }
  parsedUrl.hash = ''

  const inputTags = Array.isArray(input.tags) ? input.tags : []
  if (inputTags.length > MAX_TAGS || inputTags.some((tag) => typeof tag !== 'string' || tag.trim().length > 40)) {
    return { error: `tags must be up to ${MAX_TAGS} strings, each 40 characters or fewer.` }
  }
  const tags = [...new Set(['Mahasiswa S1', 'Magang', ...inputTags.map((tag) => tag.trim()).filter(Boolean)])]

  return {
    value: {
      title,
      company,
      location,
      workplace,
      description,
      url: parsedUrl.toString(),
      tags,
      // Match scores are Maria-specific and are deliberately assigned separately.
      match_score: null,
      match_level: null,
      match_reason: '',
      match_caveat: '',
    },
  }
}

async function handleGet(request, env) {
  const authError = await authorize(request, env)
  if (authError) return json({ error: authError.error }, authError.status)

  const config = supabaseConfig(env)
  if (!config) return json({ error: 'Supabase server credentials are not configured.' }, 503)

  const limitValue = Number(new URL(request.url).searchParams.get('limit') || 30)
  const limit = Number.isInteger(limitValue) ? Math.max(1, Math.min(limitValue, 100)) : 30
  const endpoint = new URL('/rest/v1/shared_jobs', config.url)
  endpoint.search = new URLSearchParams({
    select: 'title,company,location,workplace,url,created_at',
    order: 'created_at.desc',
    limit: String(limit),
  }).toString()

  const upstream = await fetch(endpoint, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
  })
  if (!upstream.ok) return json({ error: 'Could not read the shared jobs list.' }, 502)
  return json({ jobs: await upstream.json() })
}

async function handlePost(request, env) {
  const authError = await authorize(request, env)
  if (authError) return json({ error: authError.error }, authError.status)

  const config = supabaseConfig(env)
  if (!config) return json({ error: 'Supabase server credentials are not configured.' }, 503)

  const bodyText = await request.text()
  if (new TextEncoder().encode(bodyText).byteLength > MAX_BODY_BYTES) {
    return json({ error: 'Request body is too large.' }, 413)
  }

  let input
  try {
    input = JSON.parse(bodyText)
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400)
  }

  const cleaned = cleanJob(input)
  if (cleaned.error) return json({ error: cleaned.error }, 400)

  const endpoint = new URL('/rest/v1/shared_jobs?on_conflict=url', config.url)
  const upstream = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=representation',
    },
    body: JSON.stringify(cleaned.value),
  })

  if (!upstream.ok) return json({ error: 'Supabase rejected the job listing.' }, 502)
  const rows = await upstream.json()
  if (!rows.length) return json({ status: 'duplicate', message: 'This listing URL is already on the shared board.' })
  return json({ status: 'added', job: rows[0] }, 201)
}

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  try {
    return request.method === 'GET' ? await handleGet(request, env) : await handlePost(request, env)
  } catch {
    return json({ error: 'The agent API could not complete the request.' }, 500)
  }
}
