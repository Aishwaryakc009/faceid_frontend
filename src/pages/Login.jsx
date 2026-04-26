import { useState } from 'react'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!username || !password) { setError('Please enter username and password.'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('username', username)
      fd.append('password', password)
      fd.append('grant_type', 'password')
      const res = await fetch('http://localhost:8000/login', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Incorrect username or password.')
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      onLogin(data.access_token)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: '#fff', margin: '0 auto 16px',
          }}>◉</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>FaceID</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Sign in to your account</p>
        </div>

        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 24,
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="admin"
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              color: 'var(--red)', fontSize: 13, marginBottom: 14,
              padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6,
            }}>{error}</div>
          )}

          <button
            onClick={submit}
            style={{
              width: '100%', padding: '10px', borderRadius: 8,
              background: 'var(--accent)', color: '#fff',
              border: 'none', fontWeight: 500, fontSize: 14, cursor: 'pointer',
            }}
          >{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
          Default: admin / admin123
        </p>
      </div>
    </div>
  )
}