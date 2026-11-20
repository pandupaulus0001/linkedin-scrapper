export async function onRequestGet({ env }) {
  const supabaseUrl = env.VITE_SUPABASE_URL
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !publishableKey) {
    return Response.json({ error: 'Supabase is not configured.' }, { status: 503 })
  }

  return Response.json(
    { supabaseUrl, publishableKey },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
