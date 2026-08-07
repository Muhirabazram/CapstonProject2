export default function StatCard({ label, value, icon: Icon, color = 'primary', loading = false }) {
  const colorMap = {
    primary: { bg: 'bg-primary-50 dark:bg-primary-900/30', text: 'text-primary dark:text-primary-200', icon: 'text-primary dark:text-primary-300' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-500 dark:text-blue-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', icon: 'text-amber-500 dark:text-amber-400' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', icon: 'text-teal-500 dark:text-teal-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: 'text-red-500 dark:text-red-400' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', icon: 'text-emerald-500 dark:text-emerald-400' },
  }

  const c = colorMap[color] || colorMap.primary

  return (
    <div className="card card-hover p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {loading ? <span className="skeleton h-7 w-12 inline-block" /> : value}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  )
}
