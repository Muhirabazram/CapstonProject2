import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import { SkeletonTable } from '../../components/Skeleton'
import { useToast } from '../../context/ToastContext'
import { Eye, Download, Search, Filter, FileText } from 'lucide-react'

function formatDate(d) {
  if (!d) return '-'
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  const dt = new Date(d)
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

export default function KelolaPengajuan() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDetail, setShowDetail] = useState(false)
  const [selected, setSelected] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [fileSurat, setFileSurat] = useState(null)
  const [alasanPenolakan, setAlasanPenolakan] = useState('')
  const [saving, setSaving] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const toast = useToast()

  const fetchRequests = () => {
    api.get('/admin/requests').then((r) => setRequests(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { fetchRequests() }, [])

  const filtered = requests.filter((r) => {
    const matchSearch = !search || r.mahasiswa?.nama?.toLowerCase().includes(search.toLowerCase()) || r.mahasiswa?.nim?.includes(search) || r.category?.nama_kategori?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const openDetail = (req) => {
    setSelected(req)
    setNewStatus(req.status)
    setAlasanPenolakan(req.alasan_penolakan || '')
    setFileSurat(null)
    setDetailError('')
    setShowDetail(true)
  }

  const handleDownloadReqDoc = (id, filename) => {
    api.get(`/documents/requirement/${id}`, { responseType: 'blob' }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'dokumen_prasyarat'
      a.click()
      window.URL.revokeObjectURL(url)
    }).catch(() => toast.error('Gagal mengunduh dokumen'))
  }

  const handlePreviewReqDoc = async (id) => {
    try {
      const response = await api.get(`/documents/requirement/${id}`, { responseType: 'blob' })
      if (response.data.size === 0) throw new Error('File kosong')
      const url = URL.createObjectURL(response.data)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch {
      toast.error('Gagal mempreview dokumen.')
    }
  }

  const handleUpdateStatus = async () => {
    if (!selected || !newStatus) return
    if ((newStatus === 'selesai' || newStatus === 'ditolak') && newStatus !== selected.status) {
      if (newStatus === 'ditolak' && !alasanPenolakan.trim()) {
        setDetailError('Harap tuliskan alasan penolakan pengajuan.')
        return
      }
      setShowConfirm(true)
      return
    }
    await doUpdateStatus()
  }

  const doUpdateStatus = async () => {
    setShowConfirm(false)
    setSaving(true)
    setDetailError('')
    try {
      if (newStatus === 'ditolak' && !alasanPenolakan.trim()) {
        setDetailError('Harap tuliskan alasan penolakan pengajuan.')
        setSaving(false)
        return
      }

      if (newStatus === 'selesai' && fileSurat) {
        const fd = new FormData()
        fd.append('status', 'selesai')
        fd.append('file_surat', fileSurat)
        const res = await api.patch(`/admin/requests/${selected.id}/status`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setShowDetail(false)
        setSelected(null)
        fetchRequests()
        toast.success(res.data?.message || 'Status berhasil diperbarui')
      } else {
        const payload = { status: newStatus }
        if (newStatus === 'ditolak') payload.alasan_penolakan = alasanPenolakan
        const res = await api.patch(`/admin/requests/${selected.id}/status`, payload)
        setShowDetail(false)
        setSelected(null)
        fetchRequests()
        toast.success(res.data?.message || 'Status berhasil diperbarui')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal update status'
      setDetailError(msg)
    } finally {
      setSaving(false)
    }
  }

  const statusCounts = {
    diajukan: requests.filter(r => r.status === 'diajukan').length,
    diterima: requests.filter(r => r.status === 'diterima').length,
    diproses: requests.filter(r => r.status === 'diproses').length,
    ditolak: requests.filter(r => r.status === 'ditolak').length,
    selesai: requests.filter(r => r.status === 'selesai').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="page-title">Daftar Pengajuan</h2>
        <p className="page-description mt-1">Verifikasi dokumen prasyarat dan update status pengajuan surat.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
            placeholder="Cari nama, NPM, atau kategori..."
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-base w-full sm:w-44">
          <option value="">Semua Status</option>
          <option value="diajukan">Diajukan ({statusCounts.diajukan})</option>
          <option value="diterima">Diterima ({statusCounts.diterima})</option>
          <option value="diproses">Diproses ({statusCounts.diproses})</option>
          <option value="ditolak">Ditolak ({statusCounts.ditolak})</option>
          <option value="selesai">Selesai ({statusCounts.selesai})</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <th className="table-header text-left px-6 py-3">ID</th>
                <th className="table-header text-left px-6 py-3">Mahasiswa</th>
                <th className="table-header text-left px-6 py-3 hidden md:table-cell">Kategori</th>
                <th className="table-header text-left px-6 py-3 hidden lg:table-cell">Tanggal</th>
                <th className="table-header text-left px-6 py-3">Status</th>
                <th className="table-header text-left px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12"><SkeletonTable rows={5} cols={6} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState message="Tidak ada pengajuan ditemukan" icon={FileText} /></td></tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="table-row">
                    <td className="px-6 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      #REQ-{String(req.id).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{req.mahasiswa?.nama || '-'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{req.mahasiswa?.nim || ''}</p>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>{req.category?.nama_kategori || '-'}</td>
                    <td className="px-6 py-3 hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>{formatDate(req.tanggal_pengajuan)}</td>
                    <td className="px-6 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-3">
                      <button onClick={() => openDetail(req)} className="btn-primary btn-sm flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={showDetail} onClose={() => { setShowDetail(false); setSelected(null) }} title="Detail Pengajuan" wide>
        {selected && (
          <div className="space-y-5">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>ID Pengajuan</p>
                <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>#REQ-{String(selected.id).padStart(3, '0')}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Tanggal</p>
                <p style={{ color: 'var(--text-primary)' }}>{formatDate(selected.tanggal_pengajuan)}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Mahasiswa</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selected.mahasiswa?.nama || '-'}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>NIM</p>
                <p style={{ color: 'var(--text-primary)' }}>{selected.mahasiswa?.nim || '-'}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Kategori</p>
                <p style={{ color: 'var(--text-primary)' }}>{selected.category?.nama_kategori || '-'}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Status</p>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            {/* Form Values */}
            {selected.values && selected.values.length > 0 && (
              <div className="space-y-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h4 className="section-title">Data Form Isian</h4>
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  {selected.values.map((v) => (
                    <div key={v.id} className="flex gap-2 text-sm">
                      <span className="w-40 shrink-0" style={{ color: 'var(--text-muted)' }}>{v.variable?.nama_variabel || 'Variabel'}:</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{v.nilai_isian}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisite Documents */}
            {selected.request_requirements && selected.request_requirements.length > 0 && (
              <div className="space-y-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h4 className="section-title">Dokumen Prasyarat</h4>
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  {selected.request_requirements.map((rr) => (
                    <div key={rr.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{rr.requirement?.nama_syarat || 'Dokumen'}:</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{rr.file_path?.split('/').pop()}</span>
                      </div>
                      {rr.file_path && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePreviewReqDoc(rr.id)}
                            className="btn-ghost btn-sm flex items-center gap-1 text-primary"
                            title="Lihat"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDownloadReqDoc(rr.id, rr.file_path.split('/').pop())}
                            className="btn-ghost btn-sm flex items-center gap-1 text-primary"
                            title="Unduh"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TTD Digital Mahasiswa */}
            {selected.file_ttd_digital_path ? (
              <div className="space-y-2">
                <h4 className="section-title">Tanda Tangan Digital Mahasiswa</h4>
                <div className="rounded-xl p-3 border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-3">
                    <img
                      src={`/storage/${selected.file_ttd_digital_path}`}
                      alt="TTD Digital Mahasiswa"
                      className="h-12 object-contain bg-white p-1 rounded-lg border"
                    />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {selected.file_ttd_digital_path.split('/').pop()}
                    </span>
                  </div>
                  <a
                    href={`/storage/${selected.file_ttd_digital_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost btn-sm text-primary"
                  >
                    Lihat
                  </a>
                </div>
              </div>
            ) : selected.category?.ttd_digital ? (
              <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-800">
                ⚠️ Mahasiswa belum mengunggah TTD Digital pada pengajuan ini.
              </div>
            ) : null}

            {/* Result File */}
            {selected.file_hasil_path && (
              <div className="space-y-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h4 className="section-title">Surat Resmi</h4>
                <div className="rounded-xl p-4 bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-300">{selected.file_hasil_path.split('/').pop()}</span>
                  </div>
                  <a
                    href={`/storage/${selected.file_hasil_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost btn-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Lihat
                  </a>
                </div>
              </div>
            )}

            {selected.alasan_penolakan && selected.status === 'ditolak' && (
              <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-1">
                <p className="text-xs font-semibold text-red-800 dark:text-red-200">Alasan Penolakan Terdaftar:</p>
                <p className="text-sm text-red-700 dark:text-red-300">{selected.alasan_penolakan}</p>
              </div>
            )}

            {/* Status Update */}
            <div className="space-y-3" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h4 className="section-title">Update Status</h4>
              {detailError && (
                <div className="px-4 py-3 rounded-xl text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                  {detailError}
                </div>
              )}
              <select
                value={newStatus}
                onChange={(e) => { setNewStatus(e.target.value); setDetailError(''); setFileSurat(null) }}
                className="select-base"
              >
                <option value="diajukan">Diajukan</option>
                <option value="diproses">Diproses</option>
                <option value="diterima">Diterima</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>

            {newStatus === 'selesai' && (
              <div className="rounded-xl p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">File Surat Resmi (Opsional)</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-3">
                  Jika tidak di-upload, surat akan **otomatis dibuat dan terisi** dari template .docx kategori. Jika ingin mengunggah file manual, pilih file di bawah (.docx/.pdf, Maks 20MB).
                </p>
                <input
                  type="file"
                  accept=".docx,.doc,.pdf"
                  onChange={(e) => { setFileSurat(e.target.files[0]); setDetailError('') }}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer"
                />
                {fileSurat && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    File manual dipilih: {fileSurat.name} ({(fileSurat.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

            {newStatus === 'ditolak' && (
              <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-2">
                <label className="block text-sm font-medium text-red-800 dark:text-red-200">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={alasanPenolakan}
                  onChange={(e) => { setAlasanPenolakan(e.target.value); setDetailError('') }}
                  rows={3}
                  className="input-base border-red-300 dark:border-red-700 focus:ring-red-200"
                  placeholder="Masukkan alasan mengapa pengajuan surat ini ditolak..."
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setShowDetail(false); setSelected(null) }} className="btn-ghost">Batal</button>
              <button
                onClick={handleUpdateStatus}
                disabled={saving || (newStatus === selected.status && newStatus !== 'selesai')}
                className="btn-primary"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={doUpdateStatus}
        title={newStatus === 'selesai' ? 'Selesaikan Pengajuan' : 'Tolak Pengajuan'}
        message={
          newStatus === 'selesai'
            ? 'Pengajuan akan diselesaikan. Pastikan file surat resmi sudah diupload. Lanjutkan?'
            : 'Apakah Anda yakin ingin menolak pengajuan ini?'
        }
        confirmLabel={newStatus === 'selesai' ? 'Selesaikan' : 'Tolak'}
        loading={saving}
      />
    </div>
  )
}
