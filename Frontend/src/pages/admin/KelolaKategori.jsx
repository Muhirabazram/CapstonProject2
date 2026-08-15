import { Check, Download, Edit3, Filter, FolderOpen, Loader, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import { SkeletonTable } from '../../components/Skeleton'
import { useToast } from '../../context/ToastContext'

function formatTipeFile(tipe) {
  if (!tipe) return 'PDF'
  const t = tipe.toUpperCase()
  if (t === 'JPG' || t === 'PNG' || t === 'JPG/PNG' || t === 'JPEG') return 'JPG/PNG'
  if (t === 'DOC' || t === 'DOCX') return 'DOCX'
  return t
}

export default function KelolaKategori() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [form, setForm] = useState({ nama_kategori: '', grup_kategori: 'Akademik', deskripsi: '', ttd_digital: false, requirements: [], variables: [], file_template_permohonan: null, file_template_pengantar: null })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [downloading, setDownloading] = useState(null)

  // Filter states
  const [filterGroup, setFilterGroup] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')

  const toast = useToast()

  const fetchCategories = () => {
    api.get('/admin/categories').then((r) => setCategories(r.data.data)).catch(() => { }).finally(() => setLoading(false))
  }
  useEffect(() => { fetchCategories() }, [])

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Filter by group
      if (filterGroup !== 'semua') {
        const group = cat.grup_kategori || 'Akademik'
        if (group !== filterGroup) return false
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const nameMatch = (cat.nama_kategori || '').toLowerCase().includes(query)
        const descMatch = (cat.deskripsi || '').toLowerCase().includes(query)
        if (!nameMatch && !descMatch) return false
      }

      return true
    })
  }, [categories, filterGroup, searchQuery])

  const resetForm = () => setForm({ nama_kategori: '', grup_kategori: 'Akademik', deskripsi: '', ttd_digital: false, requirements: [], variables: [], file_template_permohonan: null, file_template_pengantar: null })

  const openAdd = () => { resetForm(); setEditCat(null); setFormError(''); setShowAdd(true) }
  const openEdit = (cat) => {
    setForm({
      nama_kategori: cat.nama_kategori,
      grup_kategori: cat.grup_kategori || 'Akademik',
      deskripsi: cat.deskripsi || '',
      ttd_digital: !!cat.ttd_digital,
      requirements: (cat.requirements || []).map((r) => ({
        nama_syarat: r.nama_syarat,
        tipe_file: (r.tipe_file === 'JPG' || r.tipe_file === 'PNG') ? 'JPG/PNG' : (r.tipe_file || 'PDF')
      })),
      variables: (cat.variables || []).map((v) => ({ nama_variabel: v.nama_variabel, tipe_input_html: v.tipe_input_html })),
      file_template_permohonan: null,
      file_template_pengantar: null,
    })
    setEditCat(cat)
    setFormError('')
    setShowAdd(true)
  }

  const addReq = () => setForm((f) => ({ ...f, requirements: [...f.requirements, { nama_syarat: '', tipe_file: 'PDF' }] }))
  const updateReq = (i, k, v) => setForm((f) => { const r = [...f.requirements]; r[i][k] = v; return { ...f, requirements: r } })
  const removeReq = (i) => setForm((f) => ({ ...f, requirements: f.requirements.filter((_, idx) => idx !== i) }))

  const addVar = () => setForm((f) => ({ ...f, variables: [...f.variables, { nama_variabel: '', tipe_input_html: 'text' }] }))
  const updateVar = (i, k, v) => setForm((f) => { const r = [...f.variables]; r[i][k] = v; return { ...f, variables: r } })
  const removeVar = (i) => setForm((f) => ({ ...f, variables: f.variables.filter((_, idx) => idx !== i) }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const fd = new FormData()
    fd.append('nama_kategori', form.nama_kategori)
    fd.append('grup_kategori', form.grup_kategori || 'Akademik')
    fd.append('deskripsi', form.deskripsi || '')
    fd.append('ttd_digital', form.ttd_digital ? '1' : '0')
    if (form.file_template_permohonan) fd.append('file_template_permohonan', form.file_template_permohonan)
    if (form.file_template_pengantar) fd.append('file_template_pengantar', form.file_template_pengantar)
    form.requirements.forEach((r, i) => {
      fd.append(`requirements[${i}][nama_syarat]`, r.nama_syarat)
      fd.append(`requirements[${i}][tipe_file]`, r.tipe_file)
    })
    form.variables.forEach((v, i) => {
      fd.append(`variables[${i}][nama_variabel]`, v.nama_variabel)
      fd.append(`variables[${i}][tipe_input_html]`, v.tipe_input_html)
    })
    try {
      const isEdit = !!editCat
      if (isEdit) {
        await api.post(`/admin/categories/${editCat.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/admin/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setShowAdd(false)
      setEditCat(null)
      resetForm()
      fetchCategories()
      toast.success(`Kategori berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`)
    } catch (err) {
      const msg = err.response?.data?.errors ? Object.values(err.response.data.errors)[0][0] : err.response?.data?.message || 'Gagal menyimpan'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/admin/categories/${deleteId}`)
      fetchCategories()
      toast.success('Kategori berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus kategori')
    } finally {
      setDeleteId(null)
    }
  }

  const handleDownloadTemplate = async (id, name) => {
    setDownloading(id)
    try {
      const response = await api.get(`/documents/template/${id}`, { responseType: 'blob' })
      if (response.data.size === 0) throw new Error('File kosong')
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `Template_${name.replace(/\s+/g, '_')}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Template berhasil diunduh')
    } catch (err) {
      const msg = err.response?.status === 404
        ? 'File template belum tersedia di server.'
        : 'Gagal mengunduh template.'
      toast.error(msg)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Kategori & Template</h2>
          <p className="page-description mt-1">Kelola jenis surat, prasyarat, form isian, dan template.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Kategori</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-navy-600 dark:text-navy-300 whitespace-nowrap flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Kelompok:
          </span>
          <button
            type="button"
            onClick={() => setFilterGroup('semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filterGroup === 'semua'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700'
            }`}
          >
            Semua ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterGroup('Akademik')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterGroup === 'Akademik'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
            }`}
          >
            🎓 Akademik
          </button>
          <button
            type="button"
            onClick={() => setFilterGroup('Kemahasiswaan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterGroup === 'Kemahasiswaan'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            🏆 Kemahasiswaan
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori..."
            className="input-base text-xs pl-9 py-1.5 rounded-lg w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <th className="table-header text-left px-6 py-3">Nama Kategori</th>
                <th className="table-header text-left px-6 py-3 hidden md:table-cell">Prasyarat</th>
                <th className="table-header text-left px-6 py-3 hidden lg:table-cell">Form Isian</th>
                <th className="table-header text-left px-6 py-3">Template</th>
                <th className="table-header text-left px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12"><SkeletonTable rows={4} cols={5} /></td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={5}><EmptyState message="Tidak ada kategori yang sesuai filter" icon={FolderOpen} /></td></tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="table-row">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{cat.nama_kategori}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          cat.grup_kategori === 'Kemahasiswaan'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        }`}>
                          {cat.grup_kategori || 'Akademik'}
                        </span>
                      </div>
                      {cat.deskripsi && <p className="text-xs mt-0.5 truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>{cat.deskripsi}</p>}
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(cat.requirements || []).map((r, i) => (
                          <span key={i} className="badge bg-navy-100 dark:bg-navy-800" style={{ color: 'var(--text-secondary)' }}>
                            {r.nama_syarat} ({formatTipeFile(r.tipe_file)})
                          </span>
                        ))}
                        {(!cat.requirements || cat.requirements.length === 0) && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(cat.variables || []).map((v, i) => (
                          <span key={i} className="badge bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-200">{v.nama_variabel}</span>
                        ))}
                        {(!cat.variables || cat.variables.length === 0) && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        {(cat.file_template_permohonan_path || cat.file_template_path) ? (
                          <span className="badge bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px]">
                            <Check className="w-2.5 h-2.5 mr-1" />
                            Permohonan
                          </span>
                        ) : (
                          <span className="badge bg-navy-100 dark:bg-navy-800 text-[10px]" style={{ color: 'var(--text-muted)' }}>- Permohonan</span>
                        )}
                        {(cat.file_template_pengantar_path || cat.file_template_path) ? (
                          <span className="badge bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px]">
                            <Check className="w-2.5 h-2.5 mr-1" />
                            Pengantar
                          </span>
                        ) : (
                          <span className="badge bg-navy-100 dark:bg-navy-800 text-[10px]" style={{ color: 'var(--text-muted)' }}>- Pengantar</span>
                        )}
                        {cat.ttd_digital && (
                          <span className="badge bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px]">
                            + TTD Digital
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(cat)} className="btn-ghost btn-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(cat.id)} className="btn-sm flex items-center gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-3 py-1.5 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditCat(null) }} title={editCat ? 'Edit Kategori Surat' : 'Tambah Kategori Surat'} wide>
        <form onSubmit={handleSave} className="space-y-5">
          {formError && (
            <div className="px-4 py-3 rounded-xl text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              {formError}
            </div>
          )}

          {editCat && (
            <div className="px-4 py-3 rounded-xl text-xs bg-navy-50 dark:bg-navy-900/50" style={{ color: 'var(--text-secondary)' }}>
              {editCat.file_template_path ? (
                <span>Template saat ini: <strong>{editCat.file_template_path.split('/').pop()}</strong> &mdash; Upload file baru untuk mengganti.</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">Belum ada template. Upload .docx agar mahasiswa bisa download template.</span>
              )}
            </div>
          )}

          {/* Info Surat */}
          <div className="space-y-4">
            <h4 className="section-title">Informasi Surat</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nama Kategori Surat</label>
                <input type="text" value={form.nama_kategori} onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })} className="input-base" placeholder="Contoh: Surat Pengantar Penelitian" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Kelompok Surat</label>
                <select
                  value={form.grup_kategori}
                  onChange={(e) => setForm({ ...form, grup_kategori: e.target.value })}
                  className="select-base"
                >
                  <option value="Akademik">Akademik</option>
                  <option value="Kemahasiswaan">Kemahasiswaan</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Deskripsi</label>
              <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="input-base" rows={2} placeholder="Deskripsi singkat tentang surat ini" />
            </div>
          </div>

          {/* Template */}
          <div className="space-y-4">
            <h4 className="section-title">Template Surat & Pengaturan</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  1. Template Surat Permohonan (.docx)
                </label>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Dibuat saat Mahasiswa mengajukan surat.</p>
                <input
                  type="file"
                  accept=".docx"
                  onChange={(e) => setForm({ ...form, file_template_permohonan: e.target.files[0] })}
                  className="block w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer"
                />
                {(editCat?.file_template_permohonan_path || editCat?.file_template_path) && !form.file_template_permohonan && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">✓ Template permohonan aktif</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  2. Template Surat Pengantar (.docx)
                </label>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Dibuat saat Admin menyetujui surat.</p>
                <input
                  type="file"
                  accept=".docx"
                  onChange={(e) => setForm({ ...form, file_template_pengantar: e.target.files[0] })}
                  className="block w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer"
                />
                {(editCat?.file_template_pengantar_path || editCat?.file_template_path) && !form.file_template_pengantar && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">✓ Template pengantar aktif</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.ttd_digital}
                  onChange={(e) => setForm({ ...form, ttd_digital: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-700"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Memerlukan TTD Digital Mahasiswa (untuk Surat Permohonan)
                </span>
              </label>
              <p className="text-xs mt-1 ml-6" style={{ color: 'var(--text-muted)' }}>
                Jika diaktifkan, mahasiswa wajib mengunggah file TTD digital (PNG/JPG) yang akan otomatis terpasang pada Surat Permohonan.
              </p>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="section-title">Persyaratan Dokumen</h4>
              <button type="button" onClick={addReq} className="btn-ghost btn-sm flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>
            {form.requirements.length === 0 && (
              <p className="text-xs py-3 text-center rounded-xl" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}>
                Belum ada persyaratan. Klik "Tambah" untuk menambahkan.
              </p>
            )}
            {form.requirements.map((r, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-xs font-medium mt-2.5 w-6" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                <input type="text" value={r.nama_syarat} onChange={(e) => updateReq(i, 'nama_syarat', e.target.value)} className="input-base flex-1" placeholder="Nama persyaratan" />
                <select value={r.tipe_file === 'JPG' || r.tipe_file === 'PNG' ? 'JPG/PNG' : r.tipe_file} onChange={(e) => updateReq(i, 'tipe_file', e.target.value)} className="select-base w-32">
                  <option value="PDF">PDF</option>
                  <option value="JPG/PNG">JPG/PNG</option>
                  <option value="DOCX">DOCX</option>
                </select>
                <button type="button" onClick={() => removeReq(i)} className="mt-2 p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Variables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="section-title">Variabel Form Isian</h4>
              <button type="button" onClick={addVar} className="btn-ghost btn-sm flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>
            {form.variables.length === 0 && (
              <p className="text-xs py-3 text-center rounded-xl" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}>
                Belum ada variabel. Klik "Tambah" untuk menambahkan.
              </p>
            )}
            {form.variables.map((v, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-xs font-medium mt-2.5 w-6" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                <input type="text" value={v.nama_variabel} onChange={(e) => updateVar(i, 'nama_variabel', e.target.value)} className="input-base flex-1" placeholder="Nama variabel (gunakan _ untuk spasi)" />
                <select value={v.tipe_input_html} onChange={(e) => updateVar(i, 'tipe_input_html', e.target.value)} className="select-base w-32">
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="date">Date</option>
                  <option value="number">Number</option>
                </select>
                <button type="button" onClick={() => removeVar(i)} className="mt-2 p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={() => { setShowAdd(false); setEditCat(null) }} className="btn-ghost">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori ini? Semua data terkait akan dihapus secara permanen."
        confirmLabel="Hapus"
      />
    </div>
  )
}
