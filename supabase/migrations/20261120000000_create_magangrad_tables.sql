create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) <= 180),
  company text not null check (char_length(company) <= 160),
  location text not null check (char_length(location) <= 120),
  workplace text not null check (workplace in ('On-site', 'Hybrid', 'Remote')),
  description text not null default '',
  url text not null check (url ~ '^https://(www\.)?linkedin\.com/jobs/'),
  created_at timestamptz not null default now()
);

create table if not exists public.saved_jobs (
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  stage text not null default 'saved' check (stage in ('saved', 'applied', 'interview', 'closed')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

alter table public.jobs enable row level security;
alter table public.saved_jobs enable row level security;

create policy "Users manage their own jobs"
  on public.jobs for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own saved jobs"
  on public.saved_jobs for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.jobs
      where jobs.id = job_id and jobs.user_id = (select auth.uid())
    )
  );

revoke all on public.jobs from public, anon, authenticated;
revoke all on public.saved_jobs from public, anon, authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.saved_jobs to authenticated;
