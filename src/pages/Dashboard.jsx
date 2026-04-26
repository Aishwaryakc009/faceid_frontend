import { useState, useEffect } from 'react'
import { apiGet } from '../utils/api'
import { StatSkeleton } from '../components/Skeleton'
import ConfidenceChart from '../components/ConfidenceChart'

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 24px',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
        <span style={{ fontSize: 18, opacity: 0.6 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, color: color || 'var(--text)' }}>{value}</div>
    </div>
  )
}

function ConfidenceBar({ value }) {
  const color = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 12, color, minWidth: 36, fontWeight: 500 }}>{value}%</span>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [countdown, setCountdown] = useState(30)
  const [chartData, setChartData] = useState(null)
  const [chartDays, setChartDays] = useState(7)

  const fetchStats = () => {
    apiGet('/stats')
      .then(data => {
        setStats(data)
        setLastUpdated(new Date())
        setCountdown(30)
      })
      .catch(e => setError(e.message))
    apiGet(`/stats/confidence-chart?days=${chartDays}`)
      .then(setChartData)
      .catch(() => {})
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => c > 0 ? c - 1 : 0)
    }, 1000)
    return () => clearInterval(timer)
  }, [lastUpdated])

  useEffect(() => {
    apiGet(`/stats/confidence-chart?days=${chartDays}`)
      .then(setChartData)
      .catch(() => {})
  }, [chartDays])

  if (error) return (
    <div style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)', color: 'var(--red)' }}>
      Failed to load stats: {error}
    </div>
  )

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--text2)' }}>Overview of your facial recognition system</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastUpdated && (
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              Updated {lastUpdated.toLocaleTimeString()} · refreshes in {countdown}s
            </span>
          )}
          <button
            onClick={fetchStats}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: 'var(--bg2)', border: '1px solid var(--border2)',
              color: 'var(--text2)', cursor: 'pointer',
            }}
          >Refresh</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
        {!stats ? (
          [1,2,3,4].map(i => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Registered" value={stats.total_persons} color="var(--accent2)" icon="◈" />
            <StatCard label="Total scans" value={stats.total_recognitions} icon="◉" />
            <StatCard label="Today" value={stats.today_recognitions} color="var(--green)" icon="▦" />
            <StatCard label="Avg confidence" value={`${stats.avg_confidence}%`} color="var(--amber)" icon="≡" />
          </>
        )}
      </div>

      {stats && stats.top_persons.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 18, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Most recognized</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.top_persons.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0,
                }}>{p.name[0].toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 13 }}>{p.name}</div>
                  <ConfidenceBar value={Math.round((p.count / stats.total_recognitions) * 100)} />
                </div>
                <div style={{
                  fontSize: 12, color: 'var(--text3)', minWidth: 32,
                  textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                }}>{p.count}x</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && stats.total_persons === 0 && (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '40px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.4 }}>◉</div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>No people registered yet</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Go to Register to add the first face to your system.</div>
        </div>
      )}

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Confidence over time
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {[7, 14, 30].map(d => (
              <button key={d} onClick={() => setChartDays(d)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                background: chartDays === d ? 'var(--accent)' : 'var(--bg3)',
                color: chartDays === d ? '#fff' : 'var(--text2)',
                border: '1px solid transparent', fontWeight: 500,
              }}>{d}d</button>
            ))}
          </div>
        </div>
        {chartData && chartData.labels.length > 0
          ? <ConfidenceChart labels={chartData.labels} confidence={chartData.confidence} counts={chartData.counts} />
          : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>
              No data yet — start recognizing faces to see the chart.
            </div>
        }
      </div>
    </div>
  )
}