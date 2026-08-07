import { useState, useEffect } from 'react'
import api from '../../api/axios'
import EmptyState from '../../components/EmptyState'
import { SkeletonTable } from '../../components/Skeleton'
import { useToast } from '../../context/ToastContext'
import { Upload, FileSpreadsheet, CheckCircle, Users } from 'lucide-react'

export default function ImportMahasiswa() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const toast = useToast()

  const fetchStudents = () => {
    api.get('/admin/students').then((r) => setStudents(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchStudents() }, [])

  const handleImport = async (e) => {
    e.preventDefault()
    if (!file) return
    setImporting(true)
    const fd = new FormData()
    fd.append('excel_file', file)
    try {
      await api.post('/admin/students/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Data mahasiswa berhasil di-import!')
      setFile(null)
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengimport data')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="page-title">Kelola Mahasiswa</h2>
        <p className="page-description mt-1">Import data mahasiswa dari file Excel untuk digunakan dalam sistem.</p>
      </div>

      {/* Upload Area */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary dark:text-primary-200" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Import Data Mahasiswa</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Unggah file Excel (.xlsx/.xls) atau CSV</p>
          </div>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div
            className="border-2 border-dashed rounded-2xl p-8 text-center transition-colors hover:border-primary/50"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {file ? file.name : 'Pilih file untuk di-import'}
            </p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Format: .xlsx, .xls, atau .csv &middot; Maks. 5MB
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={importing || !file} className="btn-primary flex items-center gap-2">
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengimport...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Data Mahasiswa</h3>
          </div>
          <span className="badge bg-navy-100 dark:bg-navy-800" style={{ color: 'var(--text-secondary)' }}>
            {students.length} mahasiswa
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <th className="table-header text-left px-6 py-3">NPM</th>
                <th className="table-header text-left px-6 py-3">Nama Lengkap</th>
                <th className="table-header text-left px-6 py-3 hidden sm:table-cell">Program Studi</th>
                <th className="table-header text-left px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12"><SkeletonTable rows={5} cols={4} /></td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={4}><EmptyState message="Belum ada data mahasiswa" icon={Users} /></td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="px-6 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{s.nim}</td>
                    <td className="px-6 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{s.nama}</td>
                    <td className="px-6 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{s.prodi}</td>
                    <td className="px-6 py-3">
                      <span className="badge bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
