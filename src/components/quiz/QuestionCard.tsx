import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import type { Question } from '@/types'
import clsx from 'clsx'

interface Props {
  question: Question
  selectedAnswer: string | undefined
  onAnswer: (answer: string) => void
  showExplanation: boolean
  onToggleExplanation: () => void
  questionNumber: number
  total: number
}

const LABELS = ['A', 'B', 'C', 'D', 'E']

const difficultyConfig = {
  baja:  { label: 'Fácil',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  media: { label: 'Medio',  color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  alta:  { label: 'Difícil', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export default function QuestionCard({
  question, selectedAnswer, onAnswer, showExplanation, onToggleExplanation, questionNumber, total,
}: Props) {
  const answered = selectedAnswer !== undefined
  const isCorrect = selectedAnswer === question.respuesta_correcta

  const getAlternativeStyle = (alt: string) => {
    if (!answered) {
      return 'border-gray-200 dark:border-[#2d2d4e] hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer'
    }
    if (alt === question.respuesta_correcta) {
      return 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
    }
    if (alt === selectedAnswer) {
      return 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
    }
    return 'border-gray-200 dark:border-[#2d2d4e] opacity-50'
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="card p-5 md:p-7 flex flex-col gap-5"
    >
      {/* Meta información */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
          {question.eje_tematico}
        </span>
        <span className={clsx('badge', difficultyConfig[question.dificultad].color)}>
          {difficultyConfig[question.dificultad].label}
        </span>
        {question.anio && (
          <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            DEMRE {question.anio}
          </span>
        )}
        <span className="ml-auto text-sm text-gray-400 font-medium">
          {questionNumber} / {total}
        </span>
      </div>

      {/* Enunciado */}
      <div className="text-base md:text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-line">
        {question.pregunta}
      </div>

      {/* Alternativas */}
      <div className="flex flex-col gap-3">
        {question.alternativas.map((alt, i) => (
          <button
            key={alt}
            onClick={() => !answered && onAnswer(alt)}
            disabled={answered}
            className={clsx(
              'alternative-btn flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200',
              getAlternativeStyle(alt)
            )}
          >
            <span className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                             text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              {LABELS[i]}
            </span>
            <span className="flex-1 text-sm md:text-base">{alt}</span>
            {answered && alt === question.respuesta_correcta && (
              <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            )}
            {answered && alt === selectedAnswer && alt !== question.respuesta_correcta && (
              <XCircle size={20} className="text-red-500 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Feedback inmediato + explicación */}
      {answered && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className={clsx(
            'flex items-center gap-2 p-3 rounded-xl font-semibold text-sm mb-3',
            isCorrect
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          )}>
            {isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
            {isCorrect ? '¡Correcto!' : `Incorrecto. La respuesta era: ${question.respuesta_correcta}`}
          </div>

          <button
            onClick={onToggleExplanation}
            className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            <Lightbulb size={16} />
            {showExplanation ? 'Ocultar explicación' : 'Ver explicación'}
          </button>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200 leading-relaxed"
              >
                {question.explicacion}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
