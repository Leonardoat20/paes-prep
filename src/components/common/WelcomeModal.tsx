import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, School, User, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/context/AppStore'

export default function WelcomeModal() {
  const { profile, setProfile, setConfig } = useAppStore()
  const [nombre, setNombre] = useState('')
  const [colegio, setColegio] = useState('')
  const [error, setError] = useState('')

  // Solo mostrar si el nombre sigue siendo el default
  const show = profile.nombre === 'Estudiante' && profile.colegio === ''

  const handleGuardar = () => {
    if (!nombre.trim()) { setError('Por favor ingresa tu nombre'); return }
    setProfile({ nombre: nombre.trim(), colegio: colegio.trim() })
    setConfig({ nombreApp: 'PAES Prep' })
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-full max-w-sm bg-white dark:bg-[#1a1a2e] rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-5xl mx-auto mb-3 shadow-lg">
                🎓
              </div>
              <h1 className="text-2xl font-bold text-white">¡Bienvenido!</h1>
              <p className="text-white/80 text-sm mt-1">Tu plataforma de preparación PAES</p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Cuéntanos quién eres para personalizar tu experiencia
              </p>

              {/* Nombre */}
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5">
                  <User size={14} /> Tu nombre
                </label>
                <input
                  className="input w-full"
                  placeholder="Ej: María González"
                  value={nombre}
                  onChange={e => { setNombre(e.target.value); setError('') }}
                  autoFocus
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              {/* Colegio */}
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-1.5">
                  <School size={14} /> Tu colegio <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  className="input w-full"
                  placeholder="Ej: Liceo Arturo Alessandri"
                  value={colegio}
                  onChange={e => setColegio(e.target.value)}
                />
              </div>

              {/* Botón */}
              <button
                onClick={handleGuardar}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-2"
              >
                Comenzar a estudiar
                <ChevronRight size={18} />
              </button>

              <p className="text-xs text-center text-gray-400 dark:text-gray-600">
                ✦ Profe Leo · LAAT ✦ — Puedes editar tu perfil en cualquier momento
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
