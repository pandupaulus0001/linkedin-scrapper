create index if not exists jobs_user_id_created_at_idx
  on public.jobs (user_id, created_at desc);

create index if not exists saved_jobs_job_id_idx
  on public.saved_jobs (job_id);

revoke execute on function public.rls_auto_enable()
  from public, anon, authenticated;
