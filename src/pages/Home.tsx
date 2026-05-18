import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, BarChart2, Trophy, ArrowRight, Flame } from 'lucide-react'
import { useAppStore, SUBJECTS_CONFIG, ACHIEVEMENTS } from '@/context/AppStore'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
})

export default function Home() {
  const { profile, stats, config, getNivel, getXP } = useAppStore()
  const xp = getXP()
  const nivel = getNivel()
  const historial = stats.historial
  const ultimoEnsayo = historial[0]
  const asignaturasUsadas = Object.keys(stats.porAsignatura) as (keyof typeof SUBJECTS_CONFIG)[]

  return (
    <main className="page-container max-w-lg mx-auto">
      {/* Hero saludo */}
      <motion.section {...fadeUp(0)} className="mb-7">
        <div className="card p-5 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -right-2 bottom-4 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative z-10">
            <p className="text-sm opacity-70 mb-1">Bienvenido de vuelta 👋</p>
            <h1 className="text-2xl font-display font-bold mb-1">{profile.nombre}</h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-sm">
                <span className="text-yellow-300">⚡</span>
                <span>{xp} XP</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-sm">
                <span>🏅</span>
                <span>{nivel}</span>
              </div>
              {stats.racha > 1 && (
                <div className="flex items-center gap-1 bg-orange-500/30 rounded-full px-3 py-1 text-sm">
                  <Flame size={14} className="text-orange-300" />
                  <span>{stats.racha} días</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Acciones rápidas */}
      <motion.section {...fadeUp(0.1)} className="mb-7">
        <h2 className="text-lg font-display font-bold mb-3 px-1">¿Qué hacemos hoy?</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/subjects" className="card p-5 flex flex-col gap-2 hover:scale-105 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Zap size={20} className="text-primary-500" />
            </div>
            <p className="font-semibold text-sm">Nuevo Ensayo</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Practica con preguntas PAES</p>
          </Link>

          <Link to="/stats" className="card p-5 flex flex-col gap-2 hover:scale-105 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <BarChart2 size={20} className="text-green-500" />
            </div>
            <p className="font-semibold text-sm">Mis Estadísticas</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ver mi progreso</p>
          </Link>
        </div>
      </motion.section>

      {/* Último ensayo */}
      {ultimoEnsayo && (
        <motion.section {...fadeUp(0.15)} className="mb-7">
          <h2 className="text-lg font-display font-bold mb-3 px-1">Último Ensayo</h2>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{ultimoEnsayo.nombreAsignatura}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(ultimoEnsayo.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-500">{ultimoEnsayo.puntajePaes}</p>
                <p className="text-xs text-gray-400">puntaje PAES</p>
              </div>
            </div>
            <Link
              to={`/results/${ultimoEnsayo.sessionId}`}
              className="flex items-center gap-1 text-primary-500 text-sm font-medium mt-3 hover:underline"
            >
              Ver informe completo <ArrowRight size={14} />
            </Link>
          </div>
        </motion.section>
      )}

      {/* Resumen por asignatura */}
      {asignaturasUsadas.length > 0 && (
        <motion.section {...fadeUp(0.2)} className="mb-7">
          <h2 className="text-lg font-display font-bold mb-3 px-1">Progreso por Asignatura</h2>
          <div className="space-y-3">
            {asignaturasUsadas.map(id => {
              const cfg = SUBJECTS_CONFIG[id]
              const asigStats = stats.porAsignatura[id]!
              const pct = asigStats.totalPreguntas > 0
                ? Math.round((asigStats.totalCorrectas / asigStats.totalPreguntas) * 100)
                : 0
              return (
                <div key={id} className="card p-4 flex items-center gap-4">
                  <span className="text-2xl">{cfg.iconEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium text-sm truncate">{cfg.nombre}</p>
                      <p className="text-xs text-gray-500 ml-2">{pct}%</p>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${cfg.gradiente} progress-bar-fill`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200 flex-shrink-0">
                    {asigStats.mejorPuntaje}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* Logros recientes */}
      {stats.logros.length > 0 && (
        <motion.section {...fadeUp(0.25)} className="mb-7">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-display font-bold">Logros</h2>
            <Link to="/achievements" className="text-primary-500 text-sm font-medium hover:underline">Ver todos</Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {stats.logros.slice(0, 5).map(id => {
              const a = ACHIEVEMENTS.find(a => a.id === id)
              if (!a) return null
              return (
                <div key={id} className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-2xl shadow-md`}>
                  {a.icono}
                </div>
              )
            })}
            <Link to="/achievements" className="flex-shrink-0 w-14 h-14 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
              <Trophy size={20} className="text-gray-400" />
            </Link>
          </div>
        </motion.section>
      )}

      {/* Meta de puntaje */}
      <motion.section {...fadeUp(0.3)} className="mb-10">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">Meta de Puntaje</p>
            <p className="text-primary-500 font-bold">{profile.meta} pts</p>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 progress-bar-fill"
              style={{ width: `${Math.min(100, (stats.puntajeMaximo / profile.meta) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Mejor: {stats.puntajeMaximo}</span>
            <span>Meta: {profile.meta}</span>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
