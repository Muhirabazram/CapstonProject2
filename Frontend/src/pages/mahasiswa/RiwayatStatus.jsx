import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import StatusTimeline from '../../components/StatusTimeline'
import EmptyState from '../../components/EmptyState'
import DocumentPreviewModal from '../../components/DocumentPreviewModal'
import { SkeletonTable } from '../../components/Skeleton'
import { useToast } from '../../context/ToastContext'
import { Download, FileText, Clock, Eye, AlertCircle, Edit3, RotateCcw, Calendar, X, Search } from 'lucide-react'

function formatDate(d) {
  if (!d) return '-'
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  const dt = new Date(d)
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

export default function RiwayatStatus() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [previewModal, setPreviewModal] = useState({ open: false, blob: null, filename: '', title: '', reqId: null })
  const toast = useToast()

  const fetchHistory = (showToast = false) => {
    setRefreshing(true)
    api.get('/student/requests/history')
      .then((r) => {
        setRequests(r.data.data)
        if (showToast) toast.success('Riwayat status berhasil diperbarui')
      })
      .catch(() => {
        if (showToast) toast.error('Gagal memperbarui riwayat')
      })
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const availableCategories = useMemo(() => {
    const catsMap = new Map()
    requests.forEach((r) => {
      if (r.category) {
        catsMap.set(String(r.category.id), r.category.nama_kategori)
      }
    })
    return Array.from(catsMap.entries()).map(([id, name]) => ({ id, name }))
  }, [requests])

  const statusCounts = useMemo(() => {
    return {
      diajukan: requests.filter(r => r.status === 'diajukan').length,
      diterima: requests.filter(r => r.status === 'diterima').length,
      diproses: requests.filter(r => r.status === 'diproses').length,
      ditolak: requests.filter(r => r.status === 'ditolak').length,
      selesai: requests.filter(r => r.status === 'selesai').length,
    }
  }, [requests])

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const categoryName = r.category?.nama_kategori || ''
      const matchSearch = !search || categoryName.toLowerCase().includes(search.toLowerCase()) || String(r.id).includes(search)
      const matchStatus = !filterStatus || r.status === filterStatus
      const matchCategory = !filterCategory || String(r.category_id) === String(filterCategory) || categoryName === filterCategory

      const rDateStr = r.tanggal_pengajuan ? r.tanggal_pengajuan.split('T')[0] : (r.created_at ? r.created_at.split('T')[0] : '')
      let matchDate = true
      if (startDate && endDate) {
        matchDate = rDateStr >= startDate && rDateStr <= endDate
      } else if (startDate) {
        matchDate = rDateStr === startDate
      } else if (endDate) {
        matchDate = rDateStr === endDate
      }

      return matchSearch && matchStatus && matchCategory && matchDate
    })
  }, [requests, filterStatus, filterCategory, startDate, endDate, search])

  const handlePreviewResult = async (req) => {
    try {
      const response = await api.get(`/documents/download/${req.id}`, { responseType: 'blob' })
      if (response.data.size === 0) throw new Error('File kosong')
      const cd = response.headers['content-disposition']
      let filename = `Surat_Pengantar_${req.id}.docx`
      if (cd) {
        const match = cd.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i)
        if (match) filename = decodeURIComponent(match[1].replace(/"/g, ''))
      }
      setPreviewModal({
        open: true,
        blob: response.data,
        filename,
        title: `Surat Pengantar - ${req.category?.nama_kategori || 'Pengajuan'}`,
        reqId: req.id,
        downloadFn: () => handleDownloadResult(req.id)
      })
    } catch {
      toast.error('Gagal memuat preview surat pengantar.')
    }
  }


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
      toast.success('Surat Pengantar berhasil diunduh')
    } catch {
      toast.error('Gagal mengunduh dokumen. File mungkin belum tersedia.')
    }
  }

  const handleDownloadPermohonan = async (id, customFilename = '') => {
    try {
      const response = await api.get(`/documents/permohonan/${id}`, { responseType: 'blob' })
      if (response.data.size === 0) throw new Error('File kosong')
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = customFilename || `Surat_Permohonan_${id}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Surat Permohonan berhasil diunduh')
    } catch {
      toast.error('Gagal mengunduh surat permohonan')
    }
  }

  const handlePreviewPermohonan = async (req) => {
    try {
      const response = await api.get(`/documents/permohonan/${req.id}`, { responseType: 'blob' })
      if (response.data.size === 0) throw new Error('File kosong')
      const filename = req.file_permohonan_path ? req.file_permohonan_path.split('/').pop() : `Surat_Permohonan_${req.id}.docx`
      setPreviewModal({
        open: true,
        blob: response.data,
        filename,
        title: `Surat Permohonan - ${req.category?.nama_kategori || 'Pengajuan'}`,
        reqId: req.id,
        downloadFn: () => handleDownloadPermohonan(req.id, filename)
      })
    } catch {
      toast.error('Gagal memuat preview surat permohonan.')
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

  const handlePreviewReqDoc = async (rr) => {
    try {
      const item = typeof rr === 'object' ? rr : { id: rr }
      if (item.file_path) {
        window.open(`/storage/${item.file_path}`, '_blank')
        return
      }
      const response = await api.get(`/documents/requirement/${item.id}`, { responseType: 'blob' })
      if (response.data.size === 0) throw new Error('File kosong')
      const contentType = response.headers['content-type'] || 'application/octet-stream'
      const blob = new Blob([response.data], { type: contentType })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch {
      toast.error('Gagal mempreview dokumen.')
    }
  }

  const selected = requests.find((r) => r.id === selectedId)

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="space-y-4">
        <div>
          <h2 className="page-title">Riwayat & Status</h2>
          <p className="page-description mt-1">Daftar semua permohonan surat yang pernah Anda ajukan.</p>
        </div>

        {/* Filter Card */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base pl-9 text-sm"
                placeholder="Cari jenis surat/ID..."
              />
            </div>

            {/* Category Filter */}
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="select-base text-sm w-full sm:w-44">
              <option value="">Semua Kategori</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-base text-sm w-full sm:w-36">
              <option value="">Semua Status</option>
              <option value="diajukan">Diajukan ({statusCounts.diajukan})</option>
              <option value="diterima">Diterima ({statusCounts.diterima})</option>
              <option value="diproses">Diproses ({statusCounts.diproses})</option>
              <option value="ditolak">Ditolak ({statusCounts.ditolak})</option>
              <option value="selesai">Selesai ({statusCounts.selesai})</option>
            </select>

            {/* Date Filter - Inline */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden xl:inline">Filter Tanggal:</span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-base text-xs py-1.5 px-2 w-32"
                title="Dari Tanggal"
              />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-base text-xs py-1.5 px-2 w-32"
                title="Sampai Tanggal"
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => { setStartDate(''); setEndDate('') }}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0"
                  title="Reset Tanggal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchHistory(true)}
              disabled={refreshing || loading}
              className="btn-secondary flex items-center gap-1.5 px-3 py-2 text-xs shrink-0 ml-auto"
              title="Refresh Riwayat Status"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
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
                  ) : filteredRequests.length === 0 ? (
                    <tr><td colSpan={5}><EmptyState message={filterStatus || startDate || endDate || search ? "Tidak ada pengajuan ditemukan" : "Belum ada riwayat pengajuan"} icon={FileText} /></td></tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr
                        key={req.id}
                        className={`table-row cursor-pointer ${selectedId === req.id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                        onClick={() => setSelectedId(req.id)}
                      >
                        <td className="px-6 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          #REQ-{String(req.id).padStart(3, '0')}
                        </td>
                        <td className="px-6 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {req.category?.nama_kategori || '-'}
                        </td>
                        <td className="px-6 py-3 hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{formatDate(req.tanggal_pengajuan)}</td>
                        <td className="px-6 py-3"><StatusBadge status={req.status} /></td>
                        <td className="px-6 py-3">
                          {req.status === 'selesai' && (
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
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selected.category?.nama_kategori || '-'}
                  </p>
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
                              onClick={() => handlePreviewReqDoc(rr)}
                              className="btn-ghost btn-sm flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              title="Preview"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDownloadReqDoc(rr.id, rr.file_path.split('/').pop())}
                              className="btn-ghost btn-sm flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
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

              {/* Digital Signature preview if uploaded */}
              {selected.file_ttd_digital_path && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h4 className="section-title mb-2">Tanda Tangan Digital</h4>
                  <div className="rounded-xl p-3 border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div className="flex items-center gap-3">
                      <img
                        src={`/storage/${selected.file_ttd_digital_path}`}
                        alt="TTD Digital"
                        className="h-10 object-contain bg-white p-1 rounded-lg border"
                      />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {selected.file_ttd_digital_path.split('/').pop()}
                      </span>
                    </div>
                    <a
                      href={`/storage/${selected.file_ttd_digital_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost btn-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Eye className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Alasan Penolakan if rejected */}
              {selected.status === 'ditolak' && (
                <div className="space-y-3" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-1">
                    <p className="text-xs font-semibold text-red-800 dark:text-red-200 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      Alasan Penolakan Dari Admin:
                    </p>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mt-1">
                      {selected.alasan_penolakan || 'Pengajuan ditolak oleh admin (tidak ada keterangan tambahan).'}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/mahasiswa/pengajuan', { state: { reapplyReq: selected } })}
                    className="btn-primary w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                    Ajukan Ulang / Perbaiki Form
                  </button>
                </div>
              )}

              {/* Surat Permohonan */}
              <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h4 className="section-title text-xs text-blue-600 dark:text-blue-400">📄 Surat Permohonan Saya</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreviewPermohonan(selected)}
                    className="btn-ghost btn-sm flex-1 flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Permohonan
                  </button>
                  <button
                    onClick={() => handleDownloadPermohonan(selected.id, `Surat_Permohonan_${selected.id}.docx`)}
                    className="btn-ghost btn-sm flex-1 flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Permohonan
                  </button>
                </div>
              </div>

              {/* Download Result & Preview Surat Pengantar */}
              {selected.status === 'selesai' && (
                <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h4 className="section-title text-xs text-emerald-600 dark:text-emerald-400">✉️ Surat Pengantar Resmi (ACC)</h4>
                  <button
                    onClick={() => handlePreviewResult(selected)}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Surat Pengantar
                  </button>
                  <button
                    onClick={() => handleDownloadResult(selected.id)}
                    className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Download className="w-4 h-4" />
                    Download Surat Pengantar (.docx)
                  </button>
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

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewModal.open}
        onClose={() => setPreviewModal({ ...previewModal, open: false })}
        title={previewModal.title}
        reqId={previewModal.reqId}
        fileBlob={previewModal.blob}
        filename={previewModal.filename}
        onDownload={previewModal.downloadFn || (() => handleDownloadResult(previewModal.reqId))}
      />
    </div>
  )
}

