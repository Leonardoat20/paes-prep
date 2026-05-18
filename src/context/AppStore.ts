import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppConfig, UserProfile, UserStats, SubjectId, QuizResult, Achievement } from '@/types'

// ─── Logros disponibles ───────────────────────────────────────────────────────
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'primer_ensayo',   nombre: 'Primer Paso',       descripcion: 'Completa tu primer ensayo',                icono: '🎯', color: 'from-blue-400 to-blue-600',   categoria: 'progreso',    xp: 50  },
  { id: 'diez_ensayos',    nombre: 'Constante',          descripcion: 'Completa 10 ensayos',                      icono: '🔥', color: 'from-orange-400 to-red-500',   categoria: 'constancia',  xp: 150 },
  { id: 'racha_7',         nombre: 'Racha Semanal',      descripcion: '7 días seguidos estudiando',               icono: '⚡', color: 'from-yellow-400 to-orange-500', categoria: 'constancia',  xp: 200 },
  { id: 'puntaje_700',     nombre: 'Alto Rendimiento',   descripcion: 'Supera los 700 puntos PAES',               icono: '⭐', color: 'from-purple-400 to-pink-500',  categoria: 'rendimiento', xp: 300 },
  { id: 'puntaje_850',     nombre: 'Elite',              descripcion: 'Supera los 850 puntos PAES',               icono: '👑', color: 'from-yellow-400 to-yellow-600', categoria: 'rendimiento', xp: 500 },
  { id: 'perfecto',        nombre: 'Perfección',         descripcion: 'Responde todas correctas en un ensayo',    icono: '💎', color: 'from-cyan-400 to-blue-600',    categoria: 'rendimiento', xp: 1000},
  { id: 'todas_materias',  nombre: 'Enciclopedia',       descripcion: 'Rinde ensayos en las 5 asignaturas',       icono: '📚', color: 'from-green-400 to-emerald-600', categoria: 'progreso',    xp: 400 },
  { id: 'velocista',       nombre: 'Velocista',          descripcion: 'Termina un ensayo en menos de la mitad del tiempo', icono: '⚡', color: 'from-teal-400 to-cyan-500', categoria: 'especial', xp: 250 },
  { id: 'madrugador',      nombre: 'Madrugador',         descripcion: 'Estudia antes de las 8am',                 icono: '🌅', color: 'from-pink-400 to-rose-500',    categoria: 'especial',    xp: 100 },
  { id: 'nocturno',        nombre: 'Búho Nocturno',      descripcion: 'Estudia después de las 11pm',              icono: '🦉', color: 'from-indigo-400 to-purple-600', categoria: 'especial',    xp: 100 },
]

// ─── Configuraciones de asignaturas ──────────────────────────────────────────
export const SUBJECTS_CONFIG = {
  matematica_m1: {
    id: 'matematica_m1' as SubjectId,
    nombre: 'Matemática M1',
    descripcion: 'Números, álgebra, probabilidades y estadística',
    color: 'text-blue-500',
    gradiente: 'from-blue-500 to-indigo-600',
    iconEmoji: '📐',
    tiempoEnsayo: 150,
    preguntasEnsayo: 65,
    temas: ['Números', 'Álgebra y Funciones', 'Geometría', 'Probabilidades y Estadística'],
  },
  matematica_m2: {
    id: 'matematica_m2' as SubjectId,
    nombre: 'Matemática M2',
    descripcion: 'Álgebra lineal, cálculo y geometría analítica',
    color: 'text-purple-500',
    gradiente: 'from-purple-500 to-violet-600',
    iconEmoji: '📊',
    tiempoEnsayo: 150,
    preguntasEnsayo: 65,
    temas: ['Álgebra', 'Geometría Analítica', 'Cálculo Diferencial', 'Vectores y Matrices'],
  },
  lectora: {
    id: 'lectora' as SubjectId,
    nombre: 'Competencia Lectora',
    descripcion: 'Comprensión, análisis e interpretación de textos',
    color: 'text-emerald-500',
    gradiente: 'from-emerald-500 to-teal-600',
    iconEmoji: '📖',
    tiempoEnsayo: 130,
    preguntasEnsayo: 57,
    temas: ['Localización', 'Interpretación', 'Reflexión y Evaluación'],
  },
  ciencias: {
    id: 'ciencias' as SubjectId,
    nombre: 'Ciencias',
    descripcion: 'Biología, Física y Química',
    color: 'text-rose-500',
    gradiente: 'from-rose-500 to-pink-600',
    iconEmoji: '🔬',
    tiempoEnsayo: 160,
    preguntasEnsayo: 80,
    temas: ['Biología', 'Física', 'Química'],
  },
  historia: {
    id: 'historia' as SubjectId,
    nombre: 'Historia y Cs. Sociales',
    descripcion: 'Historia de Chile, universal, geografía y formación ciudadana',
    color: 'text-amber-500',
    gradiente: 'from-amber-500 to-orange-600',
    iconEmoji: '🌎',
    tiempoEnsayo: 160,
    preguntasEnsayo: 65,
    temas: ['Historia de Chile', 'Historia Universal', 'Geografía', 'Formación Ciudadana'],
  },
}

