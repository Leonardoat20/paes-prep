import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Star, RefreshCw, School, BookOpen } from 'lucide-react'
import { getRanking, type ScoreRecord } from '@/lib/supabase'
import { SUBJECTS_CONFIG } from '@/context/AppStore'
import clsx from 'clsx'

const SUBJECT_NAMES: Record<string, string> = {
  matematica_m1: 'Mat. M1',
  matematica_m2: 'Mat. M2',
  lectora: 'Lectora',
  ciencias: 'Ciencias',
  historia: 'Historia',
}

const MEDAL_COLORS = [
  'text-yellow-400',
  'text-gray-400',
  'text-amber-600',
]

export default function Ranking() {
  const [scores, setScores] = useState<ScoreRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroAsignatura, setFiltroAsignatura] = useState('todas')

  const cargarRanking = async () => {
    setLoading(true)
    const data = await getRanking()
    setScores(data)
    setLoading(false)
  }

  useEffect(() => { cargarRanking() }, [])

  const scoresFiltrados = filtroAsignatura === 'todas'
    ? scores
    : scores.filter(s => s.asignatura === filtroAsignatura)

  return (
    <main className="page-container max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">
            🏆
          </div>
          <h1 className="text-2xl font-display font-bold gradient-text">Ranking PAES</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Los mejores puntajes de todos los estudiantes</p>
        </div>

        {/* Filtro por asignatura */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setFiltroAsignatura('todas')}
            className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
              filtroAsignatura === 'todas'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}
          >
            Todas
          </button>
          {Object.entries(SUBJECTS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFiltroAsignatura(key)}
              className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                filtroAsignatura === key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}
            >
              {cfg.iconEmoji} {SUBJECT_NAMES[key]}
            </button>
          ))}
        </div>

        {/* Botón actualizar */}
        <div className="flex justify-end mb-3">
          <button onClick={cargarRanking} className="btn-ghost flex items-center gap-1 text-xs">
            <RefreshCw size={13} /> Actualizar
          </button>
        </div>

        {/* Top 3 */}
        {!loading && scoresFiltrados.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-6">
            {/* 2do lugar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex-1 card p-4 text-center">
              <div className="text-2xl mb-1">🥈</div>
              <p className="font-bold text-sm truncate">{scoresFiltrados[1]?.nombre}</p>
              <p className="text-xs text-gray-500 truncate">{scoresFiltrados[1]?.colegio || '—'}</p>
              <p className="text-lg font-bold text-gray-400 mt-1">{scoresFiltrados[1]?.puntaje_paes}</p>
              <p className="text-xs text-gray-400">{SUBJECT_NAMES[scoresFiltrados[1]?.asignatura] ?? ''}</p>
            </motion.div>
            {/* 1er lugar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 card p-5 text-center border-2 border-yellow-400 shadow-lg">
              <div className="text-3xl mb-1">🥇</div>
              <p className="font-bold truncate">{scoresFiltrados[0]?.nombre}</p>
              <p className="text-xs text-gray-500 truncate">{scoresFiltrados[0]?.colegio || '—'}</p>
              <p className="text-xl font-bold text-yellow-500 mt-1">{scoresFiltrados[0]?.puntaje_paes}</p>
              <p className="text-xs text-gray-400">{SUBJECT_NAMES[scoresFiltrados[0]?.asignatura] ?? ''}</p>
            </motion.div>
            {/* 3er lugar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex-1 card p-4 text-center">
              <div className="text-2xl mb-1">🥉</div>
              <p className="font-bold text-sm truncate">{scoresFiltrados[2]?.nombre}</p>
              <p className="text-xs text-gray-500 truncate">{scoresFiltrados[2]?.colegio || '—'}</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{scoresFiltrados[2]?.puntaje_paes}</p>
              <p className="text-xs text-gray-400">{SUBJECT_NAMES[scoresFiltrados[2]?.asignatura] ?? ''}</p>
            </motion.div>
          </div>
        )}

        {/* Lista completa */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-400">Cargando ranking...</p>
            </div>
          ) : scoresFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aún no hay puntajes registrados.</p>
              <p className="text-xs text-gray-400 mt-1">¡Sé el primero en aparecer!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {scoresFiltrados.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-4"
                >
                  {/* Posición */}
                  <div className="w-8 text-center">
                    {i < 3
                      ? <span className="text-lg">{['🥇','🥈','🥉'][i]}</span>
                      : <span className="text-sm font-bold text-gray-400">#{i+1}</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{s.nombre}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      {s.colegio && <span className="flex items-center gap-0.5"><School size={10}/>{s.colegio}</span>}
                      <span className="flex items-center gap-0.5"><BookOpen size={10}/>{SUBJECT_NAMES[s.asignatura] ?? s.asignatura}</span>
                    </div>
                  </div>

                  {/* Puntaje */}
                  <div className="text-right">
                    <p className={clsx('font-bold text-lg', i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-primary-500')}>
                      {s.puntaje_paes}
                    </p>
                    <p className="text-xs text-gray-400">{s.porcentaje}% correctas</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  )
}
