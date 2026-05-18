import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BarChart2, User, Trophy, Settings, BookOpen } from 'lucide-react'
import { useAppStore } from '@/context/AppStore'
import clsx from 'clsx'

const links = [
  { to: '/',            icon: Home,     label: 'Inicio'    },
  { to: '/subjects',   icon: BookOpen,  label: 'Ensayar'   },
  { to: '/stats',      icon: BarChart2, label: 'Estadísticas' },
  { to: '/achievements', icon: Trophy,  label: 'Logros'    },
  { to: '/profile',    icon: User,      label: 'Perfil'    },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const config = useAppStore(s => s.config)

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-5
                         bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-md border-b
                         border-gray-200 dark:border-[#2d2d4e]">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="font-display font-bold text-lg gradient-text">{config.nombreApp}</span>
        </Link>
        <Link to="/settings" className="btn-ghost p-2 rounded-xl">
          <Settings size={20} />
        </Link>
      </header>

      {/* Firma digital */}
      <div className="fixed bottom-16 inset-x-0 z-40 flex justify-center pointer-events-none">
        <span className="text-[10px] text-gray-400 dark:text-gray-600 tracking-widest font-medium px-3 py-0.5">
          ✦ Profe Leo · LAAT ✦
        </span>
      </div>

      {/* Bottom navigation (mobile-first) */}
      <nav className="fixed bottom-0 inset-x-0 z-50 h-16 flex items-center justify-around
                      bg-white/90 dark:bg-[#0f0f1a]/90 backdrop-blur-md border-t
                      border-gray-200 dark:border-[#2d2d4e] px-2">
        {links.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to))
          return (
            <Link key={to} to={to} className="flex flex-col items-center gap-0.5 relative px-3 py-1">
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 inset-x-2 h-1 rounded-full bg-primary-500"
                />
              )}
              <Icon
                size={22}
                className={clsx(
                  'transition-colors',
                  active ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'
                )}
              />
              <span className={clsx(
                'text-[10px] font-medium transition-colors',
                active ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
