import './style.css'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type Stage = 'saved' | 'applied' | 'interview' | 'closed'
type Job = { id: string; title: string; company: string; location: string; workplace: string; type: string; salary: string; posted: string; description: string; url: string; tags: string[]; accent: string }
type Saved = { job_id: string; stage: Stage; notes?: string }

const icon = (name: string, size = 18) => {
  const paths: Record<string, string> = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>', briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>', pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>', grad: '<path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c4 3 8 3 12 0v-5m4-2v6"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', link: '<path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/>', grid: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>', filter: '<path d="M4 7h16M7 12h10m-7 5h4"/><circle cx="8" cy="7" r="1"/><circle cx="15" cy="12" r="1"/>', settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6L8 16.2l1.4-1.1a7 7 0 0 1 0-2l-1.4-1.2 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.2a7 7 0 0 1 0 2Z" transform="translate(-2 -1)"/>', help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.6 1.4c-.7 1-2.2 1.3-2.2 3M12 17h.01"/>', spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3ZM19 14l1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z"/>', plus: '<path d="M12 5v14M5 12h14"/>', close: '<path d="m18 6-12 12M6 6l12 12"/>', send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>', external: '<path d="M14 3h7v7M10 14 21 3"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/>', check: '<path d="m5 12 4 4L19 6"/>', building: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 21V9h6v12M7 7h.01M17 7h.01M7 11h.01M17 11h.01"/>', down: '<path d="m7 10 5 5 5-5"/>', bookmark: '<path d="M6 4h12v17l-6-4-6 4V4Z"/>'
  }
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.search}</svg>`
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
let supabase: SupabaseClient | null = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null
const stageLabels: Record<Stage, string> = { saved: 'Tersimpan', applied: 'Dilamar', interview: 'Interview', closed: 'Selesai' }
const storageKey = 'magangrad:v1'
const state = { jobs: [] as Job[], saved: {} as Record<string, Stage>, query: '', activeTab: 'all', filter: 'Semua tipe', session: null as Awaited<ReturnType<NonNullable<typeof supabase>['auth']['getSession']>>['data']['session'] | null, modal: false, authModal: false }

const root = document.querySelector<HTMLDivElement>('#app')!
const localState = () => { try { const d = JSON.parse(localStorage.getItem(storageKey) || '{}'); state.jobs = d.jobs || []; state.saved = Object.fromEntries(Object.entries(d.saved || {}).filter(([id, stage]) => !id.startsWith('sample-') && ['saved', 'applied', 'interview', 'closed'].includes(String(stage)))) as Record<string, Stage> } catch { /* fresh local state */ } }
const saveLocal = () => localStorage.setItem(storageKey, JSON.stringify({ jobs: state.jobs, saved: state.saved }))
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
const liSearch = () => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(state.query || 'magang mahasiswa OR internship')}&location=Jabodetabek%2C%20Indonesia`

