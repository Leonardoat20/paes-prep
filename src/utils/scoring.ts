import type { Question, QuizSession, QuizResult, ResultadoPorTema } from '@/types'

// Convierte puntaje bruto a puntaje PAES estimado (150–1000)
export function calcularPuntajePAES(correctas: number, total: number): number {
  if (total === 0) return 150
  const porcentaje = correctas / total
  // Curva PAES aproximada basada en tablas históricas DEMRE
  // La distribución no es lineal: el rango 40-70% acumula la mayoría de puntajes
  const raw = porcentaje * 100
  let puntaje: number
  if (raw < 20)       puntaje = 150 + raw * 2.5
  else if (raw < 40)  puntaje = 200 + (raw - 20) * 7.5
  else if (raw < 60)  puntaje = 350 + (raw - 40) * 8.5
  else if (raw < 80)  puntaje = 520 + (raw - 60) * 9
  else                puntaje = 700 + (raw - 80) * 15
  return Math.min(1000, Math.max(150, Math.round(puntaje)))
}

// Convierte puntaje PAES a nota equivalente (1.0–7.0)
export function puntajeANota(puntaje: number): number {
  if (puntaje < 250)  return 1.0
  if (puntaje < 350)  return 2.0 + ((puntaje - 250) / 100) * 0.5
  if (puntaje < 450)  return 2.5 + ((puntaje - 350) / 100) * 0.5
  if (puntaje < 550)  return 3.0 + ((puntaje - 450) / 100) * 1.0
  if (puntaje < 650)  return 4.0 + ((puntaje - 550) / 100) * 1.0
  if (puntaje < 800)  return 5.0 + ((puntaje - 650) / 150) * 1.0
  if (puntaje < 950)  return 6.0 + ((puntaje - 800) / 150) * 0.8
  return Math.min(7.0, 6.8 + ((puntaje - 950) / 50) * 0.2)
}

// Calcula el nivel de dominio para un tema
export function calcularNivel(porcentaje: number): ResultadoPorTema['nivel'] {
  if (porcentaje >= 70) return 'domina'
  if (porcentaje >= 40) return 'en_proceso'
  return 'reforzar'
}

// Genera el resultado completo de una sesión
export function calcularResultado(session: QuizSession): QuizResult {
  const { preguntas, respuestas, tiempoPorPregunta } = session
  let correctas = 0
  let incorrectas = 0
  let omitidas = 0
  const porTema: Record<string, { correctas: number; total: number }> = {}

  preguntas.forEach((q) => {
    const respuesta = respuestas[q.id]
    const tema = q.tema

    if (!porTema[tema]) porTema[tema] = { correctas: 0, total: 0 }
    porTema[tema].total += 1

    if (!respuesta) {
      omitidas += 1
    } else if (respuesta === q.respuesta_correcta) {
      correctas += 1
      porTema[tema].correctas += 1
    } else {
      incorrectas += 1
    }
  })

  const total = preguntas.length
  const porcentajeLogro = total > 0 ? Math.round((correctas / total) * 100) : 0
  const puntajePaes = calcularPuntajePAES(correctas, total)
  const nota = puntajeANota(puntajePaes)

  // Calcular porcentaje y nivel por tema
  const porTemaResultado: Record<string, ResultadoPorTema> = {}
  const fortalezas: string[] = []
  const debilidades: string[] = []

  Object.entries(porTema).forEach(([tema, datos]) => {
    const pct = datos.total > 0 ? Math.round((datos.correctas / datos.total) * 100) : 0
    const nivel = calcularNivel(pct)
    porTemaResultado[tema] = { ...datos, porcentaje: pct, nivel }

    if (nivel === 'domina') fortalezas.push(tema)
    else if (nivel === 'reforzar') debilidades.push(tema)
  })

  const tiempos = Object.values(tiempoPorPregunta)
  const tiempoTotal = session.tiempoTotal || tiempos.reduce((a, b) => a + b, 0)
  const tiempoPromedio = tiempos.length > 0 ? Math.round(tiempoTotal / tiempos.length) : 0

  const recomendaciones = generarRecomendaciones(debilidades, fortalezas, puntajePaes, session.asignatura)

  return {
    sessionId: session.id,
    asignatura: session.asignatura,
    nombreAsignatura: session.nombreAsignatura,
    fecha: session.fecha,
    puntajePaes,
    porcentajeLogro,
    correctas,
    incorrectas,
    omitidas,
    totalPreguntas: total,
    porTema: porTemaResultado,
    fortalezas,
    debilidades,
    recomendaciones,
    tiempoTotal,
    tiempoPromedio,
    nota: Math.round(nota * 10) / 10,
  }
}

function generarRecomendaciones(
  debilidades: string[],
  fortalezas: string[],
  puntaje: number,
  asignatura: string
): string[] {
  const recs: string[] = []

  if (debilidades.length > 0) {
    recs.push(
      `Enfoca tu estudio en: ${debilidades.join(', ')}. Practica ejercicios específicos de estas áreas.`
    )
  }

  if (fortalezas.length > 0) {
    recs.push(
      `Tienes buen dominio en: ${fortalezas.join(', ')}. Mantén la práctica para consolidar estos conocimientos.`
    )
  }

  if (puntaje < 450) {
    recs.push('Tu puntaje está por debajo del promedio. Te recomendamos revisar los contenidos básicos y aumentar la frecuencia de práctica a diario.')
  } else if (puntaje < 600) {
    recs.push('Estás en un rango intermedio. Enfócate en los temas con menor porcentaje de logro y practica con preguntas de dificultad alta.')
  } else if (puntaje < 750) {
    recs.push('Buen desempeño. Para alcanzar puntajes de excelencia, trabaja en las preguntas de mayor dificultad y en gestión del tiempo.')
  } else {
    recs.push('¡Excelente resultado! Sigue practicando para mantener y superar este nivel. Prueba los ensayos cronometrados.')
  }

  if (asignatura === 'matematica_m1' || asignatura === 'matematica_m2') {
    recs.push('En matemática, la práctica diaria es clave. Intenta resolver al menos 10 ejercicios por sesión y revisa cada error con detalle.')
  }

  if (asignatura === 'lectora') {
    recs.push('Para mejorar tu comprensión lectora, practica leyendo textos de diferentes géneros y estilos cada día, identificando la idea principal y el propósito del autor.')
  }

  return recs
}
