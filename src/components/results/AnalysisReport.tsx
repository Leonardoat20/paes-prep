import { motion } from 'framer-motion'
import { Target, TrendingUp, TrendingDown, Lightbulb, BookOpen } from 'lucide-react'
import type { QuizResult } from '@/types'
import clsx from 'clsx'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts'

interface Props { result: QuizResult }

const nivelConfig = {
  domina:     { label: 'Domina',      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' },
  en_proceso: { label: 'En proceso',  color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' },
  reforzar:   { label: 'Reforzar',    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' },
}

export default function AnalysisReport({ result }: Props) {
  const temas = Object.entries(result.porTema)
  const radarData = temas.map(([tema, datos]) => ({
    tema: tema.length > 15 ? tema.slice(0, 15) + '…' : tema,
    valor: datos.porcentaje,
    fullTema: tema,
  }))

  return (
    <div className="space-y-5">
      {/* Radar de temas */}
      {temas.length >= 3 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-primary-500" />
            <p className="font-semibold">Rendimiento por Área</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" strokeDasharray="4 2" />
              <PolarAngleAxis dataKey="tema" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Radar name="Logro" dataKey="valor" stroke="#5663ff" fill="#5663ff" fillOpacity={0.3} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Logro']}
                contentStyle={{ borderRadius: 12, border: 'none', background: '#1a1a2e', color: '#f0f0ff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Por tema detalle */}
      <div className="card p-5">
        <p className="font-semibold mb-4">Detalle por Tema</p>
        <div className="space-y-3">
          {temas.map(([tema, datos]) => (
            <motion.div
              key={tema}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate mr-2">{tema}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{datos.correctas}/{datos.total}</span>
                  <span className={clsx('badge border', nivelConfig[datos.nivel].color)}>
                    {nivelConfig[datos.nivel].label}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${datos.porcentaje}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={clsx(
                    'h-full rounded-full',
                    datos.nivel === 'domina'     ? 'bg-green-400' :
                    datos.nivel === 'en_proceso' ? 'bg-yellow-400' : 'bg-red-400'
                  )}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fortalezas */}
      {result.fortalezas.length > 0 && (
        <div className="card p-5 border-green-300 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-green-500" />
            <p className="font-semibold text-green-700 dark:text-green-400">Áreas Dominadas</p>
          </div>
          <ul className="space-y-2">
            {result.fortalezas.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Debilidades */}
      {result.debilidades.length > 0 && (
        <div className="card p-5 border-red-300 dark:border-red-800">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={18} className="text-red-500" />
            <p className="font-semibold text-red-700 dark:text-red-400">Áreas a Reforzar</p>
          </div>
          <ul className="space-y-2">
            {result.debilidades.map(d => (
              <li key={d} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-red-500">●</span> {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recomendaciones IA */}
      <div className="card p-5 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-primary-500" />
          <p className="font-semibold text-primary-700 dark:text-primary-300">Recomendaciones Personalizadas</p>
          <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 ml-1">IA</span>
        </div>
        <ul className="space-y-3">
          {result.recomendaciones.map((rec, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <BookOpen size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
