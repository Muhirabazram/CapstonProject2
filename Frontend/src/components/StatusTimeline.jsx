import { Check, X as XIcon } from 'lucide-react'

const steps = [
  { key: 'diajukan', label: 'Diajukan' },
  { key: 'diterima', label: 'Diterima' },
  { key: 'diproses', label: 'Diproses' },
  { key: 'selesai', label: 'Selesai' },
]

const statusColors = {
  diajukan: 'bg-blue-500',
  diterima: 'bg-teal-500',
  diproses: 'bg-amber-500',
  selesai: 'bg-emerald-500',
  ditolak: 'bg-red-500',
}

export default function StatusTimeline({ currentStatus }) {
  const isRejected = currentStatus === 'ditolak'
  const currentIdx = steps.findIndex((s) => s.key === currentStatus)

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isDone = !isRejected && currentIdx >= i
        const isCurrent = currentStatus === step.key
        const isRejectedStep = isRejected && step.key === 'ditolak'

        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-1 transition-all duration-300 ${
                isRejectedStep ? statusColors.ditolak :
                isDone ? statusColors[step.key] : 'bg-navy-200 dark:bg-navy-700'
              } ${isCurrent ? 'ring-4 ring-primary/20 dark:ring-primary/30' : ''}`} />
              {i < steps.length - 1 && !isRejectedStep && (
                <div className={`w-0.5 h-8 transition-colors duration-300 ${isDone ? statusColors[step.key] : 'bg-navy-200 dark:bg-navy-700'}`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${isDone ? 'text-navy-800 dark:text-navy-100' : 'text-navy-300 dark:text-navy-600'}`}>
                {step.label}
              </p>
              {isRejectedStep && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Ditolak</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
