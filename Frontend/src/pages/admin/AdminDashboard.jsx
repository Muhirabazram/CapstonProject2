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
import {
  FileText, Clock, CheckCircle, XCircle, Loader, ArrowRight, Send
} from 'lucide-react'

function formatDate(d) {
  if (!d) return '-'
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  const dt = new Date(d)
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/admin/requests')
      .then((r) => setRequests(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: requests.length,
    diajukan: requests.filter((r) => r.status === 'diajukan').length,
    diterima: requests.filter((r) => r.status === 'diterima').length,
    diproses: requests.filter((r) => r.status === 'diproses').length,
    ditolak: requests.filter((r) => r.status === 'ditolak').length,
    selesai: requests.filter((r) => r.status === 'selesai').length,
  }

  const statCards = [
    { label: 'Total Pengajuan', value: stats.total, icon: FileText, color: 'primary' },
    { label: 'Menunggu', value: stats.diajukan, icon: Clock, color: 'blue' },
    { label: 'Diproses', value: stats.diproses, icon: Loader, color: 'amber' },
    { label: 'Selesai', value: stats.selesai, icon: CheckCircle, color: 'green' },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="page-title">
          Selamat datang, {user?.username || 'Admin'}
        </h2>
        <p className="page-description mt-1">
          Berikut ringkasan pengajuan surat mahasiswa hari ini.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {loading ? (
            <div className="card p-6"><SkeletonTable rows={5} cols={3} /></div>
          ) : (
            <StatusChart requests={requests} />
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Pengajuan Terbaru</h3>
              <button
                onClick={() => navigate('/admin/pengajuan')}
                className="text-xs font-medium flex items-center gap-1 text-primary hover:text-primary-hover transition-colors"
              >
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <th className="table-header text-left px-6 py-3">NPM</th>
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
                    <tr><td colSpan={5}><EmptyState message="Belum ada pengajuan" /></td></tr>
                  ) : (
                    requests.slice(0, 5).map((req) => (
                      <tr key={req.id} className="table-row">
                        <td className="px-6 py-3" style={{ color: 'var(--text-secondary)' }}>{req.mahasiswa?.nim || '-'}</td>
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
          </div>
        </div>
      </div>
    </div>
  )
}
