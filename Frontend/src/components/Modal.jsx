import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useNeo } from '../context/NeoContext'

export default function Modal({ open, onClose, title, children, wide }) {
  const overlayRef = useRef(null)
  const { workspaceMode } = useNeo()
  const isNeo = workspaceMode === 'neo'

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && open) onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${isNeo ? 'neo-modal-overlay' : 'animate-fade-in'}`}
      style={{
        backgroundColor: isNeo ? undefined : 'var(--overlay)',
        top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} flex flex-col ${isNeo ? 'neo-modal-content' : 'card shadow-elevated animate-slide-up'}`}
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        {isNeo ? (
          <div className="neo-window-header">
            <div className="flex gap-1.5">
              <span className="neo-dot neo-dot-red" />
              <span className="neo-dot neo-dot-yellow" />
              <span className="neo-dot neo-dot-green" />
            </div>
            <h3 className="flex-1 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
