import { Menu, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import NotificationBell from '../../components/NotificationBell'
import { useTheme } from '../../context/ThemeContext'

export default function MahasiswaLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar role="mahasiswa" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header
          className="h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 backdrop-blur-md"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
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
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>SIASMA</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sistem Pengelolaan Administrasi Surat</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell role="mahasiswa" />
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
              style={{ color: 'var(--text-secondary)' }}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
