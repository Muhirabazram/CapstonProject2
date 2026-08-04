# DESIGN.md — Sistem Pengelolaan Administrasi Surat STMIK Bandung

> Dokumen ini menjelaskan arsitektur, desain, dan konvensi proyek secara menyeluruh sehingga AI lain (atau developer baru) dapat langsung memahami dan melanjutkan pengembangan tanpa kebingungan.

---

## 1. Gambaran Umum Proyek

**Nama Sistem**: Sistem Pengelolaan Administrasi Surat Mahasiswa STMIK Bandung  
**Tujuan**: Memfasilitasi pengajuan surat akademik secara digital oleh mahasiswa, dan pengelolaan/verifikasi surat oleh admin tata usaha.  
**Status Saat Ini**: Frontend selesai (static HTML/CSS/JS). Backend belum dibangun.  
**Hosting**: GitHub Pages — `https://github.com/Muhirabazram/CapstonProject2`

---

## 2. Aktor & Alur Sistem

### Aktor
| Aktor | Deskripsi |
|-------|-----------|
| **Mahasiswa** | Mengajukan surat, memantau status, mengunduh surat jika selesai |
| **Admin** | Memverifikasi dokumen, mengupdate status, mengelola kategori surat, mengimpor data mahasiswa |

### Alur Kerja
```
Mahasiswa Login
  └─► Pilih Jenis Surat (dari kategori yang dibuat Admin)
       └─► Isi Form + Upload Dokumen Prasyarat (KTM, KRS, dll)
            └─► Pengajuan masuk ke daftar Admin
                 └─► Admin verifikasi prasyarat
                      ├─► Setujui → Status: "Diproses"
                      ├─► Selesai → Status: "Selesai" + Mahasiswa bisa unduh PDF
                      └─► Tolak   → Status: "Ditolak" + Catatan alasan

Admin Login
  └─► Kelola Kategori Surat (CRUD: nama, prasyarat, template format)
  └─► Kelola Pengajuan Surat (lihat, update status, beri catatan)
  └─► Kelola Data Mahasiswa (impor via Excel/CSV)
```

---

## 3. Struktur Folder

```
Capston Project/
├── Frontend/
│   ├── index.html                  # Halaman Login (entry point)
│   ├── admin-dashboard.html        # Halaman Dashboard Admin (SPA-like)
│   ├── mahasiswa-dashboard.html    # Halaman Dashboard Mahasiswa (SPA-like)
│   └── assets/
│       ├── css/
│       │   └── style.css           # SATU file CSS global (design system + layout + responsive)
│       ├── js/
│       │   └── app.js              # SATU file JS global (navigasi, modal, sidebar, login)
│       └── img/
│           ├── logo-kampus.png     # Logo STMIK Bandung (788x480px, format PNG)
│           └── bg-login.jpg        # Background foto halaman login
├── Backend/                        # KOSONG — belum dibangun
└── DESIGN.md                       # Dokumen ini
```

---

## 4. Penjelasan Setiap File

### `Frontend/index.html` — Halaman Login
- **Tujuan**: Entry point. Semua pengguna login dari sini.
- **Komponen**: Logo kampus (140px), form login (NPM/Username, Password, Dropdown Role), tombol submit.
- **Logika**: Form submit ditangani `app.js`. Jika role = `admin` → redirect ke `admin-dashboard.html`. Jika role = `mahasiswa` → redirect ke `mahasiswa-dashboard.html`.
- **Autentikasi**: Saat ini **simulasi** (timeout 1 detik lalu redirect). Belum ada validasi real terhadap backend.
- **Desain**: Glassmorphism card di atas background foto kampus dengan overlay gelap.

---

### `Frontend/admin-dashboard.html` — Dashboard Admin
- **Pola**: **Single Page Application (SPA) simulasi**. Semua view ada dalam satu file HTML; navigasi menampilkan/menyembunyikan section melalui class `.view-section.active`.
- **Layout**: `div.dashboard-layout` (flex row) → `aside.sidebar` + `main.main-content`

#### View Sections (fitur Admin):
| ID Element | Fitur | Deskripsi |
|---|---|---|
| `#view-dashboard` | Dashboard | Statistik ringkasan (Total Pengajuan, Menunggu, Selesai) + tabel pengajuan terbaru |
| `#view-kategori` | Kategori Surat | Tabel daftar kategori; tombol "+ Tambah Kategori" membuka modal |
| `#view-pengajuan` | Pengajuan Surat | Tabel semua pengajuan + filter status; tombol "Update Status" membuka modal |
| `#view-mahasiswa` | Data Mahasiswa | Tabel data mahasiswa; tombol "Import Data (Excel)" membuka modal |

#### Modal yang tersedia (Admin):
- `#modal-tambah-kategori` — Form tambah kategori surat baru
- `#modal-update-status` — Form update status pengajuan + lihat dokumen
- `#modal-import-mahasiswa` — Upload file Excel/CSV

