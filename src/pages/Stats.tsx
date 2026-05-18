import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Target, Calendar } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from 'recharts'
import { useAppStore, SUBJECTS_CONFIG } from '@/context/AppStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import clsx from 'clsx'

const SUBJECT_COLORS: Record<string, string> = {
  matematica_m1: '#5663ff',
  matematica_m2: '#a855f7',
  lectora:       '#22c55e',
  ciencias:      '#ef4444',
  historia:      '#f97316',
}

export default function Stats() {
  const { stats, profile } = useAppStore()
  const hist = [...stats.historial].reverse()  // cronológico

  const lineData = hist.slice(-20).map(r => ({
    fecha: format(new Date(r.fecha), 'dd MMM', { locale: es }),
    puntaje: r.puntajePaes,
    logro: r.porcentajeLogro,
  }))

  const barData = Object.entries(stats.porAsignatura).map(([id, s]) => ({
    name: SUBJECTS_CONFIG[id as keyof typeof SUBJECTS_CONFIG]?.nombre.split(' ')[0] ?? id,
    puntaje: Math.round(s.puntajePromedio),
    ensayos: s.ensayos,
    color: SUBJECT_COLORS[id] ?? '#9ca3af',
  }))

  const tasaGlobal = stats.totalPreguntas > 0
    ? Math.round((stats.totalCorrectas / stats.totalPreguntas) * 100)
    : 0

  return (
    <main className="page-container max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold mb-1">Mis Estadísticas</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Seguimiento de tu progreso</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Ensayos',       value: stats.totalEnsayos,   icon: Calendar,  color: 'text-primary-500',  bg: 'bg-primary-50 dark:bg-primary-900/20' },
            { label: 'Mejor Puntaje', value: stats.puntajeMaximo,  icon: Target,    color: 'text-yellow-500',   bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { label: 'Prom. Puntaje', value: stats.puntajePromedio,icon: TrendingUp,color: 'text-green-500',    bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Tasa Acierto',  value: `${tasaGlobal}%`,     icon: BarChart2, color: 'text-rose-500',     bg: 'bg-rose-50 dark:bg-rose-900/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={clsx('card p-4 flex items-center gap-3', bg)}>
              <div className={clsx('p-2 rounded-xl bg-white dark:bg-black/20', color)}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Meta */}
        <div className="card p-4 mb-6">
          <div className="flex justify-between mb-2 text-sm">
            <span className="font-semibold">Meta: {profile.meta} pts</span>
            <span className="text-gray-400">{Math.min(100, Math.round((stats.puntajeMaximo / profile.meta) * 100))}%</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 progress-bar-fill"
              style={{ width: `${Math.min(100, (stats.puntajeMaximo / profile.meta) * 100)}%` }} />
          </div>
        </div>

        {/* Evolución temporal */}
        {lineData.length >= 2 && (
          <div className="card p-5 mb-6">
            <p className="font-semibold mb-4">Evolución de Puntaje</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb44" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis domain={[150, 1000]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', background: '#1a1a2e', color: '#f0f0ff', fontSize: 12 }}
                  formatter={(v: number) => [`${v} pts`, 'Puntaje']}
                />
                <Line type="monotone" dataKey="puntaje" stroke="#5663ff" strokeWidth={2.5} dot={{ fill: '#5663ff', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Puntaje por asignatura */}
        {barData.length > 0 && (
          <div className="card p-5 mb-6">
            <p className="font-semibold mb-4">Puntaje Promedio por Asignatura</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb44" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis domain={[0, 1000]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', background: '#1a1a2e', color: '#f0f0ff', fontSize: 12 }}
                  formatter={(v: number) => [`${v} pts`, 'Promedio']}
                />
                <Bar dataKey="puntaje" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Historial de ensayos */}
        <div className="card p-5 mb-10">
          <p className="font-semibold mb-4">Historial de Ensayos</p>
          {stats.historial.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Aún no has realizado ensayos.</p>
          ) : (
            <div className="space-y-3">
              {stats.historial.slice(0, 10).map((r) => (
                <div key={r.sessionId} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-[#2d2d4e] last:border-0">
                  <span className="text-xl">{SUBJECTS_CONFIG[r.asignatura]?.iconEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.nombreAsignatura}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(r.fecha), "d 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-500">{r.puntajePaes}</p>
                    <p className="text-xs text-gray-400">{r.porcentajeLogro}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  )
}
