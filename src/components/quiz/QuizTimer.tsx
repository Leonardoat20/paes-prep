import { Clock } from 'lucide-react'
import clsx from 'clsx'
import { formatTime } from '@/hooks/useTimer'

interface Props {
  remaining: number
  total: number
  isUrgent: boolean
  isCritical: boolean
}

export default function QuizTimer({ remaining, total, isUrgent, isCritical }: Props) {
  const pct = (remaining / total) * 100

  return (
    <div className={clsx(
      'flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono text-base font-bold transition-all duration-300',
      isCritical
        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 timer-urgent'
        : isUrgent
        ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
        : 'border-gray-200 dark:border-[#2d2d4e] bg-white dark:bg-[#1a1a2e] text-gray-700 dark:text-gray-200'
    )}>
      <Clock size={16} />
      <span>{formatTime(remaining)}</span>
      <div className="w-20 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full progress-bar-fill transition-all',
            isCritical ? 'bg-red-500' : isUrgent ? 'bg-orange-400' : 'bg-primary-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
