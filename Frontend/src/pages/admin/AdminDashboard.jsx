import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import StatusChart from '../../components/StatusChart'
import StatCard from '../../components/StatCard'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard, SkeletonTable } from '../../components/Skeleton'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { useNeo } from '../../context/NeoContext'
import {
  FileText, Clock, CheckCircle, XCircle, Loader, ArrowRight, Send, Activity
} from 'lucide-react'

function formatDate(d) {
  if (!d) return '-'
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  const dt = new Date(d)
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'Selamat pagi'
  if (h >= 11 && h < 15) return 'Selamat siang'
  if (h >= 15 && h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { workspaceMode } = useNeo()
  const navigate = useNavigate()
  const isNeo = workspaceMode === 'neo'

  useEffect(() => {
    api.get('/admin/requests')
      .then((r) => setRequests(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: requests.length,
    diterima: requests.filter((r) => r.status === 'diterima' || r.status === 'diajukan').length,
    diproses: requests.filter((r) => r.status === 'diproses').length,
    ditolak: requests.filter((r) => r.status === 'ditolak').length,
    selesai: requests.filter((r) => r.status === 'selesai').length,
  }

  const statCards = [
    { label: 'Total Pengajuan', value: stats.total, icon: FileText, color: 'primary' },
    { label: 'Diterima', value: stats.diterima, icon: Clock, color: 'blue' },
    { label: 'Diproses', value: stats.diproses, icon: Loader, color: 'amber' },
    { label: 'Selesai', value: stats.selesai, icon: CheckCircle, color: 'green' },
    { label: 'Ditolak', value: stats.ditolak, icon: XCircle, color: 'red' },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting Panel */}
      <div className={`${isNeo ? 'neo-window neo-page-enter' : ''}`}>
        <div className={`${isNeo ? 'px-6 py-5' : 'py-0'}`}>
          <div className="flex items-center gap-3">
            {isNeo && (
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-primary dark:text-primary-200" />
              </div>
            )}
            <div>
              <h2 className="page-title">
                {getGreeting()}, {user?.username || 'Admin'}
              </h2>
              <p className="page-description mt-0.5">
                Anda dapat memantau seluruh pengajuan dari dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div key={s.label} className={isNeo ? `neo-page-enter neo-stagger-${i + 1}` : ''}>
              <StatCard {...s} />
            </div>
          ))}
        </div>
      )}

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 ${isNeo ? 'neo-page-enter neo-stagger-5' : ''}`}>
          {loading ? (
            <div className={`${isNeo ? 'neo-window' : 'card'} p-5`}><SkeletonTable rows={5} cols={3} /></div>
          ) : (
            <StatusChart requests={requests} />
          )}
        </div>

        <div className={`lg:col-span-2 ${isNeo ? 'neo-page-enter neo-stagger-6' : ''}`}>
          <div className={`${isNeo ? 'neo-window' : 'card'} overflow-hidden`}>
            {isNeo && (
              <div className="neo-window-header">
                <div className="flex gap-1.5">
                  <span className="neo-dot neo-dot-red" />
                  <span className="neo-dot neo-dot-yellow" />
                  <span className="neo-dot neo-dot-green" />
                </div>
                <h3 className="flex-1 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Pengajuan Terbaru</h3>
                <div className="w-[46px]" />
              </div>
            )}
            {!isNeo && (
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Pengajuan Terbaru</h3>
                <button
                  onClick={() => navigate('/admin/pengajuan')}
                  className="text-xs font-semibold flex items-center gap-1 transition-colors text-blue-600 dark:text-sky-400 hover:underline"
                >
                  Lihat Semua <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: isNeo ? 'var(--neo-panel-header)' : 'var(--bg-tertiary)' }}>
                    <th className="table-header text-left px-6 py-3">NIM</th>
                    <th className="table-header text-left px-6 py-3">Nama</th>
                    <th className="table-header text-left px-6 py-3 hidden sm:table-cell">Jenis Surat</th>
                    <th className="table-header text-left px-6 py-3 hidden md:table-cell">Tanggal</th>
                    <th className="table-header text-left px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12"><SkeletonTable rows={4} cols={5} /></td></tr>
                  ) : requests.length === 0 ? (
                    <tr><td colSpan={5}><EmptyState message="Belum ada pengajuan" description="Pengajuan akan muncul di sini setelah mahasiswa mengirim surat." /></td></tr>
                  ) : (
                    requests.slice(0, 5).map((req) => (
                      <tr key={req.id} className={`table-row ${isNeo ? 'neo-table-row' : ''}`}>
                        <td className="px-6 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{req.mahasiswa?.nim || '-'}</td>
                        <td className="px-6 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{req.mahasiswa?.nama || '-'}</td>
                        <td className="px-6 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{req.category?.nama_kategori || '-'}</td>
                        <td className="px-6 py-3 hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>{formatDate(req.tanggal_pengajuan)}</td>
                        <td className="px-6 py-3"><StatusBadge status={req.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {isNeo && requests.length > 0 && (
              <div className="px-6 py-3 flex justify-end" style={{ borderTop: '1px solid var(--neo-panel-border)' }}>
                <button
                  onClick={() => navigate('/admin/pengajuan')}
                  className="text-xs font-semibold flex items-center gap-1 transition-colors text-blue-600 dark:text-sky-400 hover:underline"
                >
                  Lihat Semua <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