// ─── App Store ────────────────────────────────────────────────────────────────
interface AppState {
  config: AppConfig
  profile: UserProfile
  stats: UserStats
  setConfig: (cfg: Partial<AppConfig>) => void
  setProfile: (p: Partial<UserProfile>) => void
  addResult: (r: QuizResult) => void
  checkAchievements: () => string[]
  getXP: () => number
  getNivel: () => string
}

const defaultStats: UserStats = {
  totalEnsayos: 0,
  totalPreguntas: 0,
  totalCorrectas: 0,
  puntajeMaximo: 0,
  puntajePromedio: 0,
  porAsignatura: {},
  historial: [],
  logros: [],
  racha: 0,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      config: {
        tema: 'dark',
        sonido: true,
        musica: false,
        notificaciones: true,
        nombreApp: 'PAES Prep',
      },
      profile: {
        nombre: 'Estudiante',
        apellido: '',
        avatar: '🎓',
        meta: 700,
        region: 'Metropolitana',
        colegio: '',
        anioEgreso: new Date().getFullYear() + 1,
      },
      stats: defaultStats,

      setConfig: (cfg) =>
        set((s) => ({ config: { ...s.config, ...cfg } })),

      setProfile: (p) =>
        set((s) => ({ profile: { ...s.profile, ...p } })),

      addResult: (result) =>
        set((s) => {
          const hist = [result, ...s.stats.historial].slice(0, 100)
          const total = hist.length
          const promedio = hist.reduce((a, r) => a + r.puntajePaes, 0) / total
          const maximo = Math.max(s.stats.puntajeMaximo, result.puntajePaes)

          const asig = s.stats.porAsignatura[result.asignatura] ?? {
            ensayos: 0, totalPreguntas: 0, totalCorrectas: 0,
            puntajePromedio: 0, mejorPuntaje: 0, porTema: {},
          }

          const newAsig = {
            ...asig,
            ensayos: asig.ensayos + 1,
            totalPreguntas: asig.totalPreguntas + result.totalPreguntas,
            totalCorrectas: asig.totalCorrectas + result.correctas,
            mejorPuntaje: Math.max(asig.mejorPuntaje, result.puntajePaes),
            puntajePromedio: (asig.puntajePromedio * asig.ensayos + result.puntajePaes) / (asig.ensayos + 1),
          }

          // acumular por tema
          Object.entries(result.porTema).forEach(([tema, datos]) => {
            const prev = asig.porTema[tema] ?? { correctas: 0, total: 0 }
            newAsig.porTema[tema] = {
              correctas: prev.correctas + datos.correctas,
              total: prev.total + datos.total,
            }
          })

          // racha
          const hoy = new Date().toDateString()
          const ayer = new Date(Date.now() - 86400000).toDateString()
          const ultima = s.stats.ultimaSesion
          const nuevaRacha = ultima === ayer
            ? s.stats.racha + 1
            : ultima === hoy ? s.stats.racha : 1

          const newStats: UserStats = {
            ...s.stats,
            totalEnsayos: s.stats.totalEnsayos + 1,
            totalPreguntas: s.stats.totalPreguntas + result.totalPreguntas,
            totalCorrectas: s.stats.totalCorrectas + result.correctas,
            puntajeMaximo: maximo,
            puntajePromedio: Math.round(promedio),
            porAsignatura: { ...s.stats.porAsignatura, [result.asignatura]: newAsig },
            historial: hist,
            racha: nuevaRacha,
            ultimaSesion: hoy,
          }

          return { stats: newStats }
        }),

      checkAchievements: () => {
        const { stats } = get()
        const newUnlocked: string[] = []

        const checks: Record<string, boolean> = {
          primer_ensayo:  stats.totalEnsayos >= 1,
          diez_ensayos:   stats.totalEnsayos >= 10,
          racha_7:        stats.racha >= 7,
          puntaje_700:    stats.puntajeMaximo >= 700,
          puntaje_850:    stats.puntajeMaximo >= 850,
          perfecto:       stats.historial.some(r => r.correctas === r.totalPreguntas),
          todas_materias: Object.keys(stats.porAsignatura).length >= 5,
          velocista:      stats.historial.some(r =>
            r.tiempoTotal < (SUBJECTS_CONFIG[r.asignatura].tiempoEnsayo * 60) / 2
          ),
          madrugador: stats.historial.some(r => new Date(r.fecha).getHours() < 8),
          nocturno:    stats.historial.some(r => new Date(r.fecha).getHours() >= 23),
        }

        Object.entries(checks).forEach(([id, cumple]) => {
          if (cumple && !stats.logros.includes(id)) newUnlocked.push(id)
        })

        if (newUnlocked.length > 0) {
          set((s) => ({
            stats: { ...s.stats, logros: [...s.stats.logros, ...newUnlocked] },
          }))
        }
        return newUnlocked
      },

      getXP: () => {
        const { stats } = get()
        return stats.logros.reduce((acc, id) => {
          const a = ACHIEVEMENTS.find(a => a.id === id)
          return acc + (a?.xp ?? 0)
        }, 0) + stats.totalEnsayos * 10 + stats.totalCorrectas * 2
      },

      getNivel: () => {
        const xp = get().getXP()
        if (xp < 200)  return 'Principiante'
        if (xp < 600)  return 'Estudiante'
        if (xp < 1200) return 'Avanzado'
        if (xp < 2500) return 'Experto'
        return 'Elite PAES'
      },
    }),
    { name: 'paes-prep-app' }
  )
)
