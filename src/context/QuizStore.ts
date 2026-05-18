import { create } from 'zustand'
import type { Question, QuizSession, SubjectId } from '@/types'
import { v4 as uuid } from 'uuid'

interface QuizState {
  session: QuizSession | null
  currentIndex: number
  showExplanation: boolean
  isFinished: boolean

  startSession: (asignatura: SubjectId, nombre: string, preguntas: Question[], modo: QuizSession['modoEnsayo']) => void
  answer: (questionId: number, respuesta: string, tiempoUsado: number) => void
  next: () => void
  prev: () => void
  skip: () => void
  toggleExplanation: () => void
  finishSession: () => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
  session: null,
  currentIndex: 0,
  showExplanation: false,
  isFinished: false,

  startSession: (asignatura, nombreAsignatura, preguntas, modoEnsayo) => {
    set({
      session: {
        id: uuid(),
        asignatura,
        nombreAsignatura,
        fecha: new Date().toISOString(),
        preguntas,
        respuestas: {},
        tiempoTotal: 0,
        tiempoPorPregunta: {},
        completado: false,
        modoEnsayo,
      },
      currentIndex: 0,
      showExplanation: false,
      isFinished: false,
    })
  },

  answer: (questionId, respuesta, tiempoUsado) => {
    const { session } = get()
    if (!session) return
    set({
      session: {
        ...session,
        respuestas: { ...session.respuestas, [questionId]: respuesta },
        tiempoPorPregunta: { ...session.tiempoPorPregunta, [questionId]: tiempoUsado },
      },
    })
  },

  next: () => {
    const { currentIndex, session } = get()
    if (!session) return
    if (currentIndex < session.preguntas.length - 1) {
      set({ currentIndex: currentIndex + 1, showExplanation: false })
    } else {
      get().finishSession()
    }
  },

  prev: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1, showExplanation: false })
  },

  skip: () => get().next(),

  toggleExplanation: () => set((s) => ({ showExplanation: !s.showExplanation })),

  finishSession: () => {
    const { session } = get()
    if (!session) return
    const tiempoTotal = Object.values(session.tiempoPorPregunta).reduce((a, b) => a + b, 0)
    set({
      session: { ...session, completado: true, tiempoTotal },
      isFinished: true,
    })
  },

  reset: () => set({ session: null, currentIndex: 0, showExplanation: false, isFinished: false }),
}))
