import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface ScoreRecord {
  id?: number
  nombre: string
  colegio: string
  asignatura: string
  puntaje_paes: number
  nota: number
  correctas: number
  total: number
  porcentaje: number
  fecha: string
  created_at?: string
}

// Subir puntaje al ranking
export async function submitScore(score: ScoreRecord): Promise<boolean> {
  if (!supabaseUrl || !supabaseKey) return false
  try {
    const { error } = await supabase.from('scores').insert([score])
    return !error
  } catch {
    return false
  }
}

// Obtener ranking público (top 50)
export async function getRanking(): Promise<ScoreRecord[]> {
  if (!supabaseUrl || !supabaseKey) return []
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('nombre, colegio, asignatura, puntaje_paes, nota, correctas, total, porcentaje, fecha')
      .order('puntaje_paes', { ascending: false })
      .limit(50)
    return error ? [] : (data ?? [])
  } catch {
    return []
  }
}

// Obtener todos los puntajes para el admin
export async function getAllScores(): Promise<ScoreRecord[]> {
  if (!supabaseUrl || !supabaseKey) return []
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .order('created_at', { ascending: false })
    return error ? [] : (data ?? [])
  } catch {
    return []
  }
}
