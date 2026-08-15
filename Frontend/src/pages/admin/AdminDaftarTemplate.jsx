import { useState, useEffect } from 'react'
import api from '../../api/axios'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'
import { useToast } from '../../context/ToastContext'
import { Download, FileText, Loader, FilePen, Send } from 'lucide-react'

export default function AdminDaftarTemplate() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)
  const toast = useToast()

  useEffect(() => {
    api.get('/admin/categories').then((r) => setCategories(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleDownload = async (id, name, type) => {
    const key = `${id}-${type}`
    setDownloading(key)
    try {
      const response = await api.get(`/documents/template/${id}?type=${type}`, { responseType: 'blob' })
      if (response.data.size === 0) throw new Error('File kosong')
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      const suffix = type === 'permohonan' ? 'Permohonan' : 'Pengantar'
      a.download = `Template_${name.replace(/\s+/g, '_')}_${suffix}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Template ${suffix} berhasil diunduh`)
    } catch (err) {
      const msg = err.response?.status === 404
        ? `File template ${type === 'permohonan' ? 'permohonan' : 'pengantar'} belum tersedia.`
        : 'Gagal mengunduh template.'
      toast.error(msg)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Unduh Template</h2>
        <p className="page-description mt-1">Download template kosong surat permohonan dan pengantar untuk keperluan administrasi.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState message="Belum ada template tersedia" icon={FileText} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const hasPermohonan = !!(cat.file_template_permohonan_path || cat.file_template_path)
            const hasPengantar = !!(cat.file_template_pengantar_path || cat.file_template_path)
            const hasAny = hasPermohonan || hasPengantar

            return (
              <div key={cat.id} className="card card-hover p-6 flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary dark:text-primary-200" />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{cat.nama_kategori}</h3>
                <p className="text-sm mb-4 flex-1" style={{ color: 'var(--text-muted)' }}>
                  {cat.deskripsi || 'Template surat kosong'}
                </p>

                {hasAny ? (
                  <div className="space-y-2">
                    {hasPermohonan && (
                      <button
                        onClick={() => handleDownload(cat.id, cat.nama_kategori, 'permohonan')}
                        disabled={downloading === `${cat.id}-permohonan`}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {downloading === `${cat.id}-permohonan` ? (
                          <><Loader className="w-4 h-4 animate-spin" /> Mengunduh...</>
                        ) : (
                          <><FilePen className="w-4 h-4" /> Unduh Template Permohonan</>
                        )}
                      </button>
                    )}
                    {hasPengantar && (
                      <button
                        onClick={() => handleDownload(cat.id, cat.nama_kategori, 'pengantar')}
                        disabled={downloading === `${cat.id}-pengantar`}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {downloading === `${cat.id}-pengantar` ? (
                          <><Loader className="w-4 h-4 animate-spin" /> Mengunduh...</>
                        ) : (
                          <><Send className="w-4 h-4" /> Unduh Template Pengantar</>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2.5 rounded-xl text-xs font-medium bg-navy-100 dark:bg-navy-800" style={{ color: 'var(--text-muted)' }}>
                    Template belum tersedia
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
