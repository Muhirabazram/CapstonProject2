import { useNeo } from '../context/NeoContext'

const steps = [
  { key: 'diajukan', label: 'Diajukan' },
  { key: 'diproses', label: 'Diproses' },
  { key: 'diterima', label: 'Diterima' },
  { key: 'selesai', label: 'Selesai' },
]

const statusOrder = ['diajukan', 'diproses', 'diterima', 'selesai']

export default function StatusTimeline({ currentStatus }) {
  const { workspaceMode } = useNeo()
  const isNeo = workspaceMode === 'neo'
  const isRejected = currentStatus === 'ditolak'
  const currentIdx = statusOrder.indexOf(currentStatus)

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isDone = !isRejected && currentIdx >= i
        const isCurrent = currentStatus === step.key

        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {isNeo ? (
                <div className={`neo-timeline-dot mt-0.5 ${isDone ? 'active' : ''} ${
                  isRejected && i === currentIdx + 1 ? '!border-red-500 !bg-red-500' : ''
                } ${isCurrent ? 'scale-125' : ''}`} />
              ) : (
                <div className={`w-3 h-3 rounded-full mt-1 transition-all duration-300 ${
                  isRejected && i === currentIdx + 1
                    ? 'bg-red-500'
                    : isDone
                      ? 'bg-primary'
                      : 'bg-navy-200 dark:bg-navy-700'
                } ${isCurrent ? 'ring-4 ring-primary/20 dark:ring-primary/30' : ''}`} />
              )}
              {i < steps.length - 1 && (
                <div className={`w-0.5 h-8 transition-colors duration-300 ${
                  isDone ? (isNeo ? 'bg-primary' : 'bg-primary') : (isNeo ? 'bg-border-color' : 'bg-navy-200 dark:bg-navy-700')
                }`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${isDone ? 'text-navy-800 dark:text-navy-100' : 'text-navy-300 dark:text-navy-400'}`}>
                {step.label}
              </p>
              {isNeo && isCurrent && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Status saat ini</p>
              )}
            </div>
          </div>
        )
      })}

      {/* Ditolak as alternative status */}
      {isRejected && (
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            {isNeo ? (
              <div className="neo-timeline-dot mt-0.5 !border-red-500 !bg-red-500 scale-125" />
            ) : (
              <div className="w-3 h-3 rounded-full mt-1 bg-red-500 ring-4 ring-red-200 dark:ring-red-800" />
            )}
          </div>
          <div className="pb-2">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">Ditolak</p>
            {isNeo && <p className="text-xs mt-0.5 text-red-400">Pengajuan ditolak</p>}
          </div>
        </div>
      )}
    </div>
  )
}
