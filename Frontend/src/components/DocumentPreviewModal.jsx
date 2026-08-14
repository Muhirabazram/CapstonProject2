import { AlertCircle, Download, FileText, Info, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../api/axios'

/**
 * DocumentPreviewModal
 *
 * Props:
 *  - isOpen        : boolean
 *  - onClose       : () => void
 *  - title         : string
 *  - reqId         : number | null
 *  - fileBlob      : Blob | null
 *  - filename      : string
 *  - onDownload    : () => void | null
 */
export default function DocumentPreviewModal({
  isOpen,
  onClose,
  title = 'Preview Dokumen',
  reqId = null,
  fileBlob = null,
  filename = '',
  onDownload = null
}) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState('') // 'docx' | 'pdf' | 'image'
  const [pdfUrl, setPdfUrl] = useState('')
  const [zoom, setZoom] = useState(100)

  const cleanup = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl('')
    }
    setPreviewMode('')
    setLoading(true)
    setError('')
    setZoom(100)
  }, [pdfUrl])

  useEffect(() => {
    if (!isOpen) {
      cleanup()
      return
    }

    let isMounted = true
    setLoading(true)
    setError('')
    setPreviewMode('')

    const load = async () => {
      let blob = fileBlob

      // If reqId is provided and no fileBlob, fetch blob from download endpoint
      if (!blob && reqId) {
        try {
          const res = await api.get(`/documents/download/${reqId}`, { responseType: 'blob' })
          if (!isMounted) return
          blob = res.data
        } catch (_err) {
          if (isMounted) {
            setError('Gagal mengunduh dokumen untuk preview.')
            setLoading(false)
          }
          return
        }
      }

      if (!blob) {
        if (isMounted) {
          setError('Dokumen tidak ditemukan.')
          setLoading(false)
        }
        return
      }

      const ext = filename.split('.').pop()?.toLowerCase() || ''
      const mimeType = blob.type || ''

      // PDF
      if (ext === 'pdf' || mimeType.includes('pdf')) {
        const url = URL.createObjectURL(blob)
        if (!isMounted) return
        setPdfUrl(url)
        setPreviewMode('pdf')
        setLoading(false)
        return
      }

      // Image
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || mimeType.startsWith('image/')) {
        const url = URL.createObjectURL(blob)
        if (!isMounted) return
        setPdfUrl(url)
        setPreviewMode('image')
        setLoading(false)
        return
      }

      // DOCX / DOC: render with docx-preview
      setPreviewMode('docx')
      const arrayBuffer = await blob.arrayBuffer()
      if (!isMounted) return

      setTimeout(async () => {
        if (!isMounted) return
        try {
          if (containerRef.current) {
            containerRef.current.innerHTML = ''
            const { renderAsync } = await import('docx-preview')
            await renderAsync(arrayBuffer, containerRef.current, null, {
              className: 'docx-rendered',
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              experimental: true,
              useBase64URL: true,
            })
          }
        } catch (err) {
          if (isMounted) {
            setError('Gagal merender dokumen.')
          }
        } finally {
          if (isMounted) setLoading(false)
        }
      }, 100)
    }

    load()

    return () => { isMounted = false }
  }, [isOpen, reqId, fileBlob, filename])

  if (!isOpen) return null

  const handleDirectDownload = () => {
    if (onDownload) {
      onDownload()
    } else if (fileBlob) {
      const url = URL.createObjectURL(fileBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'Dokumen.docx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate">{title}</h3>
              {filename && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{filename}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom only in docx mode */}
            {previewMode === 'docx' && !loading && !error && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2 text-xs text-slate-600 dark:text-slate-300">
                <button type="button" onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Zoom Out">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 font-medium">{zoom}%</span>
                <button type="button" onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Zoom In">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {(onDownload || fileBlob) && (
              <button type="button" onClick={handleDirectDownload} className="btn-ghost btn-sm text-blue-600 dark:text-blue-400 flex items-center gap-1.5" title="Unduh Dokumen">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Unduh</span>
              </button>
            )}

            <button type="button" onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {previewMode === 'docx' && !loading && !error && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-5 py-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Catatan: Tampilan preview mungkin memiliki sedikit perbedaan dengan format Word asli. Jika kurang rapi, silakan unduh file untuk melihat dokumen resmi.</span>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-hidden relative">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Memuat preview dokumen...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="flex flex-col items-center space-y-3 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 max-w-md text-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className="font-semibold text-red-600 dark:text-red-400">{error}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Silakan gunakan tombol Unduh untuk mengunduh dokumen.</p>
              </div>
            </div>
          )}

          {/* PDF mode */}
          {!loading && !error && previewMode === 'pdf' && pdfUrl && (
            <iframe
              key={pdfUrl}
              src={pdfUrl}
              title="Preview Surat"
              className="w-full h-full border-0"
              style={{ display: 'block', minHeight: '100%' }}
            />
          )}

          {/* Image mode */}
          {!loading && !error && previewMode === 'image' && pdfUrl && (
            <div className="w-full h-full overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
              <img src={pdfUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
            </div>
          )}

          {/* Docx mode with docx-preview */}
          {previewMode === 'docx' && !error && (
            <div className="w-full h-full overflow-auto p-3 bg-slate-200 dark:bg-slate-950">
              <div
                ref={containerRef}
                className="docx-container flex flex-col items-center"
                style={{ zoom: `${zoom}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
