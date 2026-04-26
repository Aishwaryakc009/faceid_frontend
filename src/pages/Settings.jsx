import { useState, useEffect } from 'react'
import { apiGet } from '../utils/api'
import { useToast } from '../components/Toast'

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    apiGet('/settings').then(setSettings).catch(() => {})
  }, [])

  const updateSetting = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('key', key)
      fd.append('value', value)
      await fetch('http://localhost:8000/settings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      })
      toast('Setting saved.', 'success')
    } catch {
      toast('Failed to save setting.', 'error')
    }
    setSaving(false)
  }

  const Toggle = ({ settingKey }) => {
    const enabled = settings?.[settingKey] === 'true'
    return (
      <button onClick={() => updateSetting(settingKey, enabled ? 'false' : 'true')} style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: enabled ? 'var(--accent)' : 'var(--bg3)', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3,
          left: enabled ? 23 : 3, transition: 'left 0.2s',
        }} />
      </button>
    )
  }

  const days = [
    { value: '1', label: 'Mon' },
    { value: '2', label: 'Tue' },
    { value: '3', label: 'Wed' },
    { value: '4', label: 'Thu' },
    { value: '5', label: 'Fri' },
    { value: '6', label: 'Sat' },
    { value: '7', label: 'Sun' },
  ]

  const toggleDay = (dayValue) => {
    const current = (settings?.access_days || '1,2,3,4,5').split(',')
    const updated = current.includes(dayValue)
      ? current.filter(d => d !== dayValue)
      : [...current, dayValue].sort()
    updateSetting('access_days', updated.join(','))
  }

  if (!settings) return <div style={{ color: 'var(--text2)' }}>Loading...</div>

  return (
    <div style={{ maxWidth: 560, animation: 'fadeIn 0.2s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text2)' }}>Configure your FaceID system</p>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Email alerts
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Alert on unknown faces</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Send email when unrecognized face detected</div>
          </div>
          <Toggle settingKey="alerts_enabled" />
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Time-based access control
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Enable access control</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Only allow recognition during set hours</div>
          </div>
          <Toggle settingKey="access_control_enabled" />
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 500, marginBottom: 12 }}>Allowed hours (UTC)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>From</label>
              <select
                value={settings.access_start_hour}
                onChange={e => updateSetting('access_start_hour', e.target.value)}
                style={{ width: 100 }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 16, color: 'var(--text3)' }}>→</div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>To</label>
              <select
                value={settings.access_end_hour}
                onChange={e => updateSetting('access_end_hour', e.target.value)}
                style={{ width: 100 }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontWeight: 500, marginBottom: 12 }}>Allowed days</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {days.map(d => {
              const active = (settings.access_days || '').split(',').includes(d.value)
              return (
                <button key={d.value} onClick={() => toggleDay(d.value)} style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  background: active ? 'var(--accent)' : 'var(--bg3)',
                  color: active ? '#fff' : 'var(--text2)',
                  border: '1px solid transparent', fontWeight: 500,
                }}>{d.label}</button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 18px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text2)' }}>
        <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }}>How access control works</strong>
        When enabled, recognition requests outside the allowed hours or days will be rejected with a 403 error. Times are in UTC. {saving && '⟳ Saving...'}
      </div>
    </div>
  )
}