import { useState, useEffect } from 'react'
import { apiGet } from '../utils/api'
import { RowSkeleton } from '../components/Skeleton'
import Badge from '../components/Badge'
import { useToast } from '../components/Toast'
export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    apiGet('/logs?limit=100').then(d => { setLogs(d.logs); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = logs
    .filter(l => {
      const matchSearch = (l.person_name || '').toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'all' || l.source === filter
      return matchSearch && matchFilter
    })
    .sort((a, b) => sort === 'newest'
      ? new Date(b.timestamp) - new Date(a.timestamp)
      : sort === 'oldest'
      ? new Date(a.timestamp) - new Date(b.timestamp)
      : b.confidence - a.confidence
    )
  const toast = useToast()
  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Confidence', 'Source', 'Timestamp']
    const rows = filtered.map(l => [
      l.id,
      l.person_name || 'Unknown',
      l.confidence || 0,
      l.source,
      new Date(l.timestamp).toLocaleString()
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `faceid-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('Logs exported successfully!', 'success')
  }

  const confidenceColor = (c) => c > 80 ? 'green' : c > 60 ? 'amber' : 'gray'

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
  <div>
    <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Recognition logs</h1>
    <p style={{ color: 'var(--text2)' }}>{logs.length} total events</p>
  </div>
  <button
    onClick={exportCSV}
    disabled={filtered.length === 0}
    style={{
      padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
      background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
      opacity: filtered.length === 0 ? 0.5 : 1,
    }}
  >Export CSV</button>
</div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          style={{ flex: 1, minWidth: 180, maxWidth: 280 }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 130 }}>
          <option value="all">All sources</option>
          <option value="upload">Upload</option>
          <option value="webcam">Webcam</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 150 }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="confidence">By confidence</option>
        </select>
      </div>

      {loading && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {[1,2,3,4,5].map(i => <RowSkeleton key={i} />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: 40, background: 'var(--bg2)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text2)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>≡</div>
          {search ? `No results for "${search}"` : 'No recognition events yet.'}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {filtered.map((log, i) => (
            <div key={log.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0,
              }}>{log.person_name?.[0]?.toUpperCase() || '?'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{log.person_name || 'Unknown'}</div>
              </div>
              <Badge color={log.source === 'webcam' ? 'accent' : 'gray'}>{log.source}</Badge>
              {log.confidence > 0 && (
                <Badge color={confidenceColor(log.confidence)}>{log.confidence}%</Badge>
              )}
              <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', minWidth: 80, textAlign: 'right' }}>
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}