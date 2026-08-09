import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ImportMahasiswa from './pages/admin/ImportMahasiswa'
import KelolaKategori from './pages/admin/KelolaKategori'
import KelolaPengajuan from './pages/admin/KelolaPengajuan'
import MahasiswaLayout from './pages/mahasiswa/MahasiswaLayout'
import MahasiswaDashboard from './pages/mahasiswa/MahasiswaDashboard'
import DaftarTemplate from './pages/mahasiswa/DaftarTemplate'
import FormPengajuan from './pages/mahasiswa/FormPengajuan'
import RiwayatStatus from './pages/mahasiswa/RiwayatStatus'
import ProfilSaya from './pages/ProfilSaya'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/mahasiswa'} replace /> : <Login />} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="mahasiswa" element={<ImportMahasiswa />} />
        <Route path="kategori" element={<KelolaKategori />} />
        <Route path="pengajuan" element={<KelolaPengajuan />} />
        <Route path="profil" element={<ProfilSaya />} />
      </Route>
      <Route path="/mahasiswa" element={<ProtectedRoute role="mahasiswa"><MahasiswaLayout /></ProtectedRoute>}>
        <Route index element={<MahasiswaDashboard />} />
        <Route path="template" element={<DaftarTemplate />} />
        <Route path="pengajuan" element={<FormPengajuan />} />
        <Route path="riwayat" element={<RiwayatStatus />} />
        <Route path="profil" element={<ProfilSaya />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
