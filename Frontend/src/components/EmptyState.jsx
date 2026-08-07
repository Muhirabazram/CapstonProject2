import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'Tidak ada data', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  )
}
