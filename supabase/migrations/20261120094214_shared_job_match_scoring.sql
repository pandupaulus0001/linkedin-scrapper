alter table public.shared_jobs
  add column if not exists match_score integer check (match_score between 0 and 100),
  add column if not exists match_level text check (match_level in ('strong', 'possible', 'stretch')),
  add column if not exists match_reason text not null default '',
  add column if not exists match_caveat text not null default '';

update public.shared_jobs
set match_score = 43,
    match_level = 'stretch',
    match_reason = 'Pengalaman treasury dan administrasi keuangan relevan untuk tugas accounting support.',
    match_caveat = 'Lowongan meminta mahasiswa tingkat akhir atau lulusan; Maria masih semester 5. Cek kembali syarat dan status lowongan sebelum melamar.'
where url like '%linkedin.com/jobs/view/4491298581%';

update public.shared_jobs
set match_score = 89,
    match_level = 'strong',
    match_reason = 'Terbuka untuk mahasiswa bidang terkait; tugas finance operations, pencatatan, pembayaran, dan laporan Excel selaras dengan fokus finance serta pengalaman treasury Maria. Periode Jan–Mar 2027 masuk dalam ketersediaannya.',
    match_caveat = 'Peran on-site di Jakarta dan meminta Accurate serta kemampuan bahasa Inggris; pastikan kesiapan perjalanan dan siapkan contoh kemampuan Excel/finance.'
where url = 'https://jobs.smartrecruiters.com/Proforest/744000156761100-finance-and-operations-intern';

insert into public.shared_jobs
  (title, company, location, workplace, description, url, tags, match_score, match_level, match_reason, match_caveat)
values
  (
    'Finance Reporting Intern (Next Level Internship)', 'Mekari', 'Gambir, Jakarta', 'On-site',
    'Mendukung financial reporting: menyiapkan dokumen dan data untuk audit internal/eksternal, persiapan PSAK 71–72, analisis angka bulanan, serta konsolidasi. Terbuka bagi mahasiswa aktif di Indonesia; periode magang minimal 3 bulan.',
    'https://id.linkedin.com/jobs/view/finance-reporting-intern-next-level-internship-at-mekari-4476442675',
    array['Finance Reporting', 'Audit Support', 'Mahasiswa Aktif', 'Minimal 3 Bulan'],
    84, 'strong',
    'Mahasiswa aktif diperbolehkan dan pengalaman finance/administrasi serta Excel relevan untuk pekerjaan pelaporan dan penyiapan data.',
    'Lowongan menandai jenis kerja sebagai sukarelawan; cek kompensasi, jadwal mulai, dan penempatan tim sebelum melamar.'
  ),
  (
    'Accounting Intern (Period: Dec 26)', 'PT Surya Semesta Internusa', 'Jakarta', 'On-site',
    'Mendukung transaksi pembayaran, laporan keuangan, rekonsiliasi bank, accounts payable/receivable, dan pengarsipan. Syarat yang tercantum: mahasiswa/lulusan baru jurusan Accounting, Excel, dan magang WFO selama 3 bulan; periode tercantum Desember 2026.',
    'https://id.linkedin.com/jobs/view/accounting-intern-period-dec-26-at-pt-surya-semesta-internusa-tbk-4491158388',
    array['Accounting', 'Finance Operations', 'Excel', 'Rekonsiliasi'],
    48, 'stretch',
    'Tugas pembayaran, rekonsiliasi, AP/AR, dan pelaporan dekat dengan pengalaman finance support Maria.',
    'Syarat jurusan Accounting tidak sama dengan Business Administration; periode Desember mendahului ketersediaan Maria pada 4 Januari. Konfirmasi apakah posisi masih menerima aplikasi.'
  ),
  (
    'Finance & Accounting Intern - AIHO', 'PT Astra International Tbk', 'Sunter, Jakarta Utara', 'On-site',
    'Mendukung finance operations, AR, rekonsiliasi bank, closing, pelaporan, dan audit dengan SAP. Lowongan meminta mahasiswa aktif S1 jurusan Accounting, WFO, periode November 2026–Juli 2027.',
    'https://id.linkedin.com/jobs/view/finance-accounting-intern-aiho-at-pt-astra-international-tbk-4485320274',
    array['Finance Operations', 'Accounting', 'AR', 'Reporting', 'SAP'],
    42, 'stretch',
    'Tugas AR, rekonsiliasi, administrasi, dan reporting relevan dengan pengalaman keuangan Maria.',
    'Syarat jurusan Accounting dan periode Nov 2026–Jul 2027 tidak sejalan dengan jurusan serta ketersediaan Jan–Mei 2027 Maria.'
  )
on conflict (url) do update set
  title = excluded.title,
  company = excluded.company,
  location = excluded.location,
  workplace = excluded.workplace,
  description = excluded.description,
  tags = excluded.tags,
  match_score = excluded.match_score,
  match_level = excluded.match_level,
  match_reason = excluded.match_reason,
  match_caveat = excluded.match_caveat;
