import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, RefreshCw, Download, Search, Shield, Users, TrendingUp, BarChart2, Trash2 } from 'lucide-react'
import { getAllScores, type ScoreRecord } from '@/lib/supabase'
import { SUBJECTS_CONFIG } from '@/context/AppStore'
import clsx from 'clsx'

const SUBJECT_NAMES: Record<string, string> = {
  matematica_m1: 'Mat. M1',
  matematica_m2: 'Mat. M2',
  lectora: 'Lectora',
  ciencias: 'Ciencias',
  historia: 'Historia',
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'ProfeLeo2024'

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false)
  const [inputPwd, setInputPwd] = useState('')
  const [errorPwd, setErrorPwd] = useState(false)
  const [scores, setScores] = useState<ScoreRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroAsignatura, setFiltroAsignatura] = useState('todas')
  const [ordenarPor, setOrdenarPor] = useState<'fecha' | 'puntaje' | 'nombre'>('fecha')

  const handleLogin = () => {
    if (inputPwd === ADMIN_PASSWORD) {
      setAutenticado(true)
      cargarDatos()
    } else {
      setErrorPwd(true)
      setTimeout(() => setErrorPwd(false), 1500)
    }
  }

  const cargarDatos = async () => {
    setLoading(true)
    const data = await getAllScores()
    setScores(data)
    setLoading(false)
  }

  // Filtrar y ordenar
  const scoresFiltrados = scores
    .filter(s => filtroAsignatura === 'todas' || s.asignatura === filtroAsignatura)
    .filter(s =>
      busqueda === '' ||
      s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (s.colegio ?? '').toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => {
      if (ordenarPor === 'puntaje') return b.puntaje_paes - a.puntaje_paes
      if (ordenarPor === 'nombre') return a.nombre.localeCompare(b.nombre)
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    })

  // Estadísticas generales
  const stats = {
    total: scores.length,
    usuarios: new Set(scores.map(s => s.nombre)).size,
    promedio: scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b.puntaje_paes, 0) / scores.length)
      : 0,
    maximo: scores.length > 0 ? Math.max(...scores.map(s => s.puntaje_paes)) : 0,
  }

  // Top por asignatura
  const topPorAsignatura = Object.keys(SUBJECTS_CONFIG).map(key => {
    const sub = scores.filter(s => s.asignatura === key)
    if (sub.length === 0) return { key, top: null }
    const top = sub.sort((a, b) => b.puntaje_paes - a.puntaje_paes)[0]
    return { key, top }
  })

  // Exportar CSV
  const exportarCSV = () => {
    const header = 'Nombre,Colegio,Asignatura,Puntaje PAES,Nota,Correctas,Total,Porcentaje,Fecha\n'
    const rows = scoresFiltrados.map(s =>
      `"${s.nombre}","${s.colegio ?? ''}","${SUBJECT_NAMES[s.asignatura] ?? s.asignatura}",${s.puntaje_paes},${s.nota},${s.correctas},${s.total},${s.porcentaje}%,"${s.fecha}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ranking_paes_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Pantalla de login ─────────────────────────────────────────────────────
  if (!autenticado) {
    return (
      <main className="page-container max-w-sm mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full card p-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-display font-bold mb-1">Panel Admin</h1>
          <p className="text-sm text-gray-400 mb-6">Solo para el profesor</p>

          <input
            type="password"
            placeholder="Contraseña"
            value={inputPwd}
            onChange={e => setInputPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className={clsx(
              'w-full px-4 py-3 rounded-xl border text-sm mb-3 bg-gray-50 dark:bg-gray-900 outline-none transition-all',
              errorPwd
                ? 'border-red-400 animate-shake'
                : 'border-gray-200 dark:border-gray-700 focus:border-primary-400'
            )}
          />
          {errorPwd && <p className="text-xs text-red-400 mb-3">Contraseña incorrecta</p>}
          <button onClick={handleLogin} className="btn-primary w-full flex items-center justify-center gap-2">
            <Lock size={16} /> Ingresar
          </button>
        </motion.div>
      </main>
    )
  }

  // ── Panel principal ───────────────────────────────────────────────────────
  return (
    <main className="page-container max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold gradient-text">Panel Admin</h1>
            <p className="text-xs text-gray-400 mt-0.5">Reporte completo de estudiantes</p>
          </div>
          <div className="flex gap-2">
            <button onClick={cargarDatos} className="btn-ghost flex items-center gap-1 text-xs">
              <RefreshCw size={13} /> Actualizar
            </button>
            <button onClick={exportarCSV} className="btn-secondary flex items-center gap-1 text-xs">
              <Download size={13} /> CSV
            </button>
          </div>
        </div>

        {/* Tarjetas estadísticas */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          {[
            { label: 'Ensayos', value: stats.total, icon: BarChart2, color: 'from-blue-400 to-blue-600' },
            { label: 'Estudiantes', value: stats.usuarios, icon: Users, color: 'from-emerald-400 to-teal-600' },
            { label: 'Promedio', value: stats.promedio, icon: TrendingUp, color: 'from-purple-400 to-violet-600' },
            { label: 'Máximo', value: stats.maximo, icon: TrendingUp, color: 'from-yellow-400 to-orange-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Top por asignatura */}
        <div className="card p-4 mb-6">
          <h2 className="text-sm font-bold mb-3 text-gray-600 dark:text-gray-300">🏅 Mejor puntaje por asignatura</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {topPorAsignatura.map(({ key, top }) => (
              <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                <span className="text-xl">{SUBJECTS_CONFIG[key as keyof typeof SUBJECTS_CONFIG]?.iconEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{SUBJECT_NAMES[key]}</p>
                  {top ? (
                    <>
                      <p className="text-sm font-semibold truncate">{top.nombre}</p>
                      <p className="text-xs text-gray-400 truncate">{top.colegio || '—'}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Sin datos</p>
                  )}
                </div>
                {top && (
                  <p className="text-lg font-bold text-yellow-500">{top.puntaje_paes}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o colegio..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:border-primary-400 transition-all"
            />
          </div>

          {/* Filtros asignatura */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFiltroAsignatura('todas')}
              className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                filtroAsignatura === 'todas' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}
            >
              Todas
            </button>
            {Object.entries(SUBJECTS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFiltroAsignatura(key)}
                className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                  filtroAsignatura === key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}
              >
                {cfg.iconEmoji} {SUBJECT_NAMES[key]}
              </button>
            ))}
          </div>

          {/* Ordenar */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Ordenar:</span>
            {(['fecha', 'puntaje', 'nombre'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setOrdenarPor(opt)}
                className={clsx('px-2.5 py-1 rounded-lg font-semibold capitalize transition-all',
                  ordenarPor === opt ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500')}
              >
                {opt === 'fecha' ? 'Fecha' : opt === 'puntaje' ? 'Puntaje' : 'Nombre'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de resultados */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-400">Cargando datos...</p>
            </div>
          ) : scoresFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">No se encontraron resultados.</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 font-semibold">{scoresFiltrados.length} registros</p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {scoresFiltrados.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 p-4 items-center"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {s.nombre.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm truncate">{s.nombre}</p>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-md">
                          {SUBJECTS_CONFIG[s.asignatura as keyof typeof SUBJECTS_CONFIG]?.iconEmoji} {SUBJECT_NAMES[s.asignatura] ?? s.asignatura}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        {s.colegio && <span>{s.colegio}</span>}
                        <span>{s.fecha}</span>
                        <span>{s.correctas}/{s.total} correctas</span>
                      </div>
                    </div>

                    {/* Puntaje */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg text-primary-500">{s.puntaje_paes}</p>
                      <p className="text-xs text-gray-400">Nota {s.nota} · {s.porcentaje}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 dark:text-gray-700 mt-6 tracking-widest">
          ✦ Profe Leo · LAAT ✦
        </p>
      </motion.div>
    </main>
  )
}
