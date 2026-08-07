import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, Users, FolderOpen, FileText,
  Download, Send, Clock, LogOut, Sun, Moon, ChevronLeft
} from 'lucide-react'

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/mahasiswa', icon: Users, label: 'Kelola Mahasiswa' },
  { to: '/admin/kategori', icon: FolderOpen, label: 'Kategori & Template' },
  { to: '/admin/pengajuan', icon: FileText, label: 'Daftar Pengajuan' },
]

const mahasiswaLinks = [
  { to: '/mahasiswa', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/mahasiswa/template', icon: Download, label: 'Unduh Template' },
  { to: '/mahasiswa/pengajuan', icon: Send, label: 'Buat Pengajuan' },
  { to: '/mahasiswa/riwayat', icon: Clock, label: 'Riwayat & Status' },
]

export default function Sidebar({ role, open, onClose }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const links = role === 'admin' ? adminLinks : mahasiswaLinks
  const name = user?.mahasiswa?.nama || user?.username || 'User'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-50 w-64 h-full flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">SI</span>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SIASMA</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>STMIK Bandung</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <span className="text-primary dark:text-primary-200 font-semibold text-sm">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Selamat datang,</p>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }} title={name}>{name}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-200">
                {role === 'admin' ? 'Administrator' : 'Mahasiswa'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="section-title px-3 mb-2">Menu</p>
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'hover:bg-navy-100 dark:hover:bg-navy-800'
                  }`
                }
                style={({ isActive }) => isActive ? {} : { color: 'var(--text-secondary)' }}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-150 hover:bg-navy-100 dark:hover:bg-navy-800"
            style={{ color: 'var(--text-secondary)' }}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all duration-150"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}