---

### `Frontend/mahasiswa-dashboard.html` — Dashboard Mahasiswa
- **Pola**: Sama seperti admin — SPA simulasi dengan view sections.
- **Layout**: Identik (`dashboard-layout` → `sidebar` + `main-content`)

#### View Sections (fitur Mahasiswa):
| ID Element | Fitur | Deskripsi |
|---|---|---|
| `#view-dashboard` | Dashboard | Kartu "Pengajuan Terakhir" + "Status Saat Ini" + Pengumuman sistem |
| `#view-ajukan` | Ajukan Surat Baru | Form pengajuan: pilih kategori, keterangan, upload KTM & KRS |
| `#view-riwayat` | Riwayat Pengajuan | Tabel semua riwayat + status badge + tombol unduh PDF (jika selesai) |

#### Modal yang tersedia (Mahasiswa):
- `#modal-sukses` — Konfirmasi sukses setelah pengajuan dikirim

---

### `Frontend/assets/css/style.css` — Design System Global

File CSS tunggal. Struktur di dalamnya:

| Bagian | Isi |
|--------|-----|
| `@import` | Google Fonts: **Inter** (300,400,500,600,700) |
| `:root` variables | Semua design token (warna, shadow, radius, transition) |
| Reset & Base | `* { box-sizing }`, `body`, `a`, `ul` |
| Utility Classes | `.flex`, `.gap-2`, `.text-center`, `.mb-4`, dll |
| Typography | `h1-h6` sizing |
| Buttons | `.btn`, `.btn-primary`, `.btn-outline`, `.btn-danger`, `.btn-success`, `.btn-block` |
| Forms | `.form-group`, `.form-label`, `.form-control`, `.form-select` |
| Auth Page | `.auth-layout`, `.auth-card`, `.auth-header` |
| Dashboard Layout | `.dashboard-layout`, `.sidebar`, `.main-content` |
| Sidebar Components | `.sidebar-header`, `.sidebar-profile`, `.sidebar-nav`, `.nav-link`, `.nav-section-title` |
| Topbar | `.topbar`, `.topbar-right`, `.user-profile`, `.avatar` |
| Content | `.content-area`, `.page-header` |
| Cards & Stats | `.stats-grid`, `.stat-card`, `.stat-info`, `.stat-icon` |
| Table | `.card`, `.card-header`, `.table`, `.table-responsive` |
| Badges | `.badge-pending`, `.badge-process`, `.badge-success`, `.badge-danger` |
| Modals | `.modal-overlay`, `.modal-content`, `.modal-header`, `.modal-body`, `.modal-footer` |
| View Toggle | `.view-section`, `.view-section.active` |
| Animations | `@keyframes fadeIn` |
| Logo & Menu Toggle | `.logo-img`, `.menu-toggle`, `.sidebar-overlay` |
| Footer | `.footer`, `.footer-top`, `.footer-bottom`, `.footer-links` |
| Responsive (`@media ≤768px`) | Sidebar berubah menjadi off-canvas slide-in; tombol hamburger muncul |

---

### `Frontend/assets/js/app.js` — JavaScript Global

File JS tunggal. Semua fungsi diinisialisasi dalam `DOMContentLoaded`:

| Fungsi | Cara Kerja |
|--------|-----------|
| **Navigasi SPA** | Klik `.sidebar-nav .nav-link[data-target]` → tampilkan `#[data-target]`, sembunyikan lainnya, update `.active` class, update teks `#topbar-title` dari atribut `data-title` |
| **Logout** | `#logoutBtn` → `window.location.href = 'index.html'` |
| **Modal Open** | `[data-modal-target="id"]` → tambah class `.active` ke modal target |
| **Modal Close** | `[data-modal-close]` atau klik overlay → hapus class `.active` |
| **Sidebar Mobile** | `#menuToggle` klik → toggle `.active` pada `#sidebar` dan `#sidebarOverlay`; klik nav link di mobile otomatis tutup sidebar |
| **Login Form** | Submit `#loginForm` → baca `#roleSelect` → simulasi loading 1 detik → redirect ke halaman dashboard sesuai role |

---

## 5. Design System (Token CSS)

### Palet Warna
| Token | Nilai | Kegunaan |
|-------|-------|---------|
| `--primary-color` | `#4f46e5` (Indigo 600) | Warna utama: tombol, link aktif, nama user |
| `--primary-hover` | `#4338ca` (Indigo 700) | Hover state tombol primary |
| `--secondary-color` | `#0ea5e9` (Sky 500) | Aksen sekunder, info |
| `--bg-body` | `#f8fafc` (Slate 50) | Background halaman |
| `--bg-card` | `#ffffff` | Background sidebar & card |
| `--bg-sidebar` | `#0f172a` | (Tidak aktif digunakan saat ini, sidebar sudah putih) |
| `--text-main` | `#0f172a` | Teks utama |
| `--text-muted` | `#64748b` | Teks sekunder/deskripsi |
| `--status-pending` | `#f59e0b` | Badge: Diterima/Menunggu |
| `--status-process` | `#3b82f6` | Badge: Diproses |
| `--status-success` | `#10b981` | Badge: Selesai |
| `--status-rejected` | `#ef4444` | Badge: Ditolak / tombol Keluar |

