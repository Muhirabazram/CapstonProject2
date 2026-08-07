import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { Menu } from 'lucide-react'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar role="admin" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header
          className="h-16 flex items-center px-4 lg:px-8 sticky top-0 z-30 backdrop-blur-md"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-3 w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sistem Administrasi Surat</p>
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
