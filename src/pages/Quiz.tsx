import { useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, SkipForward, Flag } from 'lucide-react'
import { useQuizStore } from '@/context/QuizStore'
import { useAppStore, SUBJECTS_CONFIG } from '@/context/AppStore'
import { useTimer, useStopwatch } from '@/hooks/useTimer'
import QuestionCard from '@/components/quiz/QuestionCard'
import QuizTimer from '@/components/quiz/QuizTimer'
import ProgressBar from '@/components/quiz/ProgressBar'
import { calcularResultado } from '@/utils/scoring'
import { submitScore } from '@/lib/supabase'

export default function Quiz() {
  const { subject } = useParams<{ subject: string }>()
  const navigate = useNavigate()
  const { session, currentIndex, showExplanation, isFinished,
          answer, next, prev, skip, toggleExplanation, finishSession, reset } = useQuizStore()
  const { addResult, checkAchievements, stats, profile } = useAppStore()

  const cfg = subject ? SUBJECTS_CONFIG[subject as keyof typeof SUBJECTS_CONFIG] : null
  const tiempoTotal = cfg ? cfg.tiempoEnsayo * 60 : 7200

  const timer = useTimer({
    initialSeconds: session?.modoEnsayo === 'rapido' ? 600 : tiempoTotal,
    autoStart: true,
    onExpire: () => finishSession(),
  })
  const stopwatch = useStopwatch()

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!session && !isFinished) navigate('/subjects')
  }, [session, isFinished, navigate])

  // Al finalizar, calcular resultado y guardar
  useEffect(() => {
    if (isFinished && session?.completado) {
      const resultado = calcularResultado(session)
      addResult(resultado)
      const newAchievements = checkAchievements()

      // Enviar puntaje al ranking global (Supabase)
      submitScore({
        nombre: profile.nombre || 'Estudiante',
        colegio: profile.colegio || '',
        asignatura: session.asignatura,
        puntaje_paes: resultado.puntajePaes,
        nota: resultado.nota,
        correctas: resultado.correctas,
        total: resultado.totalPreguntas,
        porcentaje: resultado.porcentajeLogro,
        fecha: new Date().toLocaleDateString('es-CL'),
      })

      navigate(`/results/${session.id}`, { state: { resultado, newAchievements } })
      reset()
    }
  }, [isFinished, session, addResult, checkAchievements, navigate, reset, profile])

  const handleAnswer = useCallback((respuesta: string) => {
    if (!session) return
    const q = session.preguntas[currentIndex]
    const tiempoUsado = stopwatch.lap()
    answer(q.id, respuesta, tiempoUsado)
  }, [session, currentIndex, answer, stopwatch])

  if (!session) return null

  const question = session.preguntas[currentIndex]
  const selectedAnswer = session.respuestas[question.id]
  const correctIds = new Set(session.preguntas.map(q => q.id).filter(id => session.respuestas[id] === session.preguntas.find(q => q.id === id)!.respuesta_correcta))

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-20 pb-24 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header de quiz */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { if (window.confirm('¿Salir del ensayo? Se perderá tu progreso.')) { reset(); navigate('/subjects') } }}
            className="btn-ghost p-2"
          >
            <ChevronLeft size={20} />
          </button>

          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[160px]">
            {session.nombreAsignatura}
          </p>

          {session.modoEnsayo !== 'rapido' && (
            <QuizTimer
              remaining={timer.remaining}
              total={tiempoTotal}
              isUrgent={timer.isUrgent}
              isCritical={timer.isCritical}
            />
          )}
        </div>

        {/* Barra de progreso */}
        <div className="mb-5">
          <ProgressBar
            current={currentIndex}
            total={session.preguntas.length}
            answers={session.respuestas}
            questionIds={session.preguntas.map(q => q.id)}
            correctIds={correctIds}
          />
        </div>

        {/* Pregunta */}
        <AnimatePresence mode="wait">
          <QuestionCard
            key={question.id}
            question={question}
            selectedAnswer={selectedAnswer}
            onAnswer={handleAnswer}
            showExplanation={showExplanation}
            onToggleExplanation={toggleExplanation}
            questionNumber={currentIndex + 1}
            total={session.preguntas.length}
          />
        </AnimatePresence>

        {/* Controles de navegación */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mt-5 gap-3"
        >
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="btn-secondary flex items-center gap-1 px-4"
          >
            <ChevronLeft size={18} /> Anterior
          </button>

          {!selectedAnswer && (
            <button onClick={skip} className="btn-ghost flex items-center gap-1 text-sm">
              <SkipForward size={16} /> Omitir
            </button>
          )}

          {currentIndex < session.preguntas.length - 1 ? (
            <button
              onClick={next}
              disabled={!selectedAnswer}
              className="btn-primary flex items-center gap-1 px-4"
            >
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={finishSession}
              className="btn-primary flex items-center gap-1 px-4 bg-green-600 hover:bg-green-700 shadow-green-600/20"
            >
              <Flag size={16} /> Finalizar
            </button>
          )}
        </motion.div>

        {/* Mini mapa de preguntas */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }} className="mt-5">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {session.preguntas.map((q, i) => {
              const ans = session.respuestas[q.id]
              const isCorrect = ans === q.respuesta_correcta
              return (
                <button
                  key={q.id}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    i === currentIndex ? 'ring-2 ring-primary-500 scale-110' :
                    !ans ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' :
                    isCorrect ? 'bg-green-400 text-white' : 'bg-red-400 text-white'
                  }`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
