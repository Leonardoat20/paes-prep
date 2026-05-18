import { motion } from 'framer-motion'
import { Moon, Sun, Volume2, VolumeX, Music, Bell, BellOff, Trash2, Info } from 'lucide-react'
import { useAppStore } from '@/context/AppStore'

export default function Settings() {
  const { config, setConfig, stats } = useAppStore()

  const Toggle = ({ on, onToggle, iconOn: IconOn, iconOff: IconOff, label, desc }: {
    on: boolean; onToggle: () => void;
    iconOn: React.ElementType; iconOff: React.ElementType;
    label: string; desc: string
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-[#2d2d4e] last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {on ? <IconOn size={18} className="text-primary-500" /> : <IconOff size={18} className="text-gray-400" />}
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${on ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${on ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  )

  const handleReset = () => {
    if (window.confirm('¿Borrar todos tus datos? Esta acción no se puede deshacer.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <main className="page-container max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold mb-6">Configuración</h1>

        {/* Nombre de la app */}
        <div className="card p-5 mb-4">
          <p className="font-semibold mb-3">Nombre de la Plataforma</p>
          <input
            className="input"
            value={config.nombreApp}
            onChange={e => setConfig({ nombreApp: e.target.value })}
            placeholder="Ej. PAES Prep"
          />
        </div>

        {/* Apariencia */}
        <div className="card p-5 mb-4">
          <p className="font-semibold mb-3">Apariencia</p>
          <div className="flex gap-3">
            {(['dark', 'light'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  setConfig({ tema: t })
                  document.documentElement.classList.toggle('dark', t === 'dark')
                }}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  config.tema === t
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-200 dark:border-[#2d2d4e]'
                }`}
              >
                {t === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                <span className="text-sm font-medium">{t === 'dark' ? 'Oscuro' : 'Claro'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio */}
        <div className="card p-5 mb-4">
          <p className="font-semibold mb-1">Audio</p>
          <Toggle
            on={config.sonido} onToggle={() => setConfig({ sonido: !config.sonido })}
            iconOn={Volume2} iconOff={VolumeX}
            label="Efectos de Sonido" desc="Sonidos al responder preguntas"
          />
          <Toggle
            on={config.musica} onToggle={() => setConfig({ musica: !config.musica })}
            iconOn={Music} iconOff={Music}
            label="Música Ambiental" desc="Música de fondo mientras estudias"
          />
        </div>

        {/* Notificaciones */}
        <div className="card p-5 mb-4">
          <p className="font-semibold mb-1">Notificaciones</p>
          <Toggle
            on={config.notificaciones} onToggle={() => setConfig({ notificaciones: !config.notificaciones })}
            iconOn={Bell} iconOff={BellOff}
            label="Recordatorios de Estudio" desc="Te recordamos practicar cada día"
          />
        </div>

        {/* Info */}
        <div className="card p-5 mb-4">
          <p className="font-semibold mb-3 flex items-center gap-2"><Info size={16} /> Sobre la App</p>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>Versión: 1.0.0</p>
            <p>Ensayos realizados: {stats.totalEnsayos}</p>
            <p>Preguntas practicadas: {stats.totalPreguntas}</p>
            <p className="text-xs mt-2">Las preguntas están basadas en los modelos oficiales PAES publicados por el DEMRE.</p>
          </div>
        </div>

        {/* Zona de peligro */}
        <div className="card p-5 border-red-200 dark:border-red-900 mb-10">
          <p className="font-semibold text-red-600 dark:text-red-400 mb-3">Zona de Peligro</p>
          <button onClick={handleReset} className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium hover:underline">
            <Trash2 size={16} /> Borrar todos mis datos
          </button>
        </div>
      </motion.div>
    </main>
  )
}
