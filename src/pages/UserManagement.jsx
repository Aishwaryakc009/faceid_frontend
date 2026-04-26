import { useState, useEffect } from 'react'
import { apiGet, apiDelete } from '../utils/api'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import Badge from '../components/Badge'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const toast = useToast()
  const confirm = useConfirm()

  const load = () => {
    setLoading(true)
    apiGet('/users').then(d => { setUsers(d.users); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const createUser = async () => {
    if (!username.trim() || !password.trim()) {
      toast('Username and password are required.', 'error')
      return
    }
    setCreating(true)
    try {
      const fd = new FormData()
      fd.append('username', username.trim())
      fd.append('password', password.trim())
      fd.append('role', role)
      const res = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      })
      if (!res.ok) throw new Error((await res.json()).detail)
      toast('User created successfully!', 'success')
      setUsername('')
      setPassword('')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
    setCreating(false)
  }

  const removeUser = async (id, name) => {
    const ok = await confirm(`Delete user "${name}"?`)
    if (!ok) return
    setDeleting(id)
    try {
      await apiDelete(`/users/${id}`)
      toast('User deleted.', 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
    setDeleting(null)
  }

  return (
    <div style={{ maxWidth: 600, animation: 'fadeIn 0.2s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>User management</h1>
        <p style={{ color: 'var(--text2)' }}>Manage admin accounts</p>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Create new user</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. john" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <button
          onClick={createUser}
          disabled={creating}
          style={{
            padding: '9px 20px', borderRadius: 8, background: 'var(--accent)',
            color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer', fontSize: 13,
          }}
        >{creating ? 'Creating...' : 'Create user'}</button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </div>
        {loading && <div style={{ padding: 20, color: 'var(--text2)' }}>Loading...</div>}
        {users.map((u, i) => (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
            borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0,
            }}>{u.username[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: 3 }}>{u.username}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                Created {new Date(u.created_at).toLocaleDateString()}
              </div>
            </div>
            <Badge color={u.role === 'superadmin' ? 'accent' : 'gray'}>{u.role}</Badge>
            {u.username !== 'admin' && (
              <button
                onClick={() => removeUser(u.id, u.username)}
                disabled={deleting === u.id}
                style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 12,
                  background: 'rgba(239,68,68,0.1)', color: 'var(--red)',
                  border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                }}
              >{deleting === u.id ? '...' : 'Delete'}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}