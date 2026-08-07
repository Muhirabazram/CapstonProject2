import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard, SkeletonTable } from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Send, Clock, CheckCircle, FileText, ArrowRight } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="page-title">Selamat datang, {name}</h2>
        <p className="page-description mt-1">Pantau status pengajuan surat Anda di sini.</p>
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
                  <tr key={req.id} className="table-row">
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
