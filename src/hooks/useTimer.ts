import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTimerOptions {
  initialSeconds: number
  onExpire?: () => void
  autoStart?: boolean
}

export function useTimer({ initialSeconds, onExpire, autoStart = false }: UseTimerOptions) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const [running, setRunning] = useState(autoStart)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (!running) { clear(); return }

    startTimeRef.current = Date.now() - elapsed * 1000
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1
        setElapsed(e => e + 1)
        if (next <= 0) {
          clear()
          setRunning(false)
          onExpire?.()
          return 0
        }
        return next
      })
    }, 1000)

    return clear
  }, [running, clear, onExpire])

  const start  = useCallback(() => setRunning(true), [])
  const pause  = useCallback(() => setRunning(false), [])
  const resume = useCallback(() => setRunning(true), [])
  const reset  = useCallback(() => {
    clear()
    setRunning(false)
    setRemaining(initialSeconds)
    setElapsed(0)
  }, [initialSeconds, clear])

  const percentLeft = Math.round((remaining / initialSeconds) * 100)
  const isUrgent    = remaining <= 300 && remaining > 0  // últimos 5 min
  const isCritical  = remaining <= 60 && remaining > 0   // último minuto

  const formatted = formatTime(remaining)

  return { remaining, elapsed, running, percentLeft, isUrgent, isCritical, formatted, start, pause, resume, reset }
}

// Cronómetro ascendente (mide tiempo por pregunta)
export function useStopwatch() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const lap = useCallback(() => {
    const current = seconds
    setSeconds(0)
    return current
  }, [seconds])

  const pause  = useCallback(() => setRunning(false), [])
  const resume = useCallback(() => setRunning(true), [])

  return { seconds, running, lap, pause, resume }
}

export function formatTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
