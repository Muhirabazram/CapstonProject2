const steps = [
  { key: 'diajukan', label: 'Diajukan' },
  { key: 'diproses', label: 'Diproses' },
  { key: 'diterima', label: 'Diterima' },
  { key: 'selesai', label: 'Selesai' },
]

const statusOrder = ['diajukan', 'diproses', 'diterima', 'selesai']

export default function StatusTimeline({ currentStatus }) {
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
              <div className={`w-3 h-3 rounded-full mt-1 transition-all duration-300 ${
                isRejected && i === currentIdx + 1
                  ? 'bg-red-500'
                  : isDone
                    ? 'bg-primary'
                    : 'bg-navy-200 dark:bg-navy-700'
              } ${isCurrent ? 'ring-4 ring-primary/20 dark:ring-primary/30' : ''}`} />
              {i < steps.length - 1 && (
                <div className={`w-0.5 h-8 transition-colors duration-300 ${
                  isDone ? 'bg-primary' : 'bg-navy-200 dark:bg-navy-700'
                }`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${isDone ? 'text-navy-800 dark:text-navy-100' : 'text-navy-300 dark:text-navy-600'}`}>
                {step.label}
              </p>
            </div>
          </div>
        )
      })}

      {/* Ditolak as alternative status */}
      {isRejected && (
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full mt-1 bg-red-500 ring-4 ring-red-200 dark:ring-red-800" />
          </div>
          <div className="pb-2">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">Ditolak</p>
          </div>
        </div>
      )}
    </div>
  )
}
