import { Inbox, FileX, Search, MailX, FolderOpen } from 'lucide-react'
import { useNeo } from '../context/NeoContext'

const iconMap = {
  Inbox, FileX, Search, MailX, FolderOpen,
}

export default function EmptyState({ message = 'Tidak ada data', icon: Icon = Inbox, description }) {
  const { workspaceMode } = useNeo()
  const isNeo = workspaceMode === 'neo'

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${isNeo ? 'neo-page-enter' : ''}`}>
      <div className={`relative ${isNeo ? 'w-20 h-20' : 'w-16 h-16'} rounded-2xl flex items-center justify-center mb-4 transition-all duration-300`}
        style={{
          backgroundColor: isNeo ? 'var(--neo-glow)' : undefined,
          background: isNeo ? undefined : undefined,
        }}
      >
        {isNeo ? (
          <>
            <div className="absolute inset-0 rounded-2xl bg-primary/5 dark:bg-primary/10" />
            <Icon className="w-8 h-8 text-primary/40 dark:text-primary-300/40 relative z-10" />
          </>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
            <Icon className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      {description && (
        <p className="text-xs mt-1 text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
      )}
    </div>
  )
}
