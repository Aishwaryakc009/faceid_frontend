import { useState, useEffect } from 'react'
import { apiGet, apiDelete } from '../utils/api'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import { CardSkeleton } from '../components/Skeleton'
import Badge from '../components/Badge'

export default function Persons() {
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [photos, setPhotos] = useState({})
  const [history, setHistory] = useState({})
  const [activeTab, setActiveTab] = useState({})
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')
  const toast = useToast()
  const confirm = useConfirm()

  const load = () => {
    setLoading(true)
    apiGet('/persons').then(d => { setPersons(d.persons); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const loadPhotos = async (personId) => {
    if (photos[personId]) return
    try {
      const data = await apiGet(`/persons/${personId}/photos`)
      setPhotos(prev => ({ ...prev, [personId]: data.photos }))
    } catch {}
  }

  const loadHistory = async (personId) => {
    if (history[personId]) return
    try {
      const data = await apiGet(`/persons/${personId}/history`)
      setHistory(prev => ({ ...prev, [personId]: data }))
    } catch {}
  }

  const toggleExpand = (personId) => {
    if (expanded === personId) {
      setExpanded(null)
    } else {
      setExpanded(personId)
      loadPhotos(personId)
      loadHistory(personId)
      setActiveTab(prev => ({ ...prev, [personId]: 'photos' }))
    }
  }

  const removePerson = async (id, name) => {
    const ok = await confirm(`This will permanently remove "${name}" and all their photos from the database.`)
    if (!ok) return
    setDeleting(id)
    try {
      await apiDelete(`/persons/${id}`)
      toast(`"${name}" removed successfully.`, 'success')
      load()
    } catch {
      toast('Failed to remove person.', 'error')
    }
    setDeleting(null)
  }

  const removePhoto = async (personId, encodingId) => {
    const ok = await confirm('This photo will be permanently deleted.')
    if (!ok) return
    try {
      await apiDelete(`/encodings/${encodingId}`)
      setPhotos(prev => ({ ...prev, [personId]: prev[personId].filter(p => p.id !== encodingId) }))
      toast('Photo removed.', 'success')
    } catch {
      toast('Failed to remove photo.', 'error')
    }
  }

  const filtered = persons.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.label || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>People</h1>
        <p style={{ color: 'var(--text2)' }}>{persons.length} registered {persons.length === 1 ? 'person' : 'people'}</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or label..."
          style={{ maxWidth: 340 }}
        />
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: 40, background: 'var(--bg2)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text2)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>◈</div>
          {search ? `No results for "${search}"` : 'No people registered yet.'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(p => (
          <div key={p.id} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', overflow: 'hidden', transition: 'border-color 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
              {p.photo
                ? <img src={`data:image/jpeg;base64,${p.photo}`} alt={p.name}
                    style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{
                    width: 48, height: 48, borderRadius: 10, background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 600, color: '#fff', flexShrink: 0,
                  }}>{p.name[0].toUpperCase()}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {p.label && <Badge color="accent">{p.label}</Badge>}
                  <Badge color="gray">{new Date(p.created_at).toLocaleDateString()}</Badge>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => toggleExpand(p.id)} style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  background: expanded === p.id ? 'var(--accent)' : 'var(--bg3)',
                  color: expanded === p.id ? '#fff' : 'var(--text2)',
                  border: '1px solid transparent', fontWeight: 500,
                }}>{expanded === p.id ? 'Hide' : 'Details'}</button>
                <button onClick={() => removePerson(p.id, p.name)} disabled={deleting === p.id} style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  background: 'rgba(239,68,68,0.1)', color: 'var(--red)',
                  border: '1px solid rgba(239,68,68,0.2)', fontWeight: 500,
                }}>{deleting === p.id ? 'Removing...' : 'Remove'}</button>
              </div>
            </div>

            {expanded === p.id && (
              <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                  {['photos', 'history'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(prev => ({ ...prev, [p.id]: tab }))} style={{
                      padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      background: 'transparent', border: 'none',
                      borderBottom: activeTab[p.id] === tab ? '2px solid var(--accent)' : '2px solid transparent',
                      color: activeTab[p.id] === tab ? 'var(--accent2)' : 'var(--text2)',
                      textTransform: 'capitalize',
                    }}>{tab}</button>
                  ))}
                </div>

                {activeTab[p.id] === 'photos' && (
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {photos[p.id] ? `${photos[p.id].length} registered photo${photos[p.id].length !== 1 ? 's' : ''}` : 'Loading...'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
                      {photos[p.id]?.map((photo, i) => (
                        <div key={photo.id} style={{ position: 'relative' }}>
                          {photo.photo
                            ? <img src={`data:image/jpeg;base64,${photo.photo}`} alt={`Photo ${i + 1}`}
                                style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8 }} />
                            : <div style={{ width: '100%', height: 90, background: 'var(--bg3)', borderRadius: 8 }} />
                          }
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4, textAlign: 'center' }}>
                            {new Date(photo.created_at).toLocaleDateString()}
                          </div>
                          <button onClick={() => removePhoto(p.id, photo.id)} style={{
                            position: 'absolute', top: 4, right: 4, width: 20, height: 20,
                            borderRadius: '50%', background: 'rgba(239,68,68,0.9)',
                            color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', border: 'none', cursor: 'pointer',
                          }}>×</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, fontSize: 12, color: 'var(--text2)' }}>
                      Tip: Add 3–5 photos from different angles for best accuracy.
                    </div>
                  </div>
                )}

                {activeTab[p.id] === 'history' && (
                  <div style={{ padding: 16 }}>
                    {!history[p.id] ? (
                      <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading...</div>
                    ) : (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 16 }}>
                          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px' }}>
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total scans</div>
                            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--accent2)' }}>{history[p.id].total_recognitions}</div>
                          </div>
                          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px' }}>
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg confidence</div>
                            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--green)' }}>{history[p.id].avg_confidence}%</div>
                          </div>
                          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px' }}>
                            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last seen</div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
                              {history[p.id].last_seen ? new Date(history[p.id].last_seen).toLocaleDateString() : 'Never'}
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent activity</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
                          {history[p.id].logs.length === 0 && (
                            <div style={{ color: 'var(--text3)', fontSize: 13 }}>No recognition events yet.</div>
                          )}
                          {history[p.id].logs.map((log, i) => (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                              background: 'var(--bg3)', borderRadius: 8, fontSize: 12,
                            }}>
                              <div style={{ flex: 1, color: 'var(--text2)' }}>{new Date(log.timestamp).toLocaleString()}</div>
                              <Badge color={log.source === 'webcam' ? 'accent' : 'gray'}>{log.source}</Badge>
                              <Badge color={log.confidence > 80 ? 'green' : log.confidence > 60 ? 'amber' : 'gray'}>{log.confidence}%</Badge>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}