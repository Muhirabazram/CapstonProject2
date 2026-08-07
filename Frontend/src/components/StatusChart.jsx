const statusColors = {
  diajukan: { bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400' },
  diterima: { bg: 'bg-teal-500', light: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-600 dark:text-teal-400' },
  diproses: { bg: 'bg-amber-500', light: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400' },
  ditolak: { bg: 'bg-red-500', light: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600 dark:text-red-400' },
  selesai: { bg: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400' },
}

export default function StatusChart({ requests }) {
  const counts = { diajukan: 0, diterima: 0, diproses: 0, ditolak: 0, selesai: 0 }
  requests.forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++ })
  const total = requests.length || 1

  const data = [
    { key: 'diajukan', label: 'Diajukan', count: counts.diajukan },
    { key: 'diterima', label: 'Diterima', count: counts.diterima },
    { key: 'diproses', label: 'Diproses', count: counts.diproses },
    { key: 'ditolak', label: 'Ditolak', count: counts.ditolak },
    { key: 'selesai', label: 'Selesai', count: counts.selesai },
  ]

  return (
    <div className="card p-6">
      <h3 className="section-title mb-4">Status Pengajuan</h3>
      <div className="space-y-3">
        {data.map((d) => {
          const c = statusColors[d.key]
          return (
            <div key={d.key} className="flex items-center gap-3">
              <span className="text-xs font-medium w-20" style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
              <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div
                  className={`h-full ${c.bg} rounded-full transition-all duration-500`}
                  style={{ width: `${(d.count / total) * 100}%`, minWidth: d.count > 0 ? '8px' : '0' }}
                />
              </div>
              <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--text-primary)' }}>{d.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
