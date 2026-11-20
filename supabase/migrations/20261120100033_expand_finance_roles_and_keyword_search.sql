insert into public.shared_jobs
  (title, company, location, workplace, description, url, tags, match_score, match_level, match_reason, match_caveat)
values
  (
    'Finance Intern', 'IDSP TAX LAW FIRM', 'Jakarta Selatan', 'On-site',
    'Membantu administrasi finance dan accounting dasar di firma pajak. Kandidat undergraduate yang telah menyelesaikan minimal 5 semester dari Accounting, Finance, Taxation, Management, atau bidang terkait dapat melamar.',
    'https://id.linkedin.com/jobs/view/finance-intern-at-idsp-tax-law-firm-4424349220',
    array['Finance Administration', 'Accounting Basics', 'Excel', '5 Semester Minimum'], 86, 'strong',
    'Persyaratan semester minimum 5 dan jurusan Management/related match dengan status studi Business Administration finance. Excel dan administrasi finance juga relevan.',
    'Posting berusia sekitar 4 bulan. Pastikan formulir pendaftaran masih menerima lamaran; durasi program dan tanggal mulai tidak dijelaskan.'
  ),
  (
    'Finance Operations Intern', 'M+C Saatchi Performance', 'Jakarta', 'On-site',
    'Mendukung rekonsiliasi klien, akurasi billing, pengelolaan invoice bulanan, dan pertanyaan AP. Internship 3 bulan.',
    'https://id.linkedin.com/jobs/view/finance-operations-intern-at-m%2Bc-saatchi-performance-4459327044',
    array['Finance Operations', 'Reconciliation', 'Billing', '3 Bulan'], 51, 'stretch',
    'Rekonsiliasi, invoice, dan Excel berdekatan dengan pengalaman finance support; periode 3 bulan sesuai dengan jendela Jan–Mei.',
    'Posting menyebut fresh graduate jurusan Accounting/Finance atau setara; Maria masih mahasiswa aktif. Posisi full-time dan meminta bahasa Inggris.'
  ),
  (
    'Finance Intern', 'Laku6.com', 'Jakarta', 'On-site',
    'Membantu review laporan keuangan dan ledger, analisis varians, rekonsiliasi antar perusahaan, laporan manajemen bulanan, perbaikan proses, dan kontrol internal.',
    'https://id.linkedin.com/jobs/view/finance-intern-at-laku6-com-4476547366',
    array['Finance Operations', 'Financial Analysis', 'Reporting', 'E-commerce'], 65, 'possible',
    'Terbuka untuk full-time student jurusan Accounting, Finance, atau bidang serupa; tugas finance operations, Excel, analisis, dan reporting relevan.',
    'Komitmen wajib 6 bulan, lebih panjang dari ketersediaan CV sekitar 4,5 bulan. Perlu memastikan apakah periode dapat diperpanjang.'
  ),
  (
    'FI Billing Intern', 'PT SMART Tbk', 'Jakarta', 'On-site',
    'Memeriksa dokumen billing, memperbarui AR Aging di SAP, melampirkan invoice, menyiapkan dokumen pengiriman tagihan, dan menjaga catatan billing.',
    'https://id.linkedin.com/jobs/view/fi-billing-intern-at-pt-smart-tbk-4489292450',
    array['Billing', 'Accounts Receivable', 'SAP', 'Finance Administration'], 45, 'stretch',
    'Administrasi invoice, dokumen keuangan, Excel, dan AR berkaitan dengan pengalaman finance support.',
    'Meminta mahasiswa tingkat akhir tanpa kelas atau lulusan baru dari Economics/Accounting/Finance, tersedia segera, dan magang WFO 6 bulan.'
  ),
  (
    'Finance Administration Intern (6 Months)', 'PT Lion Super Indo', 'Pancoran, Jakarta Selatan', 'On-site',
    'Membantu data administrasi, laporan sederhana, input payment, pemeriksaan dan pengarsipan dokumen finance. Terbuka bagi mahasiswa aktif semua jurusan, khususnya Management dan Accounting.',
    'https://id.linkedin.com/jobs/view/finance-administration-intern-6-months-at-pt-lion-super-indo-4482925204',
    array['Finance Administration', 'Payment', 'Excel', 'Mahasiswa Aktif'], 63, 'possible',
    'Terbuka untuk mahasiswa aktif semua jurusan; tugas administrasi, payment, dokumen keuangan, dan Excel cukup sejalan dengan pengalaman Maria.',
    'WFO Senin–Jumat di Pancoran dengan komitmen 6 bulan, lebih panjang dari ketersediaan CV sekitar 4,5 bulan. Konfirmasi kemungkinan jadwal lain.'
  ),
  (
    'Finance Apprentice', 'HAVI', 'Pondok Ungu, Kota Bekasi', 'On-site',
    'Membantu dokumentasi keuangan, verifikasi invoice, pembayaran vendor, pencatatan dan rekonsiliasi transaksi, laporan rutin, pajak, kontrol internal, dan perbaikan proses.',
    'https://id.linkedin.com/jobs/view/finance-apprentice-at-havi-4464417996',
    array['Finance Operations', 'Invoice', 'Reconciliation', 'Reporting', 'Bekasi'], 50, 'stretch',
    'Rangkaian tugas finance operations dan reporting sangat berdekatan dengan pengalaman serta fokus studi Maria.',
    'Syaratnya mahasiswa tingkat akhir atau lulusan baru jurusan Accounting/Finance/Economics/bidang terkait; Maria masih semester 5. Jadwal program tidak disebutkan.'
  )
on conflict (url) do update set
  title = excluded.title, company = excluded.company, location = excluded.location,
  workplace = excluded.workplace, description = excluded.description, tags = excluded.tags,
  match_score = excluded.match_score, match_level = excluded.match_level,
  match_reason = excluded.match_reason, match_caveat = excluded.match_caveat;

