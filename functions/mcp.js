import { McpServer } from '@modelcontextprotocol/server'
import { createMcpHandler } from 'agents/mcp/server'
import { z } from 'zod'
import { agentRequestAuthorized } from './api/agent/jobs.js'

const jobSummary = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  workplace: z.enum(['On-site', 'Hybrid', 'Remote']),
  url: z.string().url(),
  created_at: z.string(),
})

function serverFor(request, bearerToken) {
  const server = new McpServer({ name: 'magangrad-jobs', version: '1.0.0' })
  const jobsUrl = new URL('/api/agent/jobs', request.url)
  const headers = { Authorization: `Bearer ${bearerToken}` }

  server.registerTool(
    'list_shared_jobs',
    {
      title: 'List shared job listings',
      description: 'Read recent internship listings already on the Magangrad board. Use this before adding a listing to check for duplicates.',
      inputSchema: z.object({ limit: z.number().int().min(1).max(100).optional().default(30) }),
      outputSchema: z.object({ jobs: z.array(jobSummary) }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ limit }) => {
      const target = new URL(jobsUrl)
      target.searchParams.set('limit', String(limit))
      const response = await fetch(target, { headers })
      if (!response.ok) throw new Error(`The shared board could not be read (HTTP ${response.status}).`)
      const data = await response.json()
      return {
        content: [{ type: 'text', text: JSON.stringify(data.jobs) }],
        structuredContent: data,
      }
    },
  )

  server.registerTool(
    'add_shared_job',
    {
      title: 'Add a verified job listing',
      description: 'Add one verified internship listing to the shared Magangrad board. Provide the original HTTPS listing URL. Duplicate URLs are ignored. Match scores are profile-specific and are not accepted.',
      inputSchema: z.object({
        title: z.string().min(1).max(180),
        company: z.string().min(1).max(160),
        location: z.string().min(1).max(120),
        workplace: z.enum(['On-site', 'Hybrid', 'Remote']),
        url: z.string().url(),
        description: z.string().max(8000).optional(),
        tags: z.array(z.string().max(40)).max(12).optional(),
      }).strict(),
      outputSchema: z.object({ status: z.enum(['added', 'duplicate']), message: z.string(), job: jobSummary.nullable() }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (job) => {
      const response = await fetch(jobsUrl, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `The shared board rejected this listing (HTTP ${response.status}).`)

      const jobSummaryData = data.job && {
        title: data.job.title,
        company: data.job.company,
        location: data.job.location,
        workplace: data.job.workplace,
        url: data.job.url,
        created_at: data.job.created_at,
      }
      const result = data.status === 'added'
        ? { status: 'added', message: 'Listing added to the shared board.', job: jobSummaryData }
        : { status: 'duplicate', message: data.message, job: null }

      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        structuredContent: result,
      }
    },
  )

  return server
}

export async function onRequest({ request, env, ...context }) {
  if (request.method !== 'POST') return new Response('Method not allowed.', { status: 405 })
  if (!env.MAGANGRAD_AGENT_TOKENS) return new Response('Agent API is not configured.', { status: 503 })
  if (!(await agentRequestAuthorized(request, env))) return new Response('Unauthorized.', { status: 401 })

  const authorization = request.headers.get('Authorization') || ''
  const token = authorization.replace(/^Bearer\s+/i, '').trim()
  const handler = createMcpHandler(() => serverFor(request, token), {
    route: '/mcp',
    allowedHostnames: ['magangrad.pages.dev'],
  })

  return handler(request, env, context)
}
