import type { Question, SubjectId, SubjectStats } from '@/types'

interface AdaptiveConfig {
  totalQuestions: number
  subjectStats?: SubjectStats
}

// Selecciona preguntas de forma adaptativa según el rendimiento previo del estudiante
export function selectAdaptiveQuestions(
  allQuestions: Question[],
  config: AdaptiveConfig
): Question[] {
  const { totalQuestions, subjectStats } = config

  if (!subjectStats || subjectStats.ensayos === 0) {
    // Primera vez: mezcla aleatoria balanceada
    return shuffleBalanced(allQuestions, totalQuestions)
  }

  const { porTema } = subjectStats
  const temas = [...new Set(allQuestions.map(q => q.tema))]

  // Calcular peso por tema (más peso = más preguntas de ese tema)
  const pesos: Record<string, number> = {}
  temas.forEach(tema => {
    const datos = porTema[tema]
    if (!datos || datos.total === 0) {
      pesos[tema] = 1.5  // temas no vistos tienen prioridad media-alta
    } else {
      const pct = datos.correctas / datos.total
      // Invertir el porcentaje para priorizar áreas débiles
      pesos[tema] = pct < 0.4 ? 3.0 : pct < 0.6 ? 2.0 : pct < 0.8 ? 1.2 : 0.8
    }
  })

  // Distribuir preguntas según pesos
  const totalPeso = Object.values(pesos).reduce((a, b) => a + b, 0)
  const seleccionadas: Question[] = []
  const usadas = new Set<number>()

  temas.forEach(tema => {
    const cuota = Math.max(1, Math.round((pesos[tema] / totalPeso) * totalQuestions))
    const disponibles = allQuestions.filter(q => q.tema === tema && !usadas.has(q.id))

    // Priorizar dificultad según rendimiento en el tema
    const datos = porTema[tema]
    const pct = datos ? datos.correctas / Math.max(datos.total, 1) : 0.5
    const ordenadas = sortByDifficulty(disponibles, pct)

    ordenadas.slice(0, cuota).forEach(q => {
      seleccionadas.push(q)
      usadas.add(q.id)
    })
  })

  // Completar si faltan preguntas
  if (seleccionadas.length < totalQuestions) {
    const restantes = allQuestions.filter(q => !usadas.has(q.id))
    const extra = shuffleArray(restantes).slice(0, totalQuestions - seleccionadas.length)
    seleccionadas.push(...extra)
  }

  return shuffleArray(seleccionadas).slice(0, totalQuestions)
}

// Ordena preguntas por dificultad apropiada para el nivel del estudiante
function sortByDifficulty(questions: Question[], rendimiento: number): Question[] {
  const order = rendimiento < 0.4
    ? ['baja', 'media', 'alta']   // estudiante débil: empezar fácil
    : rendimiento < 0.7
    ? ['media', 'baja', 'alta']   // nivel medio: preguntas medias primero
    : ['alta', 'media', 'baja']   // nivel alto: desafío mayor

  return [...questions].sort((a, b) => {
    return order.indexOf(a.dificultad) - order.indexOf(b.dificultad)
  })
}

function shuffleBalanced(questions: Question[], n: number): Question[] {
  const por_dificultad = {
    baja:  questions.filter(q => q.dificultad === 'baja'),
    media: questions.filter(q => q.dificultad === 'media'),
    alta:  questions.filter(q => q.dificultad === 'alta'),
  }

  const bajas  = shuffleArray(por_dificultad.baja).slice(0, Math.ceil(n * 0.3))
  const medias = shuffleArray(por_dificultad.media).slice(0, Math.ceil(n * 0.45))
  const altas  = shuffleArray(por_dificultad.alta).slice(0, Math.ceil(n * 0.25))

  const combined = [...bajas, ...medias, ...altas]
  if (combined.length < n) {
    const resto = shuffleArray(questions.filter(q => !combined.includes(q)))
    combined.push(...resto.slice(0, n - combined.length))
  }

  return shuffleArray(combined).slice(0, n)
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Carga preguntas desde los JSON locales
export async function loadQuestions(asignatura: SubjectId): Promise<Question[]> {
  const modules: Record<SubjectId, () => Promise<{ default: Question[] }>> = {
    matematica_m1: () => import('@/data/questions/matematica_m1.json') as never,
    matematica_m2: () => import('@/data/questions/matematica_m2.json') as never,
    lectora:       () => import('@/data/questions/lectora.json') as never,
    ciencias:      () => import('@/data/questions/ciencias.json') as never,
    historia:      () => import('@/data/questions/historia.json') as never,
  }
  const mod = await modules[asignatura]()
  return mod.default as Question[]
}