### Tipografi
- **Font**: Inter (Google Fonts)
- `h1` = 2.25rem, `h2` = 1.5rem, `h3` = 1.25rem

### Breakpoint Responsif
- `@media (max-width: 768px)` — Sidebar menjadi off-canvas, tombol hamburger muncul di topbar

---

## 6. Konvensi Penamaan & Pola HTML

### Pola SPA (navigasi antar view)
```html
<!-- Di sidebar: -->
<a href="#" class="nav-link" data-target="view-kategori" data-title="Kategori Surat">
  Kategori Surat
</a>

<!-- Di konten utama: -->
<div id="view-kategori" class="view-section">
  <!-- konten fitur ini -->
</div>
```
- `data-target` = ID dari section yang akan ditampilkan
- `data-title` = teks yang akan muncul di `#topbar-title`
- View tersembunyi default (`display: none`), ditampilkan jika memiliki class `.active`

### Pola Modal
```html
<!-- Trigger: -->
<button data-modal-target="modal-tambah-kategori">Buka Modal</button>

<!-- Modal: -->
<div class="modal-overlay" id="modal-tambah-kategori">
  <div class="modal-content">
    <div class="modal-header">...</div>
    <div class="modal-body">...</div>
    <div class="modal-footer">
      <button data-modal-close>Tutup</button>
    </div>
  </div>
</div>
```

### Pola Badge Status
```html
<span class="badge badge-pending">Diterima</span>
<span class="badge badge-process">Diproses</span>
<span class="badge badge-success">Selesai</span>
<span class="badge badge-danger">Ditolak</span>
```

---

## 7. Gambar & Aset

| File | Ukuran | Kegunaan |
|------|--------|---------|
| `assets/img/logo-kampus.png` | ~125 KB, 788×480px | Logo STMIK Bandung. Ditampilkan di: login (140px), sidebar header (center, max-width dari CSS), footer |
| `assets/img/bg-login.jpg` | ~144 KB | Background foto halaman login. Diberi overlay gelap `rgba(15,23,42,0.6)` via CSS pseudo-element `::before` |

---

## 8. Status Pengembangan

| Area | Status | Catatan |
|------|--------|---------|
| Halaman Login | ✅ Selesai | Simulasi, belum koneksi backend |
| Dashboard Admin | ✅ Selesai | Data dummy/statis |
| Dashboard Mahasiswa | ✅ Selesai | Data dummy/statis |
| Responsif Mobile | ✅ Selesai | Off-canvas sidebar + hamburger menu |
| Backend (API) | ❌ Belum dibuat | Folder `Backend/` masih kosong |
| Autentikasi Real | ❌ Belum | Perlu JWT/session dari backend |
| Database | ❌ Belum | Belum ditentukan teknologinya |
| Upload File (real) | ❌ Belum | Saat ini hanya UI |
| Unduh PDF | ❌ Belum | Saat ini hanya tombol placeholder |

---

## 9. Panduan untuk Pengembangan Lanjutan

### Jika ingin menambah fitur baru di Admin Dashboard:
1. Tambah `<li>` nav-link baru di sidebar `admin-dashboard.html` dengan `data-target="view-namafitur"` dan `data-title="Nama Fitur"`
2. Tambah `<div id="view-namafitur" class="view-section">` di dalam `.content-area`
3. Tidak perlu ubah `app.js` — navigasi sudah otomatis

### Jika ingin menambah Backend:
- Letakkan semua file backend di folder `Backend/`
- Rekomendasikan menggunakan REST API (Node.js/Express, Laravel, atau Python/FastAPI)
- Endpoint yang dibutuhkan:
  - `POST /api/auth/login` — autentikasi
  - `GET/POST/PUT/DELETE /api/kategori` — CRUD kategori surat
  - `GET/POST/PUT /api/pengajuan` — pengajuan surat
  - `GET/POST /api/mahasiswa` — data mahasiswa
  - `GET /api/surat/:id/download` — unduh PDF surat

### Jika ingin mengganti warna tema:
- Cukup ubah variabel di `:root` di `style.css`
- `--primary-color` adalah warna dominan yang memengaruhi sebagian besar elemen

---

## 10. Informasi Repositori

- **GitHub**: https://github.com/Muhirabazram/CapstonProject2
- **Branch aktif**: `main`
- **GitHub Pages**: Aktif (file `Frontend/` dapat diakses publik)
- **Institusi**: STMIK Bandung
- **Mata Kuliah**: Capstone Project, Semester 4
