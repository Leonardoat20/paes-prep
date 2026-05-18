import { motion } from 'framer-motion'
import { Trophy, Lock } from 'lucide-react'
import { ACHIEVEMENTS, useAppStore } from '@/context/AppStore'
import clsx from 'clsx'

export default function Achievements() {
  const { stats, getXP } = useAppStore()
  const xp = getXP()

  const categorias = ['progreso', 'rendimiento', 'constancia', 'especial'] as const
  const categoriaLabels = {
    progreso:    '📈 Progreso',
    rendimiento: '⭐ Rendimiento',
    constancia:  '🔥 Constancia',
    especial:    '✨ Especial',
  }

  return (
    <main className="page-container max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">Logros</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stats.logros.length} / {ACHIEVEMENTS.length} desbloqueados · {xp} XP total
            </p>
          </div>
        </div>

        {/* Barra de XP */}
        <div className="card p-4 mb-6 bg-gradient-to-r from-primary-600 to-indigo-700 text-white">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold">⚡ {xp} XP</span>
            <span className="opacity-70">Siguiente: {Math.ceil(xp / 500) * 500} XP</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/80 progress-bar-fill" style={{ width: `${(xp % 500) / 5}%` }} />
          </div>
        </div>

        {/* Logros por categoría */}
        {categorias.map(cat => {
          const catAchievements = ACHIEVEMENTS.filter(a => a.categoria === cat)
          return (
            <div key={cat} className="mb-6">
              <h2 className="font-display font-bold mb-3 px-1">{categoriaLabels[cat]}</h2>
              <div className="grid grid-cols-2 gap-3">
                {catAchievements.map((a, i) => {
                  const unlocked = stats.logros.includes(a.id)
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={clsx(
                        'card p-4 flex flex-col items-center text-center gap-2 transition-all',
                        unlocked ? 'shadow-md' : 'opacity-50 grayscale'
                      )}
                    >
                      <div className={clsx(
                        'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl',
                        unlocked
                          ? `bg-gradient-to-br ${a.color} shadow-lg`
                          : 'bg-gray-100 dark:bg-gray-800'
                      )}>
                        {unlocked ? a.icono : <Lock size={20} className="text-gray-400" />}
                      </div>
                      <p className="font-semibold text-sm leading-tight">{a.nombre}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{a.descripcion}</p>
                      <span className="text-xs font-bold text-primary-500">{a.xp} XP</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </motion.div>
    </main>
  )
}
