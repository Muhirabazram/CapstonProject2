import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import { SkeletonTable } from '../../components/Skeleton'
import { useToast } from '../../context/ToastContext'
import { Upload, FileSpreadsheet, CheckCircle, Users, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const emptyForm = { nim: '', nama: '', prodi: '' }
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
  const fileRef = useRef()
  const toast = useToast()

  const fetchStudents = () => {
    api.get('/admin/students').then((r) => setStudents(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchStudents() }, [])

  const filtered = students.filter((s) =>
    `${s.nim} ${s.nama} ${s.prodi}`.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  useEffect(() => { setPage(1) }, [search])

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
  const openEdit = (s) => { setForm({ nim: s.nim, nama: s.nama, prodi: s.prodi }); setEditId(s.id); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await api.put(`/admin/students/${editId}`, form)
        toast.success('Data mahasiswa berhasil diperbarui!')
      } else {
        await api.post('/admin/students', form)
        toast.success('Mahasiswa berhasil ditambahkan!')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Kelola Mahasiswa</h2>
          <p className="page-description mt-1">Import dari Excel atau tambah data secara manual.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {/* Drag & Drop Import */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !importing && fileRef.current?.click()}
        className={`card p-6 text-center cursor-pointer transition-all duration-200 ${
          dragging
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
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>.xlsx, .xls, atau .csv &middot; Otomatis di-import</p>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Data Mahasiswa</h3>
            <span className="badge bg-navy-100 dark:bg-navy-800" style={{ color: 'var(--text-secondary)' }}>
              {filtered.length}
            </span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari NIM / nama / prodi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <th className="table-header text-left px-6 py-3">NIM</th>
                <th className="table-header text-left px-6 py-3">Nama Lengkap</th>
                <th className="table-header text-left px-6 py-3 hidden sm:table-cell">Program Studi</th>
                <th className="table-header text-right px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12"><SkeletonTable rows={5} cols={4} /></td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={4}><EmptyState message={search ? 'Tidak ditemukan' : 'Belum ada data mahasiswa'} icon={Users} /></td></tr>
              ) : (
                paged.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="px-6 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{s.nim}</td>
                    <td className="px-6 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{s.nama}</td>
                    <td className="px-6 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{s.prodi}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
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
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    n === page
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>NIM</label>
            <input type="text" required value={form.nim} onChange={(e) => setForm({ ...form, nim: e.target.value })} className="input-base w-full" placeholder="Masukkan NIM" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nama Lengkap</label>
            <input type="text" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="input-base w-full" placeholder="Masukkan nama" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Program Studi</label>
            <input type="text" required value={form.prodi} onChange={(e) => setForm({ ...form, prodi: e.target.value })} className="input-base w-full" placeholder="Masukkan prodi" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" className="btn-primary">{editId ? 'Simpan Perubahan' : 'Tambah'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Mahasiswa?"
        message="Data mahasiswa ini akan dihapus secara permanen. Lanjutkan?"
        confirmLabel="Hapus"
      />
    </div>
  )
}
