const nav = [
  { id: 'dashboard', icon: '▦', label: 'Dashboard' },
  { id: 'recognize', icon: '◉', label: 'Recognize' },
  { id: 'register', icon: '+', label: 'Register' },
  { id: 'persons', icon: '◈', label: 'People' },
  { id: 'logs', icon: '≡', label: 'Logs' },
  { id: 'unknown', icon: '?', label: 'Unknown' },
  { id: 'users', icon: '⊕', label: 'Users' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
]

export default function Sidebar({ active, onNavigate, onLogout, theme, onThemeToggle }) {
  return (
    <aside style={{
      width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0,
    }}>
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#fff',
          }}>◉</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>FaceID</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              background: active === item.id ? 'var(--bg3)' : 'transparent',
              color: active === item.id ? 'var(--text)' : 'var(--text2)',
              fontWeight: active === item.id ? 500 : 400,
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onThemeToggle}
          style={{
            width: '100%', padding: '7px', borderRadius: 6, fontSize: 12,
            background: 'var(--bg3)', color: 'var(--text2)',
            border: '1px solid var(--border2)', cursor: 'pointer',
            marginBottom: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6,
          }}
        >
          {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
        </button>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
          <div style={{ fontWeight: 500, color: 'var(--text2)', marginBottom: 2 }}>Backend</div>
          FastAPI + face_recognition
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '7px', borderRadius: 6, fontSize: 12,
            background: 'rgba(239,68,68,0.1)', color: 'var(--red)',
            border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
          }}
        >Sign out</button>
      </div>
    </aside>
  )
}