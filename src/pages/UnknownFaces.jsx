import { useState, useEffect } from 'react'
import { apiGet, apiDelete } from '../utils/api'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import Badge from '../components/Badge'

export default function UnknownFaces() {
  const [faces, setFaces] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const confirm = useConfirm()

  const load = () => {
    setLoading(true)
    apiGet('/unknown-faces?limit=100')
      .then(d => { setFaces(d.faces); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    const ok = await confirm('Delete this unknown face photo?')
    if (!ok) return
    try {
      await apiDelete(`/unknown-faces/${id}`)
      setFaces(prev => prev.filter(f => f.id !== id))
      toast('Photo deleted.', 'success')
    } catch {
      toast('Failed to delete.', 'error')
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Unknown faces</h1>
        <p style={{ color: 'var(--text2)' }}>
          {faces.length} unrecognized {faces.length === 1 ? 'visitor' : 'visitors'} detected
        </p>
      </div>

      {loading && (
        <div style={{ color: 'var(--text2)' }}>Loading...</div>
      )}

      {!loading && faces.length === 0 && (
        <div style={{
          textAlign: 'center', padding: 40, background: 'var(--bg2)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text2)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>◉</div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>No unknown faces yet</div>
          <div style={{ fontSize: 13 }}>Unknown faces will appear here when detected during recognition.</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {faces.map(face => (
          <div key={face.id} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', overflow: 'hidden',
          }}>
            {face.photo
              ? <img src={`data:image/jpeg;base64,${face.photo}`} alt="Unknown"
                  style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              : <div style={{
                  width: '100%', height: 160, background: 'var(--bg3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, color: 'var(--text3)',
                }}>?</div>
            }
            <div style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Badge color="red">Unknown</Badge>
                <Badge color={face.source === 'webcam' ? 'accent' : 'gray'}>{face.source}</Badge>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
                {new Date(face.timestamp).toLocaleString()}
              </div>
              <button
                onClick={() => remove(face.id)}
                style={{
                  width: '100%', padding: '6px', borderRadius: 6, fontSize: 12,
                  background: 'rgba(239,68,68,0.1)', color: 'var(--red)',
                  border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                }}
              >Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}