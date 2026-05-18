import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/common/Navbar'
import Home         from '@/pages/Home'
import Subjects     from '@/pages/Subjects'
import Quiz         from '@/pages/Quiz'
import Results      from '@/pages/Results'
import Stats        from '@/pages/Stats'
import Profile      from '@/pages/Profile'
import Achievements from '@/pages/Achievements'
import Settings     from '@/pages/Settings'
import { useAppStore } from '@/context/AppStore'

// Rutas donde NO se muestra la navbar
const QUIZ_ROUTES = ['/quiz']

function AppRoutes() {
  const { pathname } = useLocation()
  const hideNav = QUIZ_ROUTES.some(r => pathname.startsWith(r))

  return (
    <>
      {!hideNav && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={{ pathname }} key={pathname}>
          <Route path="/"                element={<Home />} />
          <Route path="/subjects"        element={<Subjects />} />
          <Route path="/quiz/:subject"   element={<Quiz />} />
          <Route path="/results/:id"     element={<Results />} />
          <Route path="/stats"           element={<Stats />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/achievements"    element={<Achievements />} />
          <Route path="/settings"        element={<Settings />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

function ThemeSync() {
  const tema = useAppStore(s => s.config.tema)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark')
  }, [tema])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <AppRoutes />
    </BrowserRouter>
  )
}
