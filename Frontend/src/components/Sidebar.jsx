import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNeo } from '../context/NeoContext'
import {
  LayoutDashboard, Users, FolderOpen, FileText,
  Send, Clock, LogOut, ChevronLeft, User, GraduationCap
} from 'lucide-react'

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/mahasiswa', icon: Users, label: 'Kelola Mahasiswa' },
  { to: '/admin/kategori', icon: FolderOpen, label: 'Kategori & Template' },
  { to: '/admin/pengajuan', icon: FileText, label: 'Daftar Pengajuan' },
]

const mahasiswaLinks = [
  { to: '/mahasiswa', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/mahasiswa/pengajuan', icon: Send, label: 'Buat Pengajuan' },
  { to: '/mahasiswa/riwayat', icon: Clock, label: 'Riwayat & Status' },
]

const profileLink = {
  admin: { to: '/admin/profil', icon: User, label: 'Profil Saya' },
  mahasiswa: { to: '/mahasiswa/profil', icon: User, label: 'Profil Saya' },
}

export default function Sidebar({ role, open, onClose }) {
  const { user, logout } = useAuth()
  const { workspaceMode } = useNeo()
  const navigate = useNavigate()
  const location = useLocation()
  const links = role === 'admin' ? adminLinks : mahasiswaLinks
  const profile = profileLink[role]
  const name = user?.mahasiswa?.nama || user?.name || user?.username || 'User'
  const isNeo = workspaceMode === 'neo'

  const isActive = (path, end) => {
    if (end) return location.pathname === path
    return location.pathname.startsWith(path)
  }

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
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
          isNeo ? 'w-[68px] hover:w-60 group' : 'w-64'
        } ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isNeo ? 'neo-sidebar' : ''}`}
        style={{
          backgroundColor: isNeo ? undefined : 'var(--sidebar-bg)',
          borderRight: `1px solid ${isNeo ? 'var(--neo-panel-border)' : 'var(--sidebar-border)'}`,
        }}
      >
        {/* Logo */}
        <div
          className={`flex items-center ${isNeo ? 'justify-center py-4 px-2 group-hover:px-4 group-hover:justify-start' : 'justify-between p-5'} transition-all duration-300`}
          style={{ borderBottom: `1px solid ${isNeo ? 'var(--neo-panel-border)' : 'var(--border-color)'}` }}
        >
          <div className={`flex items-center gap-3 ${isNeo ? 'min-w-0' : ''}`}>
            <div className={`shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center`}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className={`${isNeo ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap' : ''}`}>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SIASMA</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>STMIK Bandung</p>
            </div>
          </div>
          {!isNeo && (
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Info */}
        <div
          className={`px-3 py-4 transition-all duration-300`}
          style={{ borderBottom: `1px solid ${isNeo ? 'var(--neo-panel-border)' : 'var(--border-color)'}` }}
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-primary dark:text-primary-200" />
            </div>
            <div className={`flex-1 min-w-0 ${isNeo ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-300' : ''}`}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Selamat datang,</p>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }} title={name}>{name}</p>
              {user?.mahasiswa?.nim && (
                <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{user.mahasiswa.nim}</p>
              )}
              <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-200">
                {role === 'admin' ? 'Administrator' : 'Mahasiswa'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {!isNeo && <p className="section-title px-3 mb-2 mt-1">Menu</p>}
          {links.map((link) => {
            const Icon = link.icon
            const active = isActive(link.to, link.end)
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={`flex items-center gap-3 ${isNeo ? 'justify-center group-hover:justify-start px-0 group-hover:px-3 mx-1' : 'px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  active
                    ? isNeo
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-200'
                      : 'bg-primary text-white shadow-sm'
                    : isNeo
                      ? 'text-secondary hover:bg-primary/5 dark:hover:bg-primary/10'
                      : 'hover:bg-navy-100 dark:hover:bg-navy-800'
                }`}
                style={active && !isNeo ? {} : { color: 'var(--text-secondary)' }}
                title={link.label}
              >
                {isNeo && active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                <span className={`${isNeo ? 'hidden group-hover:inline transition-all duration-300' : ''}`}>{link.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={`p-2 space-y-0.5`} style={{ borderTop: `1px solid ${isNeo ? 'var(--neo-panel-border)' : 'var(--border-color)'}` }}>
          <NavLink
            to={profile.to}
            onClick={onClose}
            className={({ isActive: a }) =>
              `flex items-center gap-3 ${isNeo ? 'justify-center group-hover:justify-start px-0 group-hover:px-3 mx-1' : 'px-3'} py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 relative ${
                a
                  ? isNeo
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-200'
                    : 'bg-primary text-white shadow-sm'
                  : isNeo
                    ? 'text-secondary hover:bg-primary/5 dark:hover:bg-primary/10'
                    : 'hover:bg-navy-100 dark:hover:bg-navy-800'
              }`
            }
            style={({ isActive: a }) => a && !isNeo ? {} : { color: 'var(--text-secondary)' }}
            title="Profil Saya"
          >
            {({ isActive: a }) => (
              <>
                {isNeo && a && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                )}
                <User className="w-5 h-5 shrink-0" />
                <span className={`${isNeo ? 'hidden group-hover:inline transition-all duration-300' : ''}`}>Profil Saya</span>
              </>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 ${isNeo ? 'justify-center group-hover:justify-start px-0 group-hover:px-3 mx-1' : 'px-3'} py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all duration-200`}
            title="Keluar"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`${isNeo ? 'hidden group-hover:inline transition-all duration-300' : ''}`}>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
