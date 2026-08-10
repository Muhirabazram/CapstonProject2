import { ChevronLeft, ChevronRight, FileSpreadsheet, Info, Key, Pencil, Plus, RotateCcw, Search, Trash2, Upload, Users, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import api from '../../api/axios'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import { SkeletonTable } from '../../components/Skeleton'
import { useToast } from '../../context/ToastContext'

const emptyForm = {
  nim: '', nama: '', prodi: '',
  angkatan: '', jenis_kelamin: '', jenis_mahasiswa: 'Reguler',
  tempat_lahir: '', tanggal_lahir: '', alamat: '',
  email: '', no_hp: '',
  dosen_wali: '', status_mahasiswa: 'Aktif',
}
const PER_PAGE = 10

export default function ImportMahasiswa() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmReset, setConfirmReset] = useState(null)
  const [showFormatInfo, setShowFormatInfo] = useState(false)
  const [filterAngkatan, setFilterAngkatan] = useState('')
  const [filterProdi, setFilterProdi] = useState('')
  const [filterJenisMhs, setFilterJenisMhs] = useState('')
  const fileRef = useRef()
  const toast = useToast()

  const fetchStudents = () => {
    api.get('/admin/students').then((r) => setStudents(r.data.data)).catch(() => { }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchStudents() }, [])

  const uniqueAngkatan = useMemo(() => [...new Set(students.map(s => s.angkatan).filter(Boolean))].sort(), [students])
  const uniqueProdi = useMemo(() => [...new Set(students.map(s => s.prodi).filter(Boolean))].sort(), [students])
  const uniqueJenisMhs = useMemo(() => [...new Set(students.map(s => s.jenis_mahasiswa).filter(Boolean))].sort(), [students])

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = `${s.nim} ${s.nama} ${s.no_hp || ''} ${s.email || ''}`.toLowerCase().includes(search.toLowerCase())
      const matchAngkatan = !filterAngkatan || s.angkatan === filterAngkatan
      const matchProdi = !filterProdi || s.prodi === filterProdi
      const matchJenisMhs = !filterJenisMhs || s.jenis_mahasiswa === filterJenisMhs
      return matchSearch && matchAngkatan && matchProdi && matchJenisMhs
    })
  }, [students, search, filterAngkatan, filterProdi, filterJenisMhs])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  useEffect(() => { setPage(1) }, [search, filterAngkatan, filterProdi, filterJenisMhs])

  const clearFilters = () => {
    setSearch('')
    setFilterAngkatan('')
    setFilterProdi('')
    setFilterJenisMhs('')
  }

  const hasFilter = search || filterAngkatan || filterProdi || filterJenisMhs

  const handleFile = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      toast.error('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv')
      return
    }
    setImporting(true)
    const fd = new FormData()
    fd.append('excel_file', file)
    try {
      await api.post('/admin/students/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Data mahasiswa berhasil di-import!')
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengimport data')
    } finally {
      setImporting(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false) }
  const handleFileInput = (e) => { handleFile(e.target.files[0]); e.target.value = '' }

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
  const openEdit = (s) => {
    setForm({
      nim: s.nim, nama: s.nama, prodi: s.prodi,
      angkatan: s.angkatan || '', jenis_kelamin: s.jenis_kelamin || '',
      jenis_mahasiswa: s.jenis_mahasiswa || 'Reguler',
      tempat_lahir: s.tempat_lahir || '',
      tanggal_lahir: s.tanggal_lahir ? s.tanggal_lahir.split('T')[0] : '',
      alamat: s.alamat || '',
      email: s.email || '',
      no_hp: s.no_hp || '',
      dosen_wali: s.dosen_wali || '', status_mahasiswa: s.status_mahasiswa || 'Aktif',
    })
    setEditId(s.id)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await api.put(`/admin/students/${editId}`, form)
        toast.success('Data mahasiswa berhasil diperbarui!')
      } else {
        await api.post('/admin/students', form)
        toast.success(`Mahasiswa berhasil ditambahkan! Default USN/PW: stmik${form.nim}`)
      }
      setShowModal(false)
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await api.delete(`/admin/students/${confirmDelete}`)
      toast.success('Mahasiswa berhasil dihapus!')
      setConfirmDelete(null)
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus data')
    }
  }

  const handleResetPassword = async () => {
    if (!confirmReset) return
    try {
      await api.post(`/admin/students/${confirmReset.id}/reset-password`)
      toast.success(`Password ${confirmReset.nama} berhasil di-reset ke stmik${confirmReset.nim}!`)
      setConfirmReset(null)
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mereset password.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Kelola Mahasiswa</h2>
          <p className="page-description mt-1">Import dari Excel atau tambah data secara manual.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormatInfo(!showFormatInfo)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${showFormatInfo
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'btn-secondary'
              }`}
            title="Lihat format kolom Excel"
          >
            <Info className="w-4 h-4" />
            Format Import
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </div>
      </div>

      {/* Account Info Notice Banner */}
      <div className="card p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
        <Key className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Informasi Akun Default Mahasiswa</h4>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Username dan Password akun mahasiswa secara default diset ke <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-mono font-bold text-amber-900 dark:text-amber-200">stmik[NIM]</code> (Contoh: NIM <span className="font-bold">1224008</span> → Username: <code className="font-bold">1224008</code> & Password: <code className="font-bold">stmik1224008</code>).
          </p>
        </div>
      </div>

      {/* Drag & Drop Import */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !importing && fileRef.current?.click()}
        className={`card p-6 text-center cursor-pointer transition-all duration-200 ${dragging
            ? 'ring-2 ring-primary dark:ring-primary-200 bg-primary/5 dark:bg-primary/10'
            : 'hover:ring-1 hover:ring-primary/30'
          }`}
        style={{ border: `2px dashed ${dragging ? 'var(--color-primary, #2563eb)' : 'var(--border-color)'}` }}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileInput} className="hidden" />
        {importing ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <div className="w-5 h-5 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Mengimport data...</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
              <Upload className={`w-5 h-5 ${dragging ? 'text-primary' : ''}`} style={{ color: dragging ? undefined : 'var(--text-muted)' }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {dragging ? 'Lepaskan file di sini' : 'Klik atau seret file Excel ke sini'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>.xlsx, .xls, atau .csv &middot; Otomatis di-import dengan default USN & PW: stmik[NIM]</p>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Data Mahasiswa</h3>
              <span className="badge bg-navy-100 dark:bg-navy-800" style={{ color: 'var(--text-secondary)' }}>
                {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={filterAngkatan} onChange={(e) => setFilterAngkatan(e.target.value)} className="select-base text-xs py-1.5 px-3 w-auto">
                <option value="">Semua Angkatan</option>
                {uniqueAngkatan.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={filterProdi} onChange={(e) => setFilterProdi(e.target.value)} className="select-base text-xs py-1.5 px-3 w-auto">
                <option value="">Semua Prodi</option>
                {uniqueProdi.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterJenisMhs} onChange={(e) => setFilterJenisMhs(e.target.value)} className="select-base text-xs py-1.5 px-3 w-auto">
                <option value="">Semua Jenis</option>
                {uniqueJenisMhs.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
              {hasFilter && (
                <button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <X className="w-3 h-3" />
                  Reset
                </button>
              )}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Cari NIM / nama..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-base pl-9 w-56"
                />
              </div>
            </div>
          </div>

          {/* Format Info Panel - removed, now in modal */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <th className="table-header text-left px-6 py-3">NIM</th>
                <th className="table-header text-left px-6 py-3">Nama Lengkap</th>
                <th className="table-header text-left px-6 py-3 hidden sm:table-cell">Program Studi</th>
                <th className="table-header text-left px-6 py-3 hidden md:table-cell">No. HP</th>
                <th className="table-header text-left px-6 py-3 hidden md:table-cell">Angkatan</th>
                <th className="table-header text-left px-6 py-3 hidden lg:table-cell">Jenis</th>
                <th className="table-header text-left px-6 py-3 hidden md:table-cell">Akun Default</th>
                <th className="table-header text-right px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12"><SkeletonTable rows={5} cols={8} /></td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={8}><EmptyState message={hasFilter ? 'Tidak ditemukan' : 'Belum ada data mahasiswa'} icon={Users} /></td></tr>
              ) : (
                paged.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="px-6 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{s.nim}</td>
                    <td className="px-6 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{s.nama}</td>
                    <td className="px-6 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{s.prodi}</td>
                    <td className="px-6 py-3 hidden md:table-cell font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{s.no_hp || '-'}</td>
                    <td className="px-6 py-3 hidden md:table-cell font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{s.angkatan || '-'}</td>
                    <td className="px-6 py-3 hidden lg:table-cell text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className={`px-2 py-0.5 rounded-md font-medium ${s.jenis_mahasiswa === 'Kelas Karyawan'
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        }`}>
                        {s.jenis_mahasiswa || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      stmik{s.nim}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setConfirmReset(s)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title="Reset Password ke Default (stmik[NIM])"
                        >
                          <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </button>
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        </button>
                        <button onClick={() => setConfirmDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg transition-colors hover:bg-navy-100 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${n === page
                      ? 'bg-primary text-white'
                      : 'hover:bg-navy-100 dark:hover:bg-navy-800'
                    }`}
                  style={n === page ? {} : { color: 'var(--text-secondary)' }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg transition-colors hover:bg-navy-100 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>NIM <span className="text-red-500">*</span></label>
              <input type="text" required value={form.nim} onChange={(e) => setForm({ ...form, nim: e.target.value })} className="input-base w-full" placeholder="Masukkan NIM" />
              {!editId && form.nim && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  Default Username & Password: <code className="font-mono font-bold">stmik{form.nim}</code>
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nama Lengkap <span className="text-red-500">*</span></label>
              <input type="text" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input-base w-full" placeholder="Masukkan nama" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Program Studi <span className="text-red-500">*</span></label>
              <select required value={form.prodi} onChange={(e) => setForm({ ...form, prodi: e.target.value })} className="select-base w-full">
                <option value="">Pilih Program Studi</option>
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Angkatan</label>
              <input type="text" value={form.angkatan} onChange={(e) => setForm({ ...form, angkatan: e.target.value })} className="input-base w-full" placeholder="Contoh: 2024" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Jenis Kelamin</label>
              <select value={form.jenis_kelamin} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })} className="select-base w-full">
                <option value="">Pilih</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Jenis Mahasiswa</label>
              <select value={form.jenis_mahasiswa} onChange={(e) => setForm({ ...form, jenis_mahasiswa: e.target.value })} className="select-base w-full">
                <option value="Reguler">Reguler</option>
                <option value="Kelas Karyawan">Kelas Karyawan</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Data Pribadi & Kontak</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>No. HP / WhatsApp</label>
                <input type="text" value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} className="input-base w-full" placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base w-full" placeholder="email@contoh.com" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tempat Lahir</label>
                <input type="text" value={form.tempat_lahir} onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })} className="input-base w-full" placeholder="Kota lahir" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tanggal Lahir</label>
                <input type="date" value={form.tanggal_lahir} onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })} className="input-base w-full" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Alamat</label>
                <textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="input-base w-full" rows={2} placeholder="Alamat lengkap" />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Data Akademik</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Dosen Wali</label>
                <input type="text" value={form.dosen_wali} onChange={(e) => setForm({ ...form, dosen_wali: e.target.value })} className="input-base w-full" placeholder="Nama dosen wali" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status Mahasiswa</label>
                <select value={form.status_mahasiswa} onChange={(e) => setForm({ ...form, status_mahasiswa: e.target.value })} className="select-base w-full">
                  <option value="Aktif">Aktif</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Keluar">Keluar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" className="btn-primary">{editId ? 'Simpan Perubahan' : 'Tambah'}</button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Confirmation */}
      <ConfirmDialog
        open={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        onConfirm={handleResetPassword}
        title="Reset Password Mahasiswa?"
        message={confirmReset ? `Username & Password ${confirmReset.nama} akan di-reset kembali ke default: stmik${confirmReset.nim}. Lanjutkan?` : ''}
        confirmLabel="Reset Password"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Mahasiswa?"
        message="Data mahasiswa ini akan dihapus secara permanen. Lanjutkan?"
        confirmLabel="Hapus"
      />

      {/* Format Info Modal */}
      <Modal open={showFormatInfo} onClose={() => setShowFormatInfo(false)} title="Format Kolom File Import Excel">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pastikan file Excel memiliki kolom-kolom berikut:</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th className="text-left py-2 pr-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Kolom</th>
                  <th className="text-left py-2 pr-4 font-semibold" style={{ color: 'var(--text-primary)' }}>Keterangan</th>
                  <th className="text-left py-2 font-semibold" style={{ color: 'var(--text-primary)' }}>Contoh</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="py-2 pr-4 font-mono font-bold" style={{ color: '#2e6099' }}>NIM</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>Nomor Induk Mahasiswa</td>
                  <td className="py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>1224014</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="py-2 pr-4 font-mono font-bold" style={{ color: '#2e6099' }}>Nama</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>Nama lengkap mahasiswa</td>
                  <td className="py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>Budi Santoso</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="py-2 pr-4 font-mono font-bold" style={{ color: '#2e6099' }}>Prodi</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>Program Studi</td>
                  <td className="py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>Teknik Informatika</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="py-2 pr-4 font-mono font-bold" style={{ color: '#2e6099' }}>Angkatan</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>Tahun angkatan</td>
                  <td className="py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>2024</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="py-2 pr-4 font-mono font-bold" style={{ color: '#2e6099' }}>Jenis Kelamin</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>Laki-laki atau Perempuan</td>
                  <td className="py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>Laki-laki</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="py-2 pr-4 font-mono font-bold" style={{ color: '#2e6099' }}>Jenis Mahasiswa</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>Reguler atau Kelas Karyawan</td>
                  <td className="py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>Reguler</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td className="py-2 pr-4 font-mono font-bold" style={{ color: '#2e6099' }}>No HP</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>Nomor HP / Whatsapp</td>
                  <td className="py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>08123456789</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono font-bold" style={{ color: '#2e6099' }}>Email</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>Alamat Email Mahasiswa</td>
                  <td className="py-2 font-mono" style={{ color: 'var(--text-secondary)' }}>mahasiswa@example.com</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs pt-2" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            * Semua kolom wajib diisi. Kolom yang tidak ada di file akan otomatis kosong/null di sistem.
          </p>
        </div>
      </Modal>
    </div>
  )
}
