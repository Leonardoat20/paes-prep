import { motion } from 'framer-motion'
import { CheckCircle, XCircle, MinusCircle, Clock, TrendingUp } from 'lucide-react'
import type { QuizResult } from '@/types'
import { formatTime } from '@/hooks/useTimer'
import clsx from 'clsx'

interface Props { result: QuizResult }

function getPuntajeColor(p: number) {
  if (p >= 800) return 'from-yellow-400 to-amber-500'
  if (p >= 650) return 'from-green-400 to-emerald-500'
  if (p >= 500) return 'from-blue-400 to-primary-500'
  if (p >= 350) return 'from-orange-400 to-amber-500'
  return 'from-red-400 to-rose-500'
}

function getPuntajeLabel(p: number) {
  if (p >= 800) return 'Excelente 🏆'
  if (p >= 650) return 'Muy Bueno ⭐'
  if (p >= 500) return 'Bueno 👍'
  if (p >= 350) return 'Regular 📚'
  return 'Necesita Refuerzo 💪'
}

export default function ScoreCard({ result }: Props) {
  return (
    <div className="space-y-4">
      {/* Puntaje principal */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
        className={clsx(
          'card p-8 text-center bg-gradient-to-br text-white relative overflow-hidden',
          getPuntajeColor(result.puntajePaes)
        )}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 0%, transparent 60%)' }} />
        <p className="text-sm font-semibold opacity-80 mb-1 uppercase tracking-widest">Puntaje PAES Estimado</p>
        <p className="text-7xl font-display font-bold leading-none mb-2">{result.puntajePaes}</p>
        <p className="text-lg font-semibold opacity-90">{getPuntajeLabel(result.puntajePaes)}</p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm opacity-90">
          <span>Nota: {result.nota}</span>
          <span>•</span>
          <span>{result.porcentajeLogro}% de logro</span>
        </div>
      </motion.div>

      {/* Estadísticas de respuestas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CheckCircle, label: 'Correctas',  value: result.correctas,   color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: XCircle,     label: 'Incorrectas', value: result.incorrectas,  color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20' },
          { icon: MinusCircle, label: 'Omitidas',   value: result.omitidas,    color: 'text-gray-400',  bg: 'bg-gray-50 dark:bg-gray-800' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <motion.div
            key={label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={clsx('card p-4 flex flex-col items-center gap-1', bg)}
          >
            <Icon size={24} className={color} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tiempo */}
      <div className="card p-4 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
          <Clock size={20} className="text-primary-500" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tiempo total</p>
          <p className="font-bold">{formatTime(result.tiempoTotal)}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Promedio por pregunta</p>
          <p className="font-bold">{result.tiempoPromedio}s</p>
        </div>
      </div>

      {/* Comparación con meta */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-primary-500" />
          <p className="font-semibold text-sm">Distribución de Respuestas</p>
        </div>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden">
          <div className="bg-green-400 transition-all" style={{ width: `${(result.correctas / result.totalPreguntas) * 100}%` }} />
          <div className="bg-red-400 transition-all"   style={{ width: `${(result.incorrectas / result.totalPreguntas) * 100}%` }} />
          <div className="bg-gray-300 dark:bg-gray-600 flex-1" />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Correctas</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Incorrectas</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Omitidas</span>
        </div>
      </div>
    </div>
  )
}
