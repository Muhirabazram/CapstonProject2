import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard, SkeletonTable } from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { Send, Clock, CheckCircle, FileText, ArrowRight, AlertCircle, Edit3, Download } from 'lucide-react'

function formatDate(d) {
  if (!d) return '-'
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  const dt = new Date(d)
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

export default function MahasiswaDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/student/requests/history').then((r) => setRequests(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: requests.length,
    active: requests.filter((r) => ['diajukan', 'diterima', 'diproses'].includes(r.status)).length,
    selesai: requests.filter((r) => r.status === 'selesai').length,
  }

  const name = user?.mahasiswa?.nama || user?.username || 'Mahasiswa'
  const nim = user?.mahasiswa?.nim || ''

  const latestRejected = requests.find((r) => r.status === 'ditolak')
  const latestSelesai = requests.find((r) => r.status === 'selesai' && r.file_hasil_path)

  const handleDownloadResult = async (id) => {
    try {
      const response = await api.get(`/documents/download/${id}`, { responseType: 'blob' })
      if (response.data.size === 0) throw new Error('File kosong')
      const cd = response.headers['content-disposition']
      let filename = `Surat_${id}.docx`
      if (cd) {
        const match = cd.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i)
        if (match) filename = decodeURIComponent(match[1].replace(/"/g, ''))
      }
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="page-title">Selamat datang, {name}</h2>
        <p className="page-description mt-1">{nim && `${nim} · `}Pantau status pengajuan surat Anda di sini.</p>
      </div>

      {/* Quick Action */}
      <button
        onClick={() => navigate('/mahasiswa/pengajuan')}
        className="card card-hover p-6 w-full flex items-center gap-4 text-left group transition-all duration-200 hover:ring-2 hover:ring-primary/20"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Buat Pengajuan Surat</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ajukan surat pengantar penelitian baru</p>
        </div>
        <ArrowRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
      </button>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary dark:text-primary-200" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Pengajuan</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sedang Diproses</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Selesai</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.selesai}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Alert */}
      {latestRejected && (
        <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Pengajuan Ditolak</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">#{String(latestRejected.id).padStart(3, '0')} · {latestRejected.category?.nama_kategori || '-'}</p>
              {latestRejected.alasan_penolakan && (
                <p className="text-sm text-red-700 dark:text-red-300 mt-1.5">"{latestRejected.alasan_penolakan}"</p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate('/mahasiswa/pengajuan', { state: { reapplyReq: latestRejected } })}
            className="btn-sm bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 mt-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Ajukan Ulang
          </button>
        </div>
      )}

      {/* Completed Letter Alert */}
      {latestSelesai && (
        <div className="rounded-xl p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Surat Resmi Tersedia</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">#{String(latestSelesai.id).padStart(3, '0')} · {latestSelesai.category?.nama_kategori || '-'}</p>
            </div>
          </div>
          <button
            onClick={() => handleDownloadResult(latestSelesai.id)}
            className="btn-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      )}

      {/* Recent Requests */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Pengajuan Terbaru</h3>
          <button
            onClick={() => navigate('/mahasiswa/riwayat')}
            className="text-xs font-medium flex items-center gap-1 text-primary hover:text-primary-hover transition-colors"
          >
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <th className="table-header text-left px-6 py-3">ID</th>
                <th className="table-header text-left px-6 py-3">Jenis Surat</th>
                <th className="table-header text-left px-6 py-3 hidden sm:table-cell">Tanggal</th>
                <th className="table-header text-left px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12"><SkeletonTable rows={3} cols={4} /></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={4}><EmptyState message="Belum ada pengajuan" icon={FileText} /></td></tr>
              ) : (
                requests.slice(0, 5).map((req) => (
                  <tr
                    key={req.id}
                    className="table-row cursor-pointer"
                    onClick={() => navigate('/mahasiswa/riwayat')}
                  >
                    <td className="px-6 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      #REQ-{String(req.id).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{req.category?.nama_kategori || '-'}</td>
                    <td className="px-6 py-3 hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{formatDate(req.tanggal_pengajuan)}</td>
                    <td className="px-6 py-3"><StatusBadge status={req.status} /></td>
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
