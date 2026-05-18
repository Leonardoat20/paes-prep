import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Save, Target } from 'lucide-react'
import { useAppStore } from '@/context/AppStore'

const AVATARS = ['🎓', '🦁', '🐯', '🦊', '🐼', '🦅', '🌟', '🔥', '⚡', '🏆']
const REGIONES = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes']

export default function Profile() {
  const { profile, stats, setProfile, getNivel, getXP } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...profile })
  const nivel = getNivel()
  const xp = getXP()

  const save = () => {
    setProfile(form)
    setEditing(false)
  }

  return (
    <main className="page-container max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold">Mi Perfil</h1>
          <button
            onClick={() => editing ? save() : setEditing(true)}
            className={editing ? 'btn-primary flex items-center gap-2' : 'btn-secondary flex items-center gap-2'}
          >
            {editing ? <><Save size={16} /> Guardar</> : <><Edit2 size={16} /> Editar</>}
          </button>
        </div>

        {/* Avatar y nombre */}
        <div className="card p-6 flex flex-col items-center text-center mb-5">
          {editing ? (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {AVATARS.map(av => (
                <button
                  key={av}
                  onClick={() => setForm(f => ({ ...f, avatar: av }))}
                  className={`text-2xl w-12 h-12 rounded-xl transition-all ${form.avatar === av ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  {av}
                </button>
              ))}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-4xl shadow-xl mb-3">
              {profile.avatar}
            </div>
          )}

          {editing ? (
            <div className="flex gap-2 w-full">
              <input
                className="input flex-1"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre"
              />
              <input
                className="input flex-1"
                value={form.apellido}
                onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))}
                placeholder="Apellido"
              />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold">{profile.nombre} {profile.apellido}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{nivel}</p>
            </>
          )}

          {!editing && (
            <div className="flex gap-4 mt-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-primary-500">{stats.totalEnsayos}</p>
                <p className="text-gray-500 text-xs">Ensayos</p>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="font-bold text-yellow-500">{stats.puntajeMaximo}</p>
                <p className="text-gray-500 text-xs">Mejor puntaje</p>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="font-bold text-green-500">{xp}</p>
                <p className="text-gray-500 text-xs">XP total</p>
              </div>
            </div>
          )}
        </div>

        {/* Datos del estudiante */}
        <div className="card p-5 mb-5">
          <p className="font-semibold mb-4">Información del Estudiante</p>
          <div className="space-y-4">
            {/* Meta de puntaje */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                <Target size={14} /> Meta de Puntaje PAES
              </label>
              {editing ? (
                <div>
                  <input
                    type="range" min={400} max={1000} step={10}
                    value={form.meta}
                    onChange={e => setForm(f => ({ ...f, meta: +e.target.value }))}
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>400</span>
                    <span className="font-bold text-primary-500">{form.meta} pts</span>
                    <span>1000</span>
                  </div>
                </div>
              ) : (
                <p className="font-bold text-lg text-primary-500">{profile.meta} puntos</p>
              )}
            </div>

            {/* Región */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Región</label>
              {editing ? (
                <select
                  className="input"
                  value={form.region}
                  onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                >
                  {REGIONES.map(r => <option key={r}>{r}</option>)}
                </select>
              ) : (
                <p className="font-medium">{profile.region}</p>
              )}
            </div>

            {/* Colegio */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Colegio</label>
              {editing ? (
                <input
                  className="input"
                  value={form.colegio}
                  onChange={e => setForm(f => ({ ...f, colegio: e.target.value }))}
                  placeholder="Nombre de tu colegio"
                />
              ) : (
                <p className="font-medium">{profile.colegio || 'No especificado'}</p>
              )}
            </div>

            {/* Año de egreso */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Año de Egreso</label>
              {editing ? (
                <input
                  type="number" min={2024} max={2030}
                  className="input"
                  value={form.anioEgreso}
                  onChange={e => setForm(f => ({ ...f, anioEgreso: +e.target.value }))}
                />
              ) : (
                <p className="font-medium">{profile.anioEgreso}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
