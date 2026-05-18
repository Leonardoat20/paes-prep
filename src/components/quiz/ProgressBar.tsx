import clsx from 'clsx'

interface Props {
  current: number
  total: number
  answers: Record<number, string>
  questionIds: number[]
  correctIds: Set<number>
}

export default function ProgressBar({ current, total, answers, questionIds, correctIds }: Props) {
  const pct = Math.round(((current + 1) / total) * 100)
  const answered = Object.keys(answers).length

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
        <span>Pregunta {current + 1} de {total}</span>
        <span>{answered} respondidas</span>
      </div>

      {/* Barra de segmentos */}
      <div className="flex gap-0.5 h-2">
        {questionIds.map((id, i) => {
          const ans = answers[id]
          const isCorrect = ans !== undefined && correctIds.has(id)
          const isWrong = ans !== undefined && !correctIds.has(id)
          const isCurrent = i === current

          return (
            <div
              key={id}
              className={clsx(
                'flex-1 rounded-full transition-all duration-300',
                isCurrent  ? 'bg-primary-500 scale-y-125' :
                isCorrect  ? 'bg-green-400' :
                isWrong    ? 'bg-red-400' :
                ans        ? 'bg-yellow-400' :
                             'bg-gray-200 dark:bg-gray-700'
              )}
            />
          )
        })}
      </div>

      {/* Barra de progreso global */}
      <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 progress-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
