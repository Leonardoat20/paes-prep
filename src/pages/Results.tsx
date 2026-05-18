import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, RotateCcw, Home, ChevronDown, ChevronUp, Share2, Trophy } from 'lucide-react'
import type { QuizResult } from '@/types'
import { useAppStore } from '@/context/AppStore'
import ScoreCard from '@/components/results/ScoreCard'
import AnalysisReport from '@/components/results/AnalysisReport'
import { exportResultadoPDF } from '@/utils/pdfExport'
import { ACHIEVEMENTS } from '@/context/AppStore'

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { profile, stats } = useAppStore()
  const [activeTab, setActiveTab] = useState<'resumen' | 'analisis'>('resumen')
  const [showNewAchievements, setShowNewAchievements] = useState(true)

  // Obtener el resultado: del state de navegación o del historial
  const result: QuizResult | undefined =
    state?.resultado ??
    stats.historial[0]

  const newAchievements: string[] = state?.newAchievements ?? []

  if (!result) {
    return (
      <main className="page-container flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No hay resultados disponibles.</p>
          <Link to="/subjects" className="btn-primary">Hacer un ensayo</Link>
        </div>
      </main>
    )
  }

  const handleExportPDF = () => exportResultadoPDF(result, `${profile.nombre} ${profile.apellido}`)

  const handleShare = async () => {
    const text = `¡Obtuve ${result.puntajePaes} puntos en ${result.nombreAsignatura} en PAES Prep! 🎓`
    if (navigator.share) {
      await navigator.share({ title: 'PAES Prep', text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('¡Texto copiado al portapapeles!')
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pb-24 pt-20 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logros desbloqueados */}
        <AnimatePresence>
          {showNewAchievements && newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-5 card p-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400 dark:border-yellow-600"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-500" />
                  <p className="font-bold text-yellow-700 dark:text-yellow-400">¡Nuevo{newAchievements.length > 1 ? 's' : ''} Logro{newAchievements.length > 1 ? 's' : ''}!</p>
                </div>
                <button onClick={() => setShowNewAchievements(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {newAchievements.map(id => {
                  const a = ACHIEVEMENTS.find(a => a.id === id)
                  if (!a) return null
                  return (
                    <div key={id} className="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-xl p-2">
                      <span className="text-2xl">{a.icono}</span>
                      <div>
                        <p className="text-xs font-bold">{a.nombre}</p>
                        <p className="text-xs text-gray-500">{a.xp} XP</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-display font-bold">Resultados</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{result.nombreAsignatura}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleShare} className="btn-ghost p-2"><Share2 size={18} /></button>
            <button onClick={handleExportPDF} className="btn-ghost p-2"><Download size={18} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-[#151528] p-1 mb-5">
          {(['resumen', 'analisis'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-[#1a1a2e] shadow-sm text-primary-600 dark:text-primary-400'
                  : 'text-gray-500'
              }`}
            >
              {tab === 'resumen' ? 'Resumen' : 'Análisis Detallado'}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'resumen' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'resumen' ? <ScoreCard result={result} /> : <AnalysisReport result={result} />}
          </motion.div>
        </AnimatePresence>

        {/* Acciones */}
        <div className="flex gap-3 mt-6">
          <Link to="/subjects" className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Repetir
          </Link>
          <Link to="/" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Home size={16} /> Inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
