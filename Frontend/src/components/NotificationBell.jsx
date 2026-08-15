import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Bell, Check, CheckCircle2, XCircle, Clock, FileText, ChevronRight } from 'lucide-react'

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Baru saja'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin}m yang lalu`
  if (diffHour < 24) return `${diffHour}j yang lalu`
  if (diffDay === 1) return 'Kemarin'
  if (diffDay < 7) return `${diffDay}h yang lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function NotificationBell({ role = 'mahasiswa' }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState([])
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`siasma_read_notifs_${role}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const popoverRef = useRef(null)

  const fetchNotifications = () => {
    setLoading(true)
    const endpoint = role === 'admin' ? '/admin/requests' : '/student/requests/history'
    api.get(endpoint)
      .then((res) => {
        setRequests(res.data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 20000) // Poll every 20s
    return () => clearInterval(interval)
  }, [role])

  useEffect(() => {
    try {
      localStorage.setItem(`siasma_read_notifs_${role}`, JSON.stringify(readIds))
    } catch {}
  }, [readIds, role])

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifications = useMemo(() => {
    if (!requests || requests.length === 0) return []

    // Admin only sees incoming requests with status 'diterima'
    const filteredList = role === 'admin'
      ? requests.filter((r) => r.status === 'diterima' || r.status === 'diajukan')
      : requests

    return filteredList.map((req) => {
      const reqCode = `#REQ-${String(req.id).padStart(3, '0')}`
      const categoryName = req.category?.nama_kategori || 'Surat'
      const mhsName = req.mahasiswa?.nama || req.user?.name || 'Mahasiswa'

      let title = ''
      let message = ''
      let icon = FileText
      let iconColor = 'text-blue-500 dark:text-blue-400'
      let bgColor = 'bg-blue-50 dark:bg-blue-900/30'

      if (role === 'admin') {
        title = 'Permohonan Surat Baru'
        message = `${mhsName} mengajukan ${categoryName} (${reqCode})`
        icon = Clock
        iconColor = 'text-amber-500 dark:text-amber-400'
        bgColor = 'bg-amber-50 dark:bg-amber-900/30'
      } else {
        if (req.status === 'selesai') {
          title = 'Surat Anda Selesai!'
          message = `Dokumen ${categoryName} (${reqCode}) siap diunduh.`
          icon = CheckCircle2
          iconColor = 'text-emerald-500 dark:text-emerald-400'
          bgColor = 'bg-emerald-50 dark:bg-emerald-900/30'
        } else if (req.status === 'ditolak') {
          title = 'Permohonan Ditolak'
          message = req.alasan_penolakan 
            ? `Ditolak: "${req.alasan_penolakan}"` 
            : `Permohonan ${categoryName} (${reqCode}) ditolak admin.`
          icon = XCircle
          iconColor = 'text-red-500 dark:text-red-400'
          bgColor = 'bg-red-50 dark:bg-red-900/30'
        } else if (req.status === 'diproses') {
          title = 'Surat Sedang Diproses'
          message = `Permohonan ${categoryName} (${reqCode}) sedang diproses admin.`
          icon = Clock
          iconColor = 'text-blue-500 dark:text-blue-400'
          bgColor = 'bg-blue-50 dark:bg-blue-900/30'
        } else if (req.status === 'diterima') {
          title = 'Permohonan Diterima'
          message = `Permohonan ${categoryName} (${reqCode}) telah diterima.`
          icon = CheckCircle2
          iconColor = 'text-sky-500 dark:text-sky-400'
          bgColor = 'bg-sky-50 dark:bg-sky-900/30'
        } else {
          title = 'Pengajuan Terkirim'
          message = `Permohonan ${categoryName} (${reqCode}) berhasil diajukan.`
          icon = Clock
          iconColor = 'text-amber-500 dark:text-amber-400'
          bgColor = 'bg-amber-50 dark:bg-amber-900/30'
        }
      }

      const notifId = `${req.id}_${req.status}_${req.updated_at || req.created_at || ''}`
      const isRead = readIds.includes(notifId)

      return {
        id: notifId,
        reqId: req.id,
        title,
        message,
        time: req.updated_at || req.tanggal_pengajuan || req.created_at,
        isRead,
        icon,
        iconColor,
        bgColor,
        status: req.status,
      }
    })
  }, [requests, role, readIds])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id)
    setReadIds(allIds)
  }

  const handleItemClick = (notif) => {
    if (!notif.isRead) {
      setReadIds((prev) => [...prev, notif.id])
    }
    setOpen(false)
    if (role === 'admin') {
      navigate('/admin/pengajuan')
    } else {
      navigate('/mahasiswa/riwayat')
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
        style={{ color: 'var(--text-secondary)' }}
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-navy-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all border animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: 'var(--bg-secondary, #ffffff)',
            borderColor: 'var(--border-color, #e2e8f0)',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium hover:underline flex items-center gap-1 text-blue-600 dark:text-sky-400"
              >
                <Check className="w-3.5 h-3.5" />
                Tandai Dibaca
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {notifications.length === 0 ? (
              <div className="py-10 text-center px-4">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-500" />
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Belum ada notifikasi baru</p>
              </div>
            ) : (
              notifications.map((n) => {
                const IconComponent = n.icon
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-navy-50 dark:hover:bg-navy-800/50 ${
                      !n.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.bgColor}`}>
                      <IconComponent className={`w-4 h-4 ${n.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] shrink-0 text-slate-500 dark:text-slate-400">
                          {formatTimeAgo(n.time)}
                        </span>
                      </div>
                      <p className="text-xs line-clamp-2 leading-relaxed text-slate-600 dark:text-slate-300">
                        {n.message}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 text-center border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
            <button
              onClick={() => {
                setOpen(false)
                navigate(role === 'admin' ? '/admin/pengajuan' : '/mahasiswa/riwayat')
              }}
              className="text-xs font-semibold flex items-center justify-center gap-1 mx-auto text-blue-600 dark:text-sky-400 hover:underline"
            >
              Lihat Semua Permohonan
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
