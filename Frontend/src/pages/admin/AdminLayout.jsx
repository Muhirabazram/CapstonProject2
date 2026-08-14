import { Menu, Moon, Sun, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import NotificationBell from '../../components/NotificationBell'
import { useTheme } from '../../context/ThemeContext'
import { useNeo } from '../../context/NeoContext'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clock, setClock] = useState({ time: '', date: '' })
  const { theme, toggleTheme } = useTheme()
  const { workspaceMode } = useNeo()
  const isNeo = workspaceMode === 'neo'

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
      setClock({
        time: `${h}:${m}:${s} WIB`,
        date: `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
      })
    }
    updateClock()
    const id = setInterval(updateClock, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className={`flex min-h-screen relative ${isNeo ? '' : ''}`}
      style={{ backgroundColor: isNeo ? 'transparent' : 'var(--bg-primary)' }}
    >
      <Sidebar role="admin" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={`flex-1 flex flex-col min-w-0 ${isNeo ? 'relative z-10' : ''}`}>
        {/* Navbar */}
        <header
          className={`h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 ${isNeo ? 'neo-topbar' : 'backdrop-blur-md'}`}
          style={{
            backgroundColor: isNeo ? undefined : 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Sistem Administrasi Surat Mahasiswa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {clock.time && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3.5 h-3.5" />
                <span>{clock.time}</span>
                <span className="hidden md:inline">·</span>
                <span className="hidden md:inline">{clock.date}</span>
              </div>
            )}
            <NotificationBell role="admin" />
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
              style={{ color: 'var(--text-secondary)' }}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className={`flex-1 p-4 lg:p-6 overflow-y-auto ${isNeo ? 'neo-page-enter' : 'page-enter'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
