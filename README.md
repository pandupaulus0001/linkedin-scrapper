# Magangrad

A job search workspace for undergraduate internship opportunities in Jabodetabek. It opens matching searches on LinkedIn, lets students track links they choose to save, and stores personal listings in Supabase when configured. It does not crawl or automate LinkedIn.

## Run locally

```powershell
npm install
Copy-Item .env.example .env.local
# Add a Supabase URL and publishable key to .env.local, then:
npm run dev
```

Without Supabase credentials the app runs in local demo mode. Sample cards are marked **CONTOH**; added jobs and saved items stay in this browser's local storage.

## Supabase setup

1. Create a Supabase project and enable Email sign-in (magic links).
2. Run `supabase/migrations/20261120000000_create_magangrad_tables.sql` in the SQL Editor, or apply it with the Supabase CLI.
3. Copy the project URL and publishable key into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Add your local and production app URLs to Supabase Auth's allowed redirect URLs.

The browser uses only the publishable key. Both tables have row-level security and each signed-in student can access only their own rows. Never place a Supabase secret or service-role key in Vite environment variables.

## Cloudflare Pages

This repo includes `wrangler.jsonc` for a Cloudflare Pages static build and `public/_redirects` for SPA routes. In Pages, connect the GitHub repo and use:

- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

Or deploy with Wrangler after configuring your Cloudflare account:

```powershell
npm run build
npx wrangler pages deploy dist
```

## LinkedIn searches

The search button opens LinkedIn's job search with the current keywords and Jabodetabek location. It does not sign in to LinkedIn, crawl search pages, collect profile data, or bypass access controls. Add a listing by entering its details and LinkedIn job URL yourself.

## AI agent API

Cloudflare Pages Functions exposes two authenticated integration options for AI agents:

- `GET /api/agent/openapi.json` — machine-readable API schema.
- `GET /api/agent/jobs?limit=30` — read recent shared listings.
- `POST /api/agent/jobs` — add a listing to the shared board. Duplicate URLs are ignored.
- `POST /mcp` — stateless Streamable HTTP MCP server with `list_shared_jobs` and `add_shared_job` tools.

New AI-submitted listings are left without a match score because the current score is specific to Maria's profile. Agents should submit original job links and verified listing details; this API does not crawl LinkedIn.

### Configure production secrets

In Cloudflare Dashboard, open **Workers & Pages → magangrad → Settings → Variables and Secrets** and add these as encrypted secrets for the Production environment:

- `SUPABASE_SECRET_KEY` — create a dedicated Supabase secret key from the `dhvxntgikxpcfifdevaw` project's API Keys settings. It must never be placed in `wrangler.jsonc`, Vite variables, a prompt, or source control.
- `MAGANGRAD_AGENT_TOKENS` — a high-entropy bearer token generated in a password manager. To rotate a token without downtime, put the new token on a new line alongside the old one, update each AI connector, then remove the old token.

The Supabase URL comes from the existing `VITE_SUPABASE_URL` setting. The browser's publishable key is not used for agent writes.

### Connect an AI agent

For an OpenAPI Action, import `https://magangrad.pages.dev/api/agent/openapi.json`, choose HTTP Bearer authentication, and enter the token stored as `MAGANGRAD_AGENT_TOKENS`.

For MCP clients, use `https://magangrad.pages.dev/mcp` with the same Bearer token. Example Antigravity `mcp_config.json` entry:

```json
{
  "mcpServers": {
    "magangrad": {
      "serverUrl": "https://magangrad.pages.dev/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_MAGANGRAD_AGENT_TOKEN"
      }
    }
  }
}
```

For Claude Code, add the remote MCP server with `claude mcp add --transport http magangrad https://magangrad.pages.dev/mcp --header "Authorization: Bearer YOUR_MAGANGRAD_AGENT_TOKEN"`. Claude.ai web custom connectors generally use OAuth, which is not part of this static-token endpoint.

In any agent's instructions, ask it to check recent listings first, submit only verified internship listings in/near Jabodetabek, and include the original job URL. Keep the token in the connector's secret field or local MCP configuration, not in the agent's general prompt.

Example request body:

```json
{
  "title": "Finance Intern",
  "company": "Example Company",
  "location": "Jakarta Selatan",
  "workplace": "Hybrid",
  "url": "https://www.linkedin.com/jobs/view/1234567890/",
  "description": "Internship responsibilities and eligibility verified from the listing.",
  "tags": ["Finance", "Accounting"]
}
```
