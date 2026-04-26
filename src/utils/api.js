const BASE = 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() })
  if (res.status === 401) { localStorage.removeItem('token'); window.location.reload() }
  if (!res.ok) throw new Error((await res.json()).detail || 'Request failed')
  return res.json()
}

export async function apiPost(path, formData) {
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers: authHeaders(), body: formData })
  if (res.status === 401) { localStorage.removeItem('token'); window.location.reload() }
  if (!res.ok) throw new Error((await res.json()).detail || 'Request failed')
  return res.json()
}

export async function apiDelete(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', headers: authHeaders() })
  if (res.status === 401) { localStorage.removeItem('token'); window.location.reload() }
  if (!res.ok) throw new Error((await res.json()).detail || 'Request failed')
  return res.json()
}

export function fileToFormData(file, fields = {}) {
  const fd = new FormData()
  fd.append('file', file)
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v))
  return fd
}