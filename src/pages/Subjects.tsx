import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Clock, BookOpen, ChevronRight } from 'lucide-react'
import { useAppStore, SUBJECTS_CONFIG } from '@/context/AppStore'
import { useQuizStore } from '@/context/QuizStore'
import { loadQuestions, selectAdaptiveQuestions } from '@/utils/adaptive'
import type { SubjectId } from '@/types'
import clsx from 'clsx'

type Modo = 'completo' | 'rapido' | 'tematico'

const modos: { id: Modo; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'completo', label: 'Ensayo Completo',  icon: <BookOpen size={18} />,  desc: 'Simula el examen real PAES con cronómetro' },
  { id: 'rapido',   label: 'Práctica Rápida',  icon: <Zap size={18} />,       desc: '10 preguntas aleatorias sin límite de tiempo' },
  { id: 'tematico', label: 'Por Tema',          icon: <Clock size={18} />,      desc: 'Elige un tema específico para practicar' },
]

export default function Subjects() {
  const navigate = useNavigate()
  const { stats } = useAppStore()
  const { startSession } = useQuizStore()
  const [selected, setSelected] = useState<SubjectId | null>(null)
  const [modo, setModo] = useState<Modo>('completo')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!selected) return
    setLoading(true)
    try {
      const cfg = SUBJECTS_CONFIG[selected]
      const allQ = await loadQuestions(selected)
      const n = modo === 'rapido' ? 10 : Math.min(cfg.preguntasEnsayo, allQ.length)
      const subjectStats = stats.porAsignatura[selected]
      const questions = selectAdaptiveQuestions(allQ, { totalQuestions: n, subjectStats })
      startSession(selected, cfg.nombre, questions, modo)
      navigate(`/quiz/${selected}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-container max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold mb-1">Selecciona Asignatura</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">¿Qué quieres practicar hoy?</p>

        {/* Tarjetas de asignaturas */}
        <div className="space-y-3 mb-7">
          {Object.values(SUBJECTS_CONFIG).map((cfg) => {
            const asigStats = stats.porAsignatura[cfg.id]
            const pct = asigStats && asigStats.totalPreguntas > 0
              ? Math.round((asigStats.totalCorrectas / asigStats.totalPreguntas) * 100)
              : null
            const isSelected = selected === cfg.id

            return (
              <motion.button
                key={cfg.id}
                onClick={() => setSelected(cfg.id)}
                whileTap={{ scale: 0.97 }}
                className={clsx(
                  'w-full card p-4 flex items-center gap-4 text-left transition-all duration-200',
                  isSelected
                    ? 'ring-2 ring-primary-500 dark:ring-primary-400 shadow-lg shadow-primary-500/10'
                    : 'hover:shadow-md'
                )}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradiente} flex items-center justify-center text-2xl shadow-md`}>
                  {cfg.iconEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{cfg.nombre}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cfg.descripcion}</p>
                  {pct !== null && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${cfg.gradiente} progress-bar-fill`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  )}
                </div>
                <div className={clsx(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 dark:border-gray-600'
                )}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Modo de ensayo */}
        {selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            <h2 className="font-display font-bold mb-3">Modo de Práctica</h2>
            <div className="space-y-2">
              {modos.map(m => (
                <button
                  key={m.id}
                  onClick={() => setModo(m.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                    modo === m.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-[#2d2d4e] hover:border-primary-300'
                  )}
                >
                  <div className={clsx(
                    'p-2 rounded-xl transition-colors',
                    modo === m.id ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  )}>
                    {m.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{m.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                  </div>
                  {modo === m.id && <ChevronRight size={16} className="ml-auto text-primary-500" />}
                </button>
              ))}
            </div>

            {/* Info de la asignatura */}
            <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-[#151528] text-sm text-gray-600 dark:text-gray-400 flex gap-4">
              <span>⏱ {SUBJECTS_CONFIG[selected].tiempoEnsayo} min</span>
              <span>📝 {modo === 'rapido' ? 10 : SUBJECTS_CONFIG[selected].preguntasEnsayo} preguntas</span>
            </div>
          </motion.div>
        )}

        {/* Botón iniciar */}
        <button
          onClick={handleStart}
          disabled={!selected || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Zap size={18} />
              Iniciar Ensayo
            </>
          )}
        </button>
      </motion.div>
    </main>
  )
}
