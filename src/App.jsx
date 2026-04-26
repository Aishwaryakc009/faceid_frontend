import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import Recognize from './pages/Recognize'
import Persons from './pages/Persons'
import Logs from './pages/Logs'
import Login from './pages/Login'
import Settings from './pages/Settings'
import { useTheme } from './hooks/useTheme'
import UnknownFaces from './pages/UnknownFaces'
import UserManagement from './pages/UserManagement'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  const handleLogin = (t) => setToken(t)

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  const navigate = (p) => {
    setPage(p)
    setSidebarOpen(false)
  }

  if (!token) return <Login onLogin={handleLogin} />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
        />
      )}

      <div style={{
        position: isMobile ? 'fixed' : 'relative',
        left: isMobile ? (sidebarOpen ? 0 : -220) : 0,
        top: 0, bottom: 0, zIndex: 50,
        transition: 'left 0.25s ease', flexShrink: 0,
      }}>
        <Sidebar active={page} onNavigate={navigate} onLogout={handleLogout} theme={theme} onThemeToggle={toggle} />
      </div>

      <main style={{ flex: 1, padding: isMobile ? '16px' : '32px', overflowY: 'auto', minWidth: 0 }}>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
              padding: '8px 14px', borderRadius: 8, background: 'var(--bg2)',
              border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14,
            }}
          >☰ Menu</button>
        )}
        {page === 'dashboard' && <Dashboard />}
        {page === 'register' && <Register />}
        {page === 'recognize' && <Recognize />}
        {page === 'persons' && <Persons />}
        {page === 'logs' && <Logs />}
        {page === 'settings' && <Settings />}
        {page === 'unknown' && <UnknownFaces />}
        {page === 'users' && <UserManagement />}
      </main>
    </div>
  )
}