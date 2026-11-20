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
