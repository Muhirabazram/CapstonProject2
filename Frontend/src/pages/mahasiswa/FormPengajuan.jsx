import { AlertCircle, ArrowLeft, ArrowRight, Award, CheckCircle, FileText, GraduationCap, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import { useToast } from '../../context/ToastContext'

export default function FormPengajuan() {
  const navigate = useNavigate()
  const location = useLocation()
  const reapplyReq = location.state?.reapplyReq

  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [formValues, setFormValues] = useState({})
  const [files, setFiles] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const toast = useToast()

  const [ttdFile, setTtdFile] = useState(null)
  const [ttdPreview, setTtdPreview] = useState(null)

  useEffect(() => {
    api.get('/admin/categories').then((r) => {
      const cats = r.data.data
      setCategories(cats)
      if (reapplyReq) {
        const cat = cats.find((c) => c.id === reapplyReq.category_id)
        if (cat) {
          setSelectedCat(cat)
          const initialVals = {}
          if (reapplyReq.values) {
            reapplyReq.values.forEach((v) => {
              if (v.variable?.nama_variabel) {
                initialVals[v.variable.nama_variabel] = v.nilai_isian
              }
            })
          }
          setFormValues(initialVals)
          if (reapplyReq.file_ttd_digital_path) {
            setTtdPreview(`/storage/${reapplyReq.file_ttd_digital_path}`)
          }
        }
      }
    }).catch(() => { }).finally(() => setLoading(false))
  }, [reapplyReq])

  const groupedCategories = useMemo(() => {
    const groups = {
      'Akademik': {
        icon: GraduationCap,
        badgeColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
        iconColor: 'text-blue-600 dark:text-blue-400',
        scope: 'Mencakup surat mahasiswa aktif, penelitian, KP, dan semua jenis magang',
        items: []
      },
      'Kemahasiswaan': {
        icon: Award,
        badgeColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        scope: 'Mencakup surat keterangan beasiswa',
        items: []
      }
    }

    categories.forEach((cat) => {
      const g = cat.grup_kategori === 'Kemahasiswaan' ? 'Kemahasiswaan' : 'Akademik'
      groups[g].items.push(cat)
    })

    return groups
  }, [categories])

  const handleCategoryChange = (catId) => {
    const cat = categories.find((c) => c.id === parseInt(catId))
    setSelectedCat(cat || null)
    setFormValues({})
    setFiles({})
    setTtdFile(null)
    setTtdPreview(null)
    setErrors({})
  }

  const handleValueChange = (varName, value) => {
    setFormValues((prev) => ({ ...prev, [varName]: value }))
    if (errors[varName]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[varName]
        return next
      })
    }
  }

  const handleFileChange = (reqId, file) => {
    setFiles((prev) => ({ ...prev, [reqId]: file }))
    if (errors[`req_${reqId}`]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[`req_${reqId}`]
        return next
      })
    }
  }

  const handleTtdChange = (file) => {
    setTtdFile(file)
    if (file) {
      setTtdPreview(URL.createObjectURL(file))
    } else {
      setTtdPreview(null)
    }
    if (errors.ttd) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.ttd
        return next
      })
    }
  }

  const validateStep1 = () => {
    if (!selectedCat) {
      toast.error('Pilih jenis surat terlebih dahulu')
      return false
    }
    return true
  }

  const formatTipeFile = (tipeFile) => {
    const tf = (tipeFile || '').toUpperCase()
    if (tf === 'JPG' || tf === 'PNG' || tf === 'JPEG' || tf === 'JPG/PNG') {
      return 'JPG/PNG'
    }
    return tf || 'PDF'
  }

  const getAcceptAttribute = (tipeFile) => {
    const tf = (tipeFile || '').toUpperCase()
    if (tf.includes('JPG') || tf.includes('PNG') || tf.includes('IMAGE')) {
      return '.jpg,.jpeg,.png,image/jpeg,image/png'
    }
    if (tf.includes('PDF')) {
      return '.pdf,application/pdf'
    }
    if (tf.includes('DOC')) {
      return '.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword'
    }
    return '.pdf,.docx,.doc,.jpg,.jpeg,.png'
  }

  const validateStep2 = () => {
    const newErrors = {}
    let valid = true

      ; (selectedCat.variables || []).forEach((v) => {
        if (!formValues[v.nama_variabel] || !formValues[v.nama_variabel].trim()) {
          newErrors[v.nama_variabel] = `${v.nama_variabel.replace(/_/g, ' ')} wajib diisi`
          valid = false
        }
      })

      ; (selectedCat.requirements || []).forEach((r) => {
        const file = files[r.id]
        const hasOld = reapplyReq?.request_requirements?.some((oldR) => oldR.requirement_id === r.id && oldR.file_path)
        if (!file && !hasOld) {
          newErrors[`req_${r.id}`] = `${r.nama_syarat} wajib diupload`
          valid = false
        } else if (file) {
          const ext = file.name.split('.').pop()?.toLowerCase() || ''
          const tf = (r.tipe_file || '').toUpperCase()
          if (tf.includes('JPG') || tf.includes('PNG') || tf.includes('IMAGE')) {
            if (!['jpg', 'jpeg', 'png'].includes(ext)) {
              newErrors[`req_${r.id}`] = `${r.nama_syarat} harus berupa file gambar (JPG, JPEG, atau PNG)`
              valid = false
            }
          } else if (tf.includes('PDF')) {
            if (ext !== 'pdf') {
              newErrors[`req_${r.id}`] = `${r.nama_syarat} harus berupa file PDF (.pdf)`
              valid = false
            }
          } else if (tf.includes('DOC')) {
            if (!['docx', 'doc'].includes(ext)) {
              newErrors[`req_${r.id}`] = `${r.nama_syarat} harus berupa file Word (.docx atau .doc)`
              valid = false
            }
          }
        }
      })

    const hasOldSig = reapplyReq?.file_ttd_digital_path
    if (Boolean(selectedCat?.ttd_digital) && !ttdFile && !hasOldSig) {
      newErrors.ttd = 'Tanda tangan digital (PNG/JPG) wajib diunggah'
      valid = false
    }

    setErrors(newErrors)
    if (!valid) toast.error('Lengkapi semua data dan periksa kembali format dokumen Anda')
    return valid
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step === 3) {
      setStep(2)
    } else if (step === 2) {
      setSelectedCat(null)
      setFormValues({})
      setFiles({})
      setErrors({})
      setStep(1)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCat) return
    setSubmitting(true)
    const fd = new FormData()
    fd.append('category_id', selectedCat.id)
    if (reapplyReq) {
      fd.append('reapply_req_id', reapplyReq.id)
    }

    let vi = 0
      ; (selectedCat.variables || []).forEach((v) => {
        const val = formValues[v.nama_variabel]
        if (val) {
          fd.append(`values[${vi}][variable_id]`, v.id)
          fd.append(`values[${vi}][nilai_isian]`, val)
          vi++
        }
      })

    let ri = 0
      ; (selectedCat.requirements || []).forEach((r) => {
        const file = files[r.id]
        if (file) {
          fd.append(`requirements[${ri}][requirement_id]`, r.id)
          fd.append(`requirements[${ri}][file]`, file)
          ri++
        }
      })

    if (ttdFile) {
      fd.append('file_ttd_digital', ttdFile)
    }

    try {
      await api.post('/student/requests', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.errors ? Object.values(err.response.data.errors)[0][0] : err.response?.data?.message || 'Gagal mengirim pengajuan'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  const steps = [
    { num: 1, label: 'Pilih Kategori' },
    { num: 2, label: 'Isi Formulir' },
    { num: 3, label: 'Review & Kirim' },
  ]

  const hasVariables = selectedCat && (selectedCat.variables || []).length > 0
  const hasRequirements = selectedCat && (selectedCat.requirements || []).length > 0

  return (
    <div className="space-y-6 w-full">
      {/* Header with Inline Stepper */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="page-title">Buat Pengajuan Surat</h2>
          <p className="page-description mt-1">Isi formulir dan unggah dokumen prasyarat untuk pengajuan surat.</p>
        </div>

        {/* Stepper (Tata Cara) */}
        <div className="card p-3 px-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${step >= s.num
                    ? 'bg-primary text-white'
                    : 'bg-navy-100 dark:bg-navy-800 text-navy-400 dark:text-navy-600'
                    }`}>
                    {step > s.num ? <CheckCircle className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium ${step >= s.num ? 'text-navy-800 dark:text-navy-100' : 'text-navy-400 dark:text-navy-600'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-4 sm:w-8 h-0.5 mx-2 rounded ${step > s.num ? 'bg-primary' : 'bg-navy-200 dark:bg-navy-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {reapplyReq && (
        <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-1.5">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Memperbaiki Pengajuan Ditolak (#REQ-{String(reapplyReq.id).padStart(3, '0')})
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Isian data dari pengajuan sebelumnya telah dimuat otomatis. <strong>Jika dokumen prasyarat atau TTD Digital tidak diunggah ulang, sistem akan otomatis menggunakan file dari pengajuan sebelumnya.</strong>
          </p>
          {reapplyReq.alasan_penolakan && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
              Alasan Penolakan: "{reapplyReq.alasan_penolakan}"
            </p>
          )}
        </div>
      )}

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <div className="space-y-5">

          {/* Visual 2-Column Group Cards Grid (No Dropdown) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {Object.entries(groupedCategories).map(([groupName, groupData]) => {
              const Icon = groupData.icon
              return (
                <div key={groupName} className="card p-5 space-y-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${groupData.badgeColor}`}>
                          <Icon className={`w-4 h-4 ${groupData.iconColor}`} />
                        </div>
                        <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{groupName}</h4>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${groupData.badgeColor}`}>
                        {groupData.items.length} jenis
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 pt-3">
                      {groupData.items.map((cat) => {
                        const isSelected = selectedCat?.id === cat.id
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setSelectedCat(cat)}
                            onDoubleClick={() => { setSelectedCat(cat); handleNext(); }}
                            className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${isSelected
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                                : 'border-navy-200 dark:border-navy-700 hover:border-primary/50 hover:bg-navy-50/50 dark:hover:bg-navy-800/50'
                              }`}
                          >
                            <div className="space-y-1.5 flex-1">
                              <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : ''}`} style={{ color: isSelected ? undefined : 'var(--text-primary)' }}>
                                {cat.nama_kategori}
                              </p>
                              {cat.deskripsi && (
                                <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                                  {cat.deskripsi}
                                </p>
                              )}
                              {isSelected && (
                                <div className="pt-2">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                    className="btn-sm bg-primary hover:bg-primary-hover text-white text-xs font-medium flex items-center gap-1.5"
                                  >
                                    Lanjutkan Isi Formulir <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                            {isSelected && <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
                          </div>
                        )
                      })}
                      {groupData.items.length === 0 && (
                        <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Belum ada jenis surat pada kategori ini.</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Form & Upload */}
      {step === 2 && selectedCat && (
        <div className="space-y-6">
          <div className={`grid grid-cols-1 ${hasVariables && (hasRequirements || Boolean(selectedCat?.ttd_digital)) ? 'lg:grid-cols-2' : ''} gap-6 items-start`}>
            {/* Left Column: Form Values */}
            {hasVariables && (
              <div className="card p-6 space-y-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Isian Data</h3>
                {selectedCat.variables.map((v) => (
                  <div key={v.id}>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {v.nama_variabel.replace(/_/g, ' ')} <span className="text-red-500">*</span>
                    </label>
                    {v.tipe_input_html === 'textarea' ? (
                      <textarea
                        value={formValues[v.nama_variabel] || ''}
                        onChange={(e) => handleValueChange(v.nama_variabel, e.target.value)}
                        className={`input-base ${errors[v.nama_variabel] ? 'border-red-500 focus:ring-red-200' : ''}`}
                        rows={3}
                        placeholder={`Masukkan ${v.nama_variabel.replace(/_/g, ' ')}`}
                      />
                    ) : (
                      <input
                        type={v.tipe_input_html || 'text'}
                        value={formValues[v.nama_variabel] || ''}
                        onChange={(e) => handleValueChange(v.nama_variabel, e.target.value)}
                        className={`input-base ${errors[v.nama_variabel] ? 'border-red-500 focus:ring-red-200' : ''}`}
                        placeholder={`Masukkan ${v.nama_variabel.replace(/_/g, ' ')}`}
                      />
                    )}
                    {errors[v.nama_variabel] && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors[v.nama_variabel]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Right Column: Requirements & Digital Signature */}
            <div className="space-y-6">
              {/* Requirements Upload */}
              {hasRequirements && (
                <div className="card p-6 space-y-4">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Dokumen Prasyarat</h3>
                  {reapplyReq && (
                    <p className="text-xs bg-navy-50 dark:bg-navy-900/50 p-2.5 rounded-lg text-primary">
                      💡 <strong>Pengajuan Ulang:</strong> Jika tidak memilih file baru, dokumen prasyarat yang sudah diunggah sebelumnya akan tetap digunakan.
                    </p>
                  )}
                  <ul className="text-xs list-disc list-inside space-y-1" style={{ color: 'var(--text-muted)' }}>
                    {selectedCat.requirements.map((r) => (
                      <li key={r.id}>{r.nama_syarat} ({formatTipeFile(r.tipe_file)})</li>
                    ))}
                  </ul>
                  {selectedCat.requirements.map((r) => {
                    const oldReqFile = reapplyReq?.request_requirements?.find((oldR) => oldR.requirement_id === r.id)
                    const displayFormat = formatTipeFile(r.tipe_file)
                    const acceptAttr = getAcceptAttribute(r.tipe_file)
                    const formatHint = displayFormat
                    return (
                      <div key={r.id} className="space-y-1">
                        <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          Upload {r.nama_syarat} <span className="font-normal text-xs" style={{ color: 'var(--text-muted)' }}>({formatHint}, Maks. 10MB)</span>
                        </label>
                        {oldReqFile?.file_path && !files[r.id] && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ Menggunakan dokumen sebelumnya: {oldReqFile.file_path.split('/').pop()}
                          </p>
                        )}
                        <input
                          type="file"
                          accept={acceptAttr}
                          onChange={(e) => handleFileChange(r.id, e.target.files[0])}
                          className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer ${errors[`req_${r.id}`] ? 'file:bg-red-500' : ''}`}
                        />
                        {errors[`req_${r.id}`] && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors[`req_${r.id}`]}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Digital Signature Upload if required */}
              {Boolean(selectedCat?.ttd_digital) && (
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tanda Tangan Digital</h3>
                    <span className="badge bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs">Wajib</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Unggah file gambar tanda tangan digital Anda (Format: PNG atau JPG, Maks 5MB). File ini akan otomatis disisipkan ke dalam <strong>Surat Permohonan</strong> yang Anda ajukan.
                  </p>
                  {reapplyReq?.file_ttd_digital_path && !ttdFile && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Menggunakan TTD Digital sebelumnya: {reapplyReq.file_ttd_digital_path.split('/').pop()} (Upload file baru jika ingin mengganti)
                    </p>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleTtdChange(e.target.files[0])}
                      className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer ${errors.ttd ? 'file:bg-red-500' : ''}`}
                    />
                    {errors.ttd && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.ttd}
                      </p>
                    )}
                  </div>
                  {ttdPreview && (
                    <div className="mt-2 p-3 border rounded-xl flex items-center gap-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <img src={ttdPreview} alt="Preview TTD" className="h-16 object-contain border bg-white p-1 rounded-lg" />
                      <div className="text-xs">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ttdFile ? ttdFile.name : reapplyReq?.file_ttd_digital_path?.split('/').pop() || 'TTD Terpasang'}</p>
                        {ttdFile && <p style={{ color: 'var(--text-muted)' }}>{(ttdFile.size / 1024).toFixed(1)} KB</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={handleBack} className="btn-ghost flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              Selanjutnya <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && selectedCat && (
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Review Pengajuan</h3>

            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Kategori Surat</p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedCat.nama_kategori}</p>
            </div>

            {hasVariables && (
              <div>
                <p className="section-title mb-2">Data Form</p>
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  {selectedCat.variables.map((v) => (
                    <div key={v.id} className="flex gap-2 text-sm">
                      <span className="w-36 shrink-0" style={{ color: 'var(--text-muted)' }}>{v.nama_variabel.replace(/_/g, ' ')}:</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formValues[v.nama_variabel] || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasRequirements && (
              <div>
                <p className="section-title mb-2">Dokumen</p>
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  {selectedCat.requirements.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{r.nama_syarat}:</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {files[r.id] ? files[r.id].name : 'Belum diupload'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Boolean(selectedCat?.ttd_digital) && (
              <div>
                <p className="section-title mb-2">TTD Digital Mahasiswa</p>
                <div className="rounded-xl p-4 flex items-center gap-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  {ttdPreview ? (
                    <img src={ttdPreview} alt="Preview TTD" className="h-14 object-contain border bg-white p-1 rounded-lg" />
                  ) : (
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ttdFile?.name || 'Ter-upload'}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={handleBack} className="btn-ghost flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim Pengajuan
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <Modal open={showSuccess} onClose={() => { setShowSuccess(false); navigate('/mahasiswa/riwayat') }} title="Berhasil!">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Berhasil!</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Pengajuan surat Anda berhasil dikirim. Pantau status pada menu Riwayat & Status.</p>
          <button onClick={() => { setShowSuccess(false); navigate('/mahasiswa/riwayat') }} className="btn-primary">
            Lihat Riwayat
          </button>
        </div>
      </Modal>
    </div>
  )
}
