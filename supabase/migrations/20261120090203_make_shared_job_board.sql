create table if not exists public.shared_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 180),
  company text not null check (char_length(company) <= 160),
  location text not null check (char_length(location) <= 120),
  workplace text not null check (workplace in ('On-site', 'Hybrid', 'Remote')),
  description text not null default '',
  url text not null unique check (url ~ '^https://'),
  tags text[] not null default array['Mahasiswa S1', 'Magang'],
  created_at timestamptz not null default now()
);

create table if not exists public.shared_saved_jobs (
  job_id uuid primary key references public.shared_jobs (id) on delete cascade,
  stage text not null default 'saved' check (stage in ('saved', 'applied', 'interview', 'closed')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.shared_jobs enable row level security;
alter table public.shared_saved_jobs enable row level security;

create policy "Signed-in accounts share the job board"
  on public.shared_jobs for all to authenticated
  using (true)
  with check (true);

create policy "Signed-in accounts share saved stages"
  on public.shared_saved_jobs for all to authenticated
  using (true)
  with check (true);

revoke all on public.shared_jobs from public, anon, authenticated;
revoke all on public.shared_saved_jobs from public, anon, authenticated;
grant select, insert, update, delete on public.shared_jobs to authenticated;
grant select, insert, update, delete on public.shared_saved_jobs to authenticated;

insert into public.shared_jobs (id, title, company, location, workplace, description, url)
select
  id,
  case when lower(title) = 'acccounting intern' then 'Accounting Intern' else title end,
  company,
  location,
  workplace,
  description,
  regexp_replace(url, '\?.*$', '')
from public.jobs
on conflict (url) do nothing;

insert into public.shared_jobs (title, company, location, workplace, description, url, tags)
values (
  'Finance and Operations Intern',
  'Proforest',
  'Jakarta',
  'On-site',
  'Three-month internship, January–March 2027. Support journal entries in Accurate, vendor and bank payment workflows, financial record-keeping, Excel reporting and project administration. Open to tertiary students in Economics, Management, Accounting or related fields; requires English, Bahasa Indonesia and MS Office. Apply by 30 November 2026; submit a CV and cover letter.',
  'https://jobs.smartrecruiters.com/Proforest/744000156761100-finance-and-operations-intern',
  array['Mahasiswa S1', 'Finance', 'Accounting', 'Excel']
)
on conflict (url) do nothing;
