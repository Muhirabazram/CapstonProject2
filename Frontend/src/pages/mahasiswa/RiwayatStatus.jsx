import { useState, useEffect } from 'react'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import StatusTimeline from '../../components/StatusTimeline'
import EmptyState from '../../components/EmptyState'
import { SkeletonTable } from '../../components/Skeleton'
import { useToast } from '../../context/ToastContext'
import { Download, FileText, Clock, Eye } from 'lucide-react'

function formatDate(d) {
  if (!d) return '-'
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  const dt = new Date(d)
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

export default function RiwayatStatus() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const toast = useToast()

  useEffect(() => {
    api.get('/student/requests/history').then((r) => setRequests(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

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
      toast.success('Surat berhasil diunduh')
    } catch {
      toast.error('Gagal mengunduh dokumen. File mungkin belum tersedia.')
    }
  }

  const handleDownloadReqDoc = async (rrId, name) => {
    try {
      const response = await api.get(`/documents/requirement/${rrId}`, { responseType: 'blob' })
      if (response.data.size === 0) throw new Error('File kosong')
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Dokumen berhasil diunduh')
    } catch {
      toast.error('Gagal mengunduh dokumen.')
    }
  }

  const handlePreviewReqDoc = async (rrId, name) => {
    try {
      const response = await api.get(`/documents/requirement/${rrId}`, { responseType: 'blob' })
      if (response.data.size === 0) throw new Error('File kosong')
      const url = URL.createObjectURL(response.data)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch {
      toast.error('Gagal mempreview dokumen.')
    }
  }

  const selected = requests.find((r) => r.id === selectedId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="page-title">Riwayat & Status</h2>
        <p className="page-description mt-1">Daftar semua permohonan surat yang pernah Anda ajukan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <th className="table-header text-left px-6 py-3">ID</th>
                    <th className="table-header text-left px-6 py-3">Jenis Surat</th>
                    <th className="table-header text-left px-6 py-3 hidden sm:table-cell">Tanggal</th>
                    <th className="table-header text-left px-6 py-3">Status</th>
                    <th className="table-header text-left px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12"><SkeletonTable rows={4} cols={5} /></td></tr>
                  ) : requests.length === 0 ? (
                    <tr><td colSpan={5}><EmptyState message="Belum ada riwayat pengajuan" icon={FileText} /></td></tr>
                  ) : (
                    requests.map((req) => (
                      <tr
                        key={req.id}
                        className={`table-row cursor-pointer ${selectedId === req.id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                        onClick={() => setSelectedId(req.id)}
                      >
                        <td className="px-6 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          #REQ-{String(req.id).padStart(3, '0')}
                        </td>
                        <td className="px-6 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{req.category?.nama_kategori || '-'}</td>
                        <td className="px-6 py-3 hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{formatDate(req.tanggal_pengajuan)}</td>
                        <td className="px-6 py-3"><StatusBadge status={req.status} /></td>
                        <td className="px-6 py-3">
                          {req.status === 'selesai' && req.file_hasil_path && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownloadResult(req.id) }}
                              className="btn-primary btn-sm flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Unduh
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="card p-6 sticky top-4 space-y-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Detail Status</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ID Pengajuan</p>
                  <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>#REQ-{String(selected.id).padStart(3, '0')}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Kategori</p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selected.category?.nama_kategori || '-'}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tanggal</p>
                  <p style={{ color: 'var(--text-primary)' }}>{formatDate(selected.tanggal_pengajuan)}</p>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <StatusTimeline currentStatus={selected.status} />
              </div>

              {/* Prerequisite Docs */}
              {selected.request_requirements && selected.request_requirements.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h4 className="section-title mb-2">Dokumen Prasyarat</h4>
                  <div className="space-y-2">
                    {selected.request_requirements.map((rr) => (
                      <div key={rr.id} className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>{rr.requirement?.nama_syarat || 'Dokumen'}</span>
                        {rr.file_path ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePreviewReqDoc(rr.id, rr.file_path.split('/').pop())}
                              className="btn-ghost btn-sm flex items-center gap-1"
                              title="Preview"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDownloadReqDoc(rr.id, rr.file_path.split('/').pop())}
                              className="btn-ghost btn-sm flex items-center gap-1"
                              title="Unduh"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Belum diupload</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Result */}
              {selected.status === 'selesai' && selected.file_hasil_path && (
                <button
                  onClick={() => handleDownloadResult(selected.id)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Surat Resmi
                </button>
              )}
              {selected.status === 'selesai' && !selected.file_hasil_path && (
                <div className="px-4 py-3 rounded-xl text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Surat resmi belum tersedia. Hubungi admin.
                </div>
              )}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pilih pengajuan untuk melihat detail status</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
