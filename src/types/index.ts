// ─── Pregunta ───────────────────────────────────────────────────────────────
export interface Question {
  id: number
  asignatura: SubjectId
  tema: string
  subtema?: string
  eje_tematico: string
  dificultad: 'baja' | 'media' | 'alta'
  tipo: 'seleccion_multiple' | 'verdadero_falso'
  pregunta: string
  alternativas: string[]
  respuesta_correcta: string
  explicacion: string
  imagen?: string
  anio?: number
}

// ─── Asignaturas ─────────────────────────────────────────────────────────────
export type SubjectId =
  | 'matematica_m1'
  | 'matematica_m2'
  | 'lectora'
  | 'ciencias'
  | 'historia'

export interface SubjectConfig {
  id: SubjectId
  nombre: string
  descripcion: string
  color: string
  gradiente: string
  iconEmoji: string
  tiempoEnsayo: number  // minutos
  preguntasEnsayo: number
  temas: string[]
}

// ─── Sesión de Quiz ──────────────────────────────────────────────────────────
export interface QuizSession {
  id: string
  asignatura: SubjectId
  nombreAsignatura: string
  fecha: string
  preguntas: Question[]
  respuestas: Record<number, string>
  tiempoTotal: number  // segundos totales usados
  tiempoPorPregunta: Record<number, number>
  completado: boolean
  modoEnsayo: 'completo' | 'rapido' | 'tematico'
}

// ─── Resultado ───────────────────────────────────────────────────────────────
export interface ResultadoPorTema {
  correctas: number
  total: number
  porcentaje: number
  nivel: 'domina' | 'en_proceso' | 'reforzar'
}

export interface QuizResult {
  sessionId: string
  asignatura: SubjectId
  nombreAsignatura: string
  fecha: string
  puntajePaes: number          // 150–1000
  porcentajeLogro: number      // 0–100
  correctas: number
  incorrectas: number
  omitidas: number
  totalPreguntas: number
  porTema: Record<string, ResultadoPorTema>
  fortalezas: string[]
  debilidades: string[]
  recomendaciones: string[]
  tiempoTotal: number
  tiempoPromedio: number       // segundos por pregunta
  nota: number                 // 1.0–7.0 equivalente
}

// ─── Estadísticas de usuario ─────────────────────────────────────────────────
export interface SubjectStats {
  ensayos: number
  totalPreguntas: number
  totalCorrectas: number
  puntajePromedio: number
  mejorPuntaje: number
  porTema: Record<string, { correctas: number; total: number }>
  ultimaFecha?: string
}

export interface UserStats {
  totalEnsayos: number
  totalPreguntas: number
  totalCorrectas: number
  puntajeMaximo: number
  puntajePromedio: number
  porAsignatura: Partial<Record<SubjectId, SubjectStats>>
  historial: QuizResult[]
  logros: string[]
  racha: number
  ultimaSesion?: string
}

// ─── Perfil ───────────────────────────────────────────────────────────────────
export interface UserProfile {
  nombre: string
  apellido: string
  avatar: string
  meta: number        // puntaje objetivo
  region: string
  colegio: string
  anioEgreso: number
}

// ─── Logros ───────────────────────────────────────────────────────────────────
export interface Achievement {
  id: string
  nombre: string
  descripcion: string
  icono: string
  color: string
  categoria: 'progreso' | 'rendimiento' | 'constancia' | 'especial'
  xp: number
}

// ─── Config de la app ─────────────────────────────────────────────────────────
export interface AppConfig {
  tema: 'dark' | 'light'
  sonido: boolean
  musica: boolean
  notificaciones: boolean
  nombreApp: string
}
