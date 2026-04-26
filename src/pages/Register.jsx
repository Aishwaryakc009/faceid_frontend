import { useState, useRef } from 'react'
import { apiPost, fileToFormData } from '../utils/api'
import { useToast } from '../components/Toast'
import { checkImageQuality } from '../utils/imageQuality'

export default function Register() {
  const [name, setName] = useState('')
  const [label, setLabel] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('upload')
  const [quality, setQuality] = useState(null)
  const [tab, setTab] = useState('single')
  const [bulkName, setBulkName] = useState('')
  const [bulkLabel, setBulkLabel] = useState('')
  const [bulkFiles, setBulkFiles] = useState([])
  const [bulkResults, setBulkResults] = useState([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const toast = useToast()

  const handleFile = async (f) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError('')
    setQuality(null)
    const q = await checkImageQuality(f)
    setQuality(q)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setMode('camera')
    } catch {
      setError('Camera access denied or not available.')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setMode('upload')
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      const f = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
      handleFile(f)
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const submit = async () => {
    if (!name.trim()) { setError('Name is required.'); return }
    if (!file) { setError('Please select or capture a photo.'); return }
    setLoading(true)
    setError('')
    try {
      const fd = fileToFormData(file, { name: name.trim(), label: label.trim() })
      const data = await apiPost('/register', fd)
      setResult(data)
      toast(data.message, 'success')
      setFile(null)
      setPreview(null)
      if (data.is_new) { setName(''); setLabel('') }
    } catch (e) {
      setError(e.message)
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const bulkSubmit = async () => {
    if (!bulkName.trim()) { toast('Name is required.', 'error'); return }
    if (bulkFiles.length === 0) { toast('Please select at least one photo.', 'error'); return }
    setBulkLoading(true)
    setBulkResults([])
    const results = []
    for (const f of bulkFiles) {
      try {
        const fd = fileToFormData(f, { name: bulkName.trim(), label: bulkLabel.trim() })
        const data = await apiPost('/register', fd)
        results.push({ file: f.name, success: true, message: data.message })
      } catch (e) {
        results.push({ file: f.name, success: false, message: e.message })
      }
      setBulkResults([...results])
    }
    const success = results.filter(r => r.success).length
    toast(`${success}/${bulkFiles.length} photos registered!`, 'success')
    setBulkLoading(false)
  }

  const Btn = ({ onClick, children, variant, style }) => (
    <button onClick={onClick} style={{
      padding: '9px 18px', borderRadius: 8,
      background: variant === 'primary' ? 'var(--accent)' : variant === 'danger' ? 'var(--red)' : 'var(--bg3)',
      color: variant === 'primary' || variant === 'danger' ? '#fff' : 'var(--text)',
      border: '1px solid transparent', fontWeight: 500, ...style,
    }}>{children}</button>
  )

  return (
    <div style={{ maxWidth: 560, animation: 'fadeIn 0.2s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Register face</h1>
        <p style={{ color: 'var(--text2)' }}>Add a new person to the recognition database</p>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {['single', 'bulk'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: 'transparent', border: 'none',
            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            color: tab === t ? 'var(--accent2)' : 'var(--text2)',
            textTransform: 'capitalize',
          }}>{t === 'single' ? 'Single photo' : 'Bulk upload'}</button>
        ))}
      </div>

      {tab === 'single' && (
        <>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>Full name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>Label / role</label>
              <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Student, Employee" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 10, fontWeight: 500, fontSize: 13 }}>Photo</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <Btn onClick={() => { stopCamera(); setMode('upload') }} variant={mode === 'upload' ? 'primary' : null}>Upload photo</Btn>
                <Btn onClick={mode === 'camera' ? stopCamera : startCamera} variant={mode === 'camera' ? 'danger' : null}>
                  {mode === 'camera' ? 'Stop camera' : 'Use camera'}
                </Btn>
              </div>

              {mode === 'camera' && (
                <div>
                  <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', borderRadius: 8, background: '#000' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <Btn onClick={capturePhoto} variant="primary" style={{ marginTop: 10, width: '100%' }}>Capture photo</Btn>
                </div>
              )}

              {mode === 'upload' && (
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed var(--border2)', borderRadius: 8, padding: 24, cursor: 'pointer',
                  color: 'var(--text2)', gap: 6, minHeight: 100,
                }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
                  <span style={{ fontSize: 24 }}>◉</span>
                  <span style={{ fontSize: 13 }}>Click to choose or drag a photo here</span>
                </label>
              )}

              {preview && (
                <div style={{ marginTop: 12 }}>
                  <img src={preview} alt="Preview" style={{
                    width: '100%', borderRadius: 8,
                    maxHeight: 240, objectFit: 'contain', background: 'var(--bg3)'
                  }} />
                  {quality && (
                    <div style={{ marginTop: 8 }}>
                      {quality.warnings.length === 0 ? (
                        <div style={{
                          padding: '8px 12px', borderRadius: 6, fontSize: 12,
                          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                          color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6,
                        }}>✓ Photo quality looks good!</div>
                      ) : (
                        <div style={{
                          padding: '10px 12px', borderRadius: 6, fontSize: 12,
                          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                          color: 'var(--amber)',
                        }}>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>⚠ Quality warnings:</div>
                          {quality.warnings.map((w, i) => <div key={i} style={{ marginTop: 2 }}>• {w}</div>)}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11, color: 'var(--text3)' }}>
                        <span>Size: {quality.info.width}×{quality.info.height}px</span>
                        <span>Brightness: {quality.info.brightness}/255</span>
                        <span>Sharpness: {quality.info.sharpness}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
                {error}
              </div>
            )}

            {result && (
              <div style={{ fontSize: 13, marginBottom: 12, padding: '10px 14px', background: 'rgba(34,197,94,0.1)', borderRadius: 6, border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ color: 'var(--green)', fontWeight: 500, marginBottom: result.is_new ? 0 : 6 }}>{result.message}</div>
                {!result.is_new && (
                  <div style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>
                    Name kept — add another photo from a different angle for better accuracy.
                  </div>
                )}
              </div>
            )}

            <Btn onClick={submit} variant="primary" style={{ width: '100%', padding: '10px 18px' }}>
              {loading ? 'Registering...' : 'Register person'}
            </Btn>
          </div>

          <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text2)' }}>
            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }}>Tips for best results</strong>
            Use a clear, well-lit frontal photo. Only one face per image. Avoid sunglasses or heavy obstructions.
          </div>
        </>
      )}

      {tab === 'bulk' && (
        <>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>Full name *</label>
              <input value={bulkName} onChange={e => setBulkName(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>Label / role</label>
              <input value={bulkLabel} onChange={e => setBulkLabel(e.target.value)} placeholder="e.g. Student, Employee" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 10, fontWeight: 500, fontSize: 13 }}>
                Photos ({bulkFiles.length} selected)
              </label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed var(--border2)', borderRadius: 8, padding: 24, cursor: 'pointer',
                color: 'var(--text2)', gap: 6, minHeight: 100,
              }}>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => setBulkFiles(Array.from(e.target.files))} />
                <span style={{ fontSize: 24 }}>◉</span>
                <span style={{ fontSize: 13 }}>Click to select multiple photos</span>
              </label>
              {bulkFiles.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8, marginTop: 12 }}>
                  {bulkFiles.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt={f.name}
                      style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 6 }} />
                  ))}
                </div>
              )}
            </div>

            {bulkResults.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {bulkResults.map((r, i) => (
                  <div key={i} style={{
                    padding: '6px 10px', borderRadius: 6, fontSize: 12, marginBottom: 4,
                    background: r.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: r.success ? 'var(--green)' : 'var(--red)',
                  }}>{r.file}: {r.message}</div>
                ))}
              </div>
            )}

            <button onClick={bulkSubmit} disabled={bulkLoading} style={{
              width: '100%', padding: '10px', borderRadius: 8,
              background: 'var(--accent)', color: '#fff',
              border: 'none', fontWeight: 500, fontSize: 14, cursor: 'pointer',
            }}>
              {bulkLoading ? `Registering... (${bulkResults.length}/${bulkFiles.length})` : `Register ${bulkFiles.length > 0 ? bulkFiles.length : ''} photos`}
            </button>
          </div>

          <div style={{ padding: '14px 18px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text2)' }}>
            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }}>Tips for bulk upload</strong>
            Select 3-10 photos of the same person from different angles for best accuracy.
          </div>
        </>
      )}
    </div>
  )
}