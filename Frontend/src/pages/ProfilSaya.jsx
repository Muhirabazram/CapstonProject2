import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { User, Lock, Save, Mail, Phone, MapPin, Calendar, GraduationCap, Shield, Eye, EyeOff } from 'lucide-react'

export default function ProfilSaya() {
  const { user } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const [form, setForm] = useState({
    name: '', alamat: '',
    angkatan: '', jenis_kelamin: '', jenis_mahasiswa: '',
    tempat_lahir: '', tanggal_lahir: '', dosen_wali: '', status_mahasiswa: '',
  })

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    api.get('/profile').then((r) => {
      const u = r.data.data
      setProfile(u)
      setForm({
        name: u.name || '',
        alamat: u.mahasiswa?.alamat || '',
        angkatan: u.mahasiswa?.angkatan || '',
        jenis_kelamin: u.mahasiswa?.jenis_kelamin || '',
        jenis_mahasiswa: u.mahasiswa?.jenis_mahasiswa || 'Reguler',
        tempat_lahir: u.mahasiswa?.tempat_lahir || '',
        tanggal_lahir: u.mahasiswa?.tanggal_lahir ? u.mahasiswa.tanggal_lahir.split('T')[0] : '',
        dosen_wali: u.mahasiswa?.dosen_wali || '',
        status_mahasiswa: u.mahasiswa?.status_mahasiswa || 'Aktif',
      })
    }).catch(() => toast.error('Gagal memuat profil')).finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/profile', form)
      setProfile(res.data.data)
      toast.success('Profil berhasil diperbarui')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan profil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.new_password_confirmation) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }
    setSavingPw(true)
    try {
      await api.put('/profile/password', pwForm)
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' })
      toast.success('Password berhasil diperbarui')
    } catch (err) {
      const msg = err.response?.data?.errors ? Object.values(err.response.data.errors)[0][0] : err.response?.data?.message || 'Gagal mengubah password'
      toast.error(msg)
    } finally {
      setSavingPw(false)
    }
  }

  const name = profile?.mahasiswa?.nama || profile?.name || profile?.username || 'User'
  const nim = profile?.mahasiswa?.nim || ''
  const prodi = profile?.mahasiswa?.prodi || ''
  const role = profile?.role || ''

  const InfoRow = ({ label, value }) => (
    <div>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{value || '-'}</p>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  const passwordSection = (
    <form onSubmit={handleChangePassword} className="card p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Lock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ubah Password</h3>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password Saat Ini</label>
        <div className="relative">
          <input
            type={showPw.current ? 'text' : 'password'}
            value={pwForm.current_password}
            onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
            className="input-base w-full pr-10"
            placeholder="Masukkan password saat ini"
            required
          />
          <button type="button" onClick={() => setShowPw({ ...showPw, current: !showPw.current })} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password Baru</label>
          <div className="relative">
            <input
              type={showPw.new ? 'text' : 'password'}
              value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
              className="input-base w-full pr-10"
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
            <button type="button" onClick={() => setShowPw({ ...showPw, new: !showPw.new })} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Konfirmasi Password Baru</label>
          <div className="relative">
            <input
              type={showPw.confirm ? 'text' : 'password'}
              value={pwForm.new_password_confirmation}
              onChange={(e) => setPwForm({ ...pwForm, new_password_confirmation: e.target.value })}
              className="input-base w-full pr-10"
              placeholder="Ulangi password baru"
              required
            />
            <button type="button" onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
        <button type="submit" disabled={savingPw} className="btn-primary flex items-center gap-2">
          {savingPw ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          {savingPw ? 'Menyimpan...' : 'Ubah Password'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="page-title">Profil Saya</h2>
        <p className="page-description mt-1">
          {isAdmin ? 'Kelola informasi akun dan data pribadi Anda.' : 'Lihat informasi akun dan data pribadi Anda.'}
        </p>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary dark:text-primary-200 font-bold text-3xl">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{name}</h3>
            {nim && <p className="text-sm font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{nim}</p>}
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              <span className="badge bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-200">
                {role === 'admin' ? 'Administrator' : 'Mahasiswa'}
              </span>
              {prodi && (
                <span className="badge bg-navy-100 dark:bg-navy-800" style={{ color: 'var(--text-secondary)' }}>
                  {prodi}
                </span>
              )}
              {profile?.mahasiswa?.status_mahasiswa && (
                <span className={`badge ${
                  profile.mahasiswa.status_mahasiswa === 'Aktif'
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                }`}>
                  {profile.mahasiswa.status_mahasiswa}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAdmin ? (
        /* ========== ADMIN: Full edit form + password on right ========== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Edit Form */}
          <form onSubmit={handleSaveProfile} className="lg:col-span-2 card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Informasi Akun</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nama Lengkap</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base w-full" placeholder="Nama lengkap" />
              </div>
              {nim && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>NIM</label>
                  <input type="text" value={nim} disabled className="input-base w-full opacity-60 cursor-not-allowed" />
                </div>
              )}
            </div>

            {role === 'mahasiswa' && (
              <>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Data Akademik</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Angkatan</label>
                      <input type="text" value={form.angkatan} onChange={(e) => setForm({ ...form, angkatan: e.target.value })} className="input-base w-full" placeholder="Contoh: 2024" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Program Studi</label>
                      <input type="text" value={prodi} disabled className="input-base w-full opacity-60 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Jenis Kelamin</label>
                      <select value={form.jenis_kelamin} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })} className="select-base w-full">
                        <option value="">Pilih</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Jenis Mahasiswa</label>
                      <select value={form.jenis_mahasiswa} onChange={(e) => setForm({ ...form, jenis_mahasiswa: e.target.value })} className="select-base w-full">
                        <option value="Reguler">Reguler</option>
                        <option value="Kelas Karyawan">Kelas Karyawan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Dosen Wali</label>
                      <input type="text" value={form.dosen_wali} onChange={(e) => setForm({ ...form, dosen_wali: e.target.value })} className="input-base w-full" placeholder="Nama dosen wali" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
                      <select value={form.status_mahasiswa} onChange={(e) => setForm({ ...form, status_mahasiswa: e.target.value })} className="select-base w-full">
                        <option value="Aktif">Aktif</option>
                        <option value="Cuti">Cuti</option>
                        <option value="Lulus">Lulus</option>
                        <option value="Keluar">Keluar</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Data Pribadi</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tempat Lahir</label>
                      <input type="text" value={form.tempat_lahir} onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })} className="input-base w-full" placeholder="Kota lahir" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tanggal Lahir</label>
                      <input type="date" value={form.tanggal_lahir} onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })} className="input-base w-full" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Alamat</label>
                      <textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="input-base w-full" rows={2} placeholder="Alamat lengkap" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>

          {/* Right: Password */}
          <div className="lg:col-span-1">
            {passwordSection}
          </div>
        </div>
      ) : (
        /* ========== MAHASISWA: Read-only + password on right ========== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Read-only info */}
          <div className="lg:col-span-2 card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Informasi Akun</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Nama Lengkap" value={profile?.mahasiswa?.nama || profile?.name || profile?.username} />
              <InfoRow label="NIM" value={nim} />
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Data Akademik</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Angkatan" value={profile?.mahasiswa?.angkatan} />
                <InfoRow label="Program Studi" value={prodi} />
                <InfoRow label="Jenis Kelamin" value={profile?.mahasiswa?.jenis_kelamin === 'L' ? 'Laki-laki' : profile?.mahasiswa?.jenis_kelamin === 'P' ? 'Perempuan' : ''} />
                <InfoRow label="Jenis Mahasiswa" value={profile?.mahasiswa?.jenis_mahasiswa} />
                <InfoRow label="Dosen Wali" value={profile?.mahasiswa?.dosen_wali} />
                <InfoRow label="Status" value={profile?.mahasiswa?.status_mahasiswa} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Data Pribadi</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Tempat Lahir" value={profile?.mahasiswa?.tempat_lahir} />
                <InfoRow label="Tanggal Lahir" value={profile?.mahasiswa?.tanggal_lahir} />
                <div className="sm:col-span-2">
                  <InfoRow label="Alamat" value={profile?.mahasiswa?.alamat} />
                </div>
              </div>
            </div>

            <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Shield className="w-3.5 h-3.5" />
                Data pribadi hanya dapat diubah oleh admin.
              </p>
            </div>
          </div>

          {/* Right: Password */}
          <div className="lg:col-span-1">
            {passwordSection}
          </div>
        </div>
      )}
    </div>
  )
}
