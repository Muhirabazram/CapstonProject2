import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNeo } from '../context/NeoContext'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sun, Moon, LogIn, GraduationCap } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { workspaceMode } = useNeo()
  const navigate = useNavigate()
  const isNeo = workspaceMode === 'neo'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      navigate(user.role === 'admin' ? '/admin' : '/mahasiswa')
    } catch (err) {
      const msg = err.response?.data?.errors?.username?.[0] || err.response?.data?.message || 'Username atau password salah'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex relative ${isNeo ? '' : ''}`} style={{ backgroundColor: isNeo ? 'transparent' : 'var(--bg-primary)' }}>
      {/* Left Panel - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/login-bg.jpg"
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 flex flex-col justify-end px-16 pb-16 text-white">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight tracking-tight">Sistem<br />Administrasi<br />Surat Mahasiswa</h1>
          <p className="text-white/80 text-xl max-w-md leading-relaxed">Platform terintegrasi untuk pengelolaan surat pengantar penelitian dan administrasi akademik STMIK Bandung.</p>
          <div className="mt-8 flex items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Sistem Aktif</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <span>STMIK Bandung</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Top Controls */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
            style={{ color: 'var(--text-muted)' }}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className={`lg:hidden text-center mb-8 ${isNeo ? 'neo-page-enter neo-stagger-1' : ''}`}>
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>SIASMA</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>STMIK Bandung</p>
          </div>

          <div className={`mb-8 ${isNeo ? 'neo-page-enter neo-stagger-2' : ''}`}>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Masuk ke Akun</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              'Masukkan kredensial Anda untuk mengelola surat administrasi'
            </p>
          </div>

          <form onSubmit={handleSubmit} className={`space-y-5 ${isNeo ? 'neo-page-enter neo-stagger-3' : ''}`}>
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                NIM / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-base"
                placeholder="Masukkan NIM atau Username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pr-11"
                  placeholder="Masukkan Password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-navy-100 dark:hover:bg-navy-800"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${isNeo ? 'neo-btn' : ''} btn-primary w-full flex items-center justify-center gap-2 py-3`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk
                </>
              )}
            </button>
          </form>

          <p className={`text-center text-xs mt-8 ${isNeo ? 'neo-page-enter neo-stagger-4' : ''}`} style={{ color: 'var(--text-muted)' }}>
            Lupa password? Hubungi Bagian Akademik
          </p>
        </div>
      </div>
    </div>
  )
}