function render() {
  const q = state.query.toLowerCase()
  const jobs = state.jobs.filter(j => (state.activeTab !== 'saved' || state.saved[j.id]) && (state.filter === 'Semua tipe' || j.workplace === state.filter) && (!q || [j.title, j.company, j.location, ...j.tags].join(' ').toLowerCase().includes(q)))
  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" href="#"><span class="brand-mark">m<span>.</span></span><span>magang<span class="brand-light">rad</span><small>JOB HUNT, MADE SIMPLE</small></span></a>
        <div class="side-label">WORKSPACE</div>
        <button class="nav-item ${state.activeTab === 'all' ? 'active' : ''}" data-tab="all">${icon('grid')} <span>Semua lowongan</span><b>${state.jobs.length}</b></button>
        <button class="nav-item ${state.activeTab === 'saved' ? 'active' : ''}" data-tab="saved">${icon('bookmark')} <span>Disimpan</span><b>${Object.keys(state.saved).length}</b></button>
        <div class="side-label side-label-gap">PREFERENSI</div>
        <div class="preference-card"><div class="pref-icon">${icon('grad',16)}</div><div><strong>Mahasiswa S1</strong><span>Level pengalaman</span></div></div>
        <div class="preference-card"><div class="pref-icon green">${icon('pin',16)}</div><div><strong>Jabodetabek</strong><span>Lokasi kerja</span></div></div>
        <div class="sidebar-bottom"><div class="help-card"><div class="help-icon">${icon('help',17)}</div><strong>Mulai lebih siap</strong><p>Temukan magang pertamamu dengan langkah kecil setiap hari.</p><a href="https://www.linkedin.com/jobs/" target="_blank" rel="noreferrer">Tips pencarian ${icon('external',13)}</a></div><div class="profile"><div class="avatar">${state.session?.user.email?.[0]?.toUpperCase() || 'M'}</div><div class="profile-copy"><strong>${state.session ? esc(state.session.user.email || 'Akun') : 'Mode lokal'}</strong><span>${state.session ? 'Tersambung ke Supabase' : 'Data tersimpan di perangkat'}</span></div><button class="icon-button" id="auth-btn" aria-label="Akun">${icon('settings')}</button></div></div>
      </aside>
      <main class="main-content">
        <header class="topbar"><div class="breadcrumb"><span>Workspace</span><span class="slash">/</span><strong>Temukan magang</strong></div><div class="top-actions"><span class="status-dot"></span><span class="sync-label">${supabase ? 'Supabase siap' : 'Mode demo'}</span><button class="avatar mini-avatar" id="auth-btn-top">${state.session?.user.email?.[0]?.toUpperCase() || 'M'}</button></div></header>
        <section class="page-head"><div><div class="eyebrow"><span class="eyebrow-line"></span>LANGKAH PERTAMAMU DIMULAI DI SINI</div><h1>Temukan tempatmu<br>untuk <em>bertumbuh.</em></h1><p class="page-intro">Lowongan magang untuk mahasiswa S1 di Jabodetabek, dikurasi untuk awal kariermu.</p></div><div class="head-note"><div class="note-icon">${icon('spark',17)}</div><p><strong>Mulai dari rasa ingin tahu.</strong><br>Pengalaman pertama nggak harus sempurna.</p></div></section>
        <section class="search-panel"><label class="search-box">${icon('search',19)}<input id="search-input" placeholder="Jabatan, perusahaan, atau keahlian" value="${esc(state.query)}"><kbd>↵</kbd></label><div class="filter-wrap"><button class="filter-button" id="filter-toggle">${icon('filter',16)} ${esc(state.filter)} ${icon('down',13)}</button><div class="filter-menu hidden" id="filter-menu">${['Semua tipe','On-site','Hybrid','Remote'].map(x=>`<button data-filter="${x}">${x}</button>`).join('')}</div></div><a class="linkedin-search" href="${liSearch()}" target="_blank" rel="noreferrer">Cari di LinkedIn ${icon('external',15)}</a></section>
        <div class="section-row"><div><div class="section-kicker">PILIHAN UNTUKMU</div><h2>${state.activeTab === 'saved' ? 'Lowongan tersimpan' : 'Lowongan terbaru'} <span class="result-count">${jobs.length}</span></h2></div><button class="add-button" id="add-job">${icon('plus',17)} Tambah lowongan</button></div>
        <div class="tab-row"><button data-tab="all" class="tab ${state.activeTab === 'all' ? 'selected' : ''}">Semua <span>${state.jobs.length}</span></button><button data-tab="saved" class="tab ${state.activeTab === 'saved' ? 'selected' : ''}">Disimpan <span>${Object.keys(state.saved).length}</span></button><div class="tab-note">${icon('clock',14)} Diperbarui hari ini</div></div>
        <div class="job-list">${jobs.length ? jobs.map(jobCard).join('') : `<div class="empty-state"><div class="empty-icon">${icon(state.activeTab === 'saved' ? 'bookmark' : 'search',22)}</div><strong>${state.activeTab === 'saved' ? 'Belum ada lowongan tersimpan' : 'Belum ada lowongan yang cocok'}</strong><p>${state.activeTab === 'saved' ? 'Simpan lowongan yang menarik untuk dilihat lagi nanti.' : 'Coba kata kunci lain atau tambah lowongan dari pencarianmu.'}</p><button class="add-button" id="add-job">${icon('plus',17)} Tambah lowongan</button></div>`}</div>
        <footer class="page-footer"><span>Dirancang untuk langkah pertamamu.</span><span>Jabodetabek <span class="footer-dot">•</span> Indonesia</span></footer>
      </main>
      <aside class="right-rail"><div class="rail-top"><span class="rail-label">RINGKASAN MINGGU INI</span><span class="week-badge">MINGGU INI</span></div><div class="stat"><span>Total lowongan</span><strong>${state.jobs.length}</strong><small>yang tersedia di sini</small></div><div class="stat"><span>Disimpan</span><strong>${Object.keys(state.saved).length}</strong><small>untuk ditinjau kembali</small></div><div class="rail-divider"></div><div class="rail-label">PREFERENSI PENCARIAN</div><div class="search-pref"><div class="pref-icon">${icon('grad',15)}</div><div><strong>Internship / Magang</strong><span>Mahasiswa S1 · Entry level</span></div></div><div class="search-pref"><div class="pref-icon green">${icon('pin',15)}</div><div><strong>Jabodetabek</strong><span>Jakarta & sekitarnya</span></div></div><div class="rail-tip"><div class="tip-spark">${icon('spark',15)}</div><div class="rail-label">CATATAN KECIL</div><p>Sesuaikan profil LinkedIn-mu dengan posisi yang kamu incar. Ceritakan apa yang sedang kamu pelajari.</p></div><div class="data-note"><span class="status-dot"></span>${supabase ? 'Terhubung ke Supabase' : 'Mode contoh · tersimpan di perangkat'}</div></aside>
    </div>
    <div class="modal-backdrop ${state.modal ? '' : 'hidden'}" id="job-modal"><div class="modal"><button class="modal-close" data-close>${icon('close')}</button><div class="eyebrow">CATAT LOWONGAN</div><h3>Tambahkan kesempatan baru</h3><p class="modal-sub">Lowongan, tahapan, dan catatan dibagikan ke semua akun yang masuk.</p><form id="job-form"><label>Nama posisi<input name="title" required placeholder="Contoh: Finance Intern"></label><label>Perusahaan<input name="company" required placeholder="Nama perusahaan"></label><div class="form-grid"><label>Lokasi<input name="location" required placeholder="Jakarta Selatan"></label><label>Model kerja<select name="workplace"><option>On-site</option><option>Hybrid</option><option>Remote</option></select></label></div><label>Tautan lowongan<input name="url" type="url" pattern="https://.+" title="Gunakan tautan aman yang dimulai dengan https://." required placeholder="https://.../internship"></label><label>Catatan / deskripsi<textarea name="description" rows="3" placeholder="Kualifikasi, periode, deadline, atau catatan"></textarea></label><button class="submit-button" type="submit">${icon('check',16)} Simpan lowongan</button></form><p class="privacy-note">${icon('link',13)} Tautan akan dibuka langsung ke halaman rekrutmen.</p></div></div>
    <div class="modal-backdrop ${state.authModal ? '' : 'hidden'}" id="auth-modal"><div class="modal auth-modal"><button class="modal-close" data-close>${icon('close')}</button><div class="eyebrow">${supabase ? 'SINKRONISASI' : 'PENGATURAN'}</div><h3>${state.session ? 'Akun tersambung' : supabase ? 'Simpan progresmu' : 'Hubungkan Supabase'}</h3><p class="modal-sub">${state.session ? `Masuk sebagai ${esc(state.session.user.email || '')}` : supabase ? 'Masuk lewat tautan sekali pakai yang kami kirim ke emailmu.' : 'Atur URL dan publishable key Supabase di file .env untuk sinkronisasi lintas perangkat.'}</p>${state.session ? `<button class="submit-button secondary" id="sign-out">Keluar</button>` : supabase ? `<form id="auth-form"><label>Email<input type="email" name="email" required placeholder="nama@email.com"></label><button class="submit-button" type="submit">${icon('send',16)} Kirim tautan masuk</button></form>` : `<div class="config-hint"><code>VITE_SUPABASE_URL</code><code>VITE_SUPABASE_PUBLISHABLE_KEY</code></div><p class="privacy-note">Tanpa konfigurasi, progres disimpan di browser ini saja.</p>`}<div id="auth-message" class="auth-message"></div></div></div>
    <div class="toast hidden" id="toast"></div>`
  bind();
}

function jobCard(j: Job) {
  return `<article class="job-card"><div class="company-logo ${j.accent}">${esc(j.company.slice(0,1))}</div><div class="job-main"><div class="job-topline"><div><h3>${esc(j.title)}</h3><div class="company-line">${esc(j.company)}</div></div><button class="save-button ${state.saved[j.id] ? 'is-saved' : ''}" data-save="${esc(j.id)}" aria-label="Simpan lowongan">${icon('bookmark',18)}</button></div><div class="job-meta"><span>${icon('pin',14)} ${esc(j.location)}</span><span class="meta-sep">·</span><span>${esc(j.workplace)}</span><span class="meta-sep">·</span><span>${esc(j.type)}</span><span class="meta-sep">·</span><span>${icon('clock',13)} ${esc(j.posted)}</span></div><p class="job-description">${esc(j.description)}</p><div class="tag-row">${j.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}<span class="salary">${esc(j.salary)}</span></div></div><div class="job-actions"><a href="${esc(j.url)}" target="_blank" rel="noreferrer" class="view-job">Lihat lowongan ${icon('external',14)}</a><div class="job-action-bottom"><span class="job-source">${new URL(j.url).hostname.includes('linkedin.com') ? 'LINKEDIN' : 'SUMBER RESMI'}</span>${state.saved[j.id] ? `<select class="stage-select" data-stage="${esc(j.id)}" aria-label="Tahap lamaran">${Object.entries(stageLabels).map(([key, label]) => `<option value="${key}" ${state.saved[j.id] === key ? 'selected' : ''}>${label}</option>`).join('')}</select>` : ''}</div></div></article>`
}

function showToast(message: string) { const el = document.querySelector('#toast')!; el.textContent = message; el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 2600) }
function bind() {
  document.querySelectorAll<HTMLElement>('[data-tab]').forEach(el => el.onclick = () => { state.activeTab = el.dataset.tab || 'all'; render() })
  const search = document.querySelector<HTMLInputElement>('#search-input')
  search?.addEventListener('input', () => { const p = search.selectionStart; state.query = search.value; render(); const next = document.querySelector<HTMLInputElement>('#search-input')!; next.focus(); next.setSelectionRange(p, p) })
  document.querySelector('#filter-toggle')?.addEventListener('click', () => document.querySelector('#filter-menu')?.classList.toggle('hidden'))
  document.querySelectorAll<HTMLElement>('[data-filter]').forEach(el => el.onclick = () => { state.filter = el.dataset.filter || 'Semua tipe'; render() })
  document.querySelectorAll<HTMLElement>('[data-save]').forEach(el => el.onclick = async () => {
    const id = el.dataset.save!; if (state.saved[id]) delete state.saved[id]; else state.saved[id] = 'saved'; saveLocal()
    if (supabase && state.session) { const result = state.saved[id] ? await supabase.from('shared_saved_jobs').upsert({ job_id: id, stage: 'saved' }) : await supabase.from('shared_saved_jobs').delete().eq('job_id', id); if (result.error) showToast('Perubahan lokal tersimpan; sinkronisasi gagal.') }
    render()
  })
  document.querySelectorAll<HTMLSelectElement>('[data-stage]').forEach(el => el.onchange = async () => {
    const id = el.dataset.stage!; const stage = el.value as Stage; state.saved[id] = stage; saveLocal()
    if (supabase && state.session) { const { error } = await supabase.from('shared_saved_jobs').upsert({ job_id: id, stage }); if (error) showToast('Tahap disimpan di perangkat, sinkronisasi gagal.') }
    render()
  })
  document.querySelectorAll<HTMLElement>('#add-job').forEach(el => el.onclick = () => { state.modal = true; render() })
  document.querySelectorAll<HTMLElement>('#auth-btn,#auth-btn-top').forEach(el => el.onclick = () => { state.authModal = true; render() })
  document.querySelectorAll<HTMLElement>('[data-close]').forEach(el => el.onclick = () => { state.modal = false; state.authModal = false; render() })
  document.querySelectorAll<HTMLElement>('.modal-backdrop').forEach(el => el.addEventListener('click', e => { if (e.target === el) { state.modal = false; state.authModal = false; render() } }))
  document.querySelector<HTMLFormElement>('#job-form')?.addEventListener('submit', async e => { e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); const job: Job = { id: crypto.randomUUID(), title: String(f.get('title')), company: String(f.get('company')), location: String(f.get('location')), workplace: String(f.get('workplace')), type: 'Magang', salary: 'Belum dicantumkan', posted: 'Baru ditambahkan', description: String(f.get('description') || 'Lowongan yang kamu catat.'), url: String(f.get('url')), tags: ['Mahasiswa S1', 'Magang'], accent: 'mint' }
    if (supabase && state.session) { const { error } = await supabase.from('shared_jobs').insert({ id: job.id, title: job.title, company: job.company, location: job.location, workplace: job.workplace, description: job.description, url: job.url, tags: job.tags }); if (error) { showToast(error.code === '23505' ? 'Lowongan ini sudah ada di daftar bersama.' : `Gagal menyimpan: ${error.message}`); return } }
    state.jobs.unshift(job); saveLocal(); state.modal = false; render(); showToast('Lowongan berhasil dicatat.')
  })
  document.querySelector<HTMLFormElement>('#auth-form')?.addEventListener('submit', async e => { e.preventDefault(); if (!supabase) return; const email = String(new FormData(e.currentTarget as HTMLFormElement).get('email')); const button = (e.currentTarget as HTMLFormElement).querySelector('button')!; button.disabled = true; const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } }); button.disabled = false; document.querySelector('#auth-message')!.textContent = error ? error.message : 'Tautan masuk sudah dikirim. Cek kotak masuk emailmu.' })
  document.querySelector('#sign-out')?.addEventListener('click', async () => { await supabase?.auth.signOut(); state.session = null; state.authModal = false; render(); showToast('Kamu sudah keluar.') })
}

async function syncCloudData() {
  if (!supabase || !state.session) return
  const { data: rows } = await supabase.from('shared_jobs').select('*').order('created_at', { ascending: false }).limit(100)
  const known = new Set((rows || []).map(j => j.id))
  const knownUrls = new Set((rows || []).map(j => j.url))
  const offline = state.jobs.filter(j => !known.has(j.id) && !knownUrls.has(j.url))
  if (offline.length) {
    const { error } = await supabase.from('shared_jobs').upsert(offline.map(j => ({ id: j.id, title: j.title, company: j.company, location: j.location, workplace: j.workplace, description: j.description, url: j.url, tags: j.tags })), { onConflict: 'url', ignoreDuplicates: true })
    if (error) showToast('Beberapa lowongan lokal belum tersinkron.')
  }
  const { data: freshRows } = await supabase.from('shared_jobs').select('*').order('created_at', { ascending: false }).limit(100)
  if (freshRows) {
    const existing = new Set(state.jobs.map(j => j.id))
    const existingUrls = new Set(state.jobs.map(j => j.url))
    const incoming = freshRows.filter(j => !existing.has(j.id) && !existingUrls.has(j.url)).map(j => ({ ...j, type: 'Magang', salary: 'Belum dicantumkan', posted: 'Baru ditambahkan', tags: j.tags || ['Mahasiswa S1', 'Magang'], accent: 'mint' } as Job))
    state.jobs = [...incoming, ...state.jobs]
  }
  const { data: saved } = await supabase.from('shared_saved_jobs').select('job_id,stage')
  if (saved) saved.forEach((s: Saved) => { state.saved[s.job_id] = s.stage })
  const localSaved = Object.entries(state.saved).filter(([id]) => !saved?.some(s => s.job_id === id))
  if (localSaved.length) {
    const { error } = await supabase.from('shared_saved_jobs').upsert(localSaved.map(([job_id, stage]) => ({ job_id, stage })))
    if (error) showToast('Beberapa lowongan tersimpan belum tersinkron.')
  }
  saveLocal()
}

async function start() {
  if (!supabase) {
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const config = await response.json() as { supabaseUrl?: string; publishableKey?: string }
        if (config.supabaseUrl && config.publishableKey) supabase = createClient(config.supabaseUrl, config.publishableKey)
      }
    } catch { /* use local-only mode when the runtime config is unavailable */ }
  }
  localState()
  if (supabase) {
    const { data } = await supabase.auth.getSession(); state.session = data.session
    supabase.auth.onAuthStateChange((_event, session) => { state.session = session; if (session) void syncCloudData().then(render); else render() })
    if (state.session) await syncCloudData()
  }
  render()
}

start()
