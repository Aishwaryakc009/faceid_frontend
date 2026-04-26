import { useState, useRef, useEffect } from 'react'
import { apiPost, fileToFormData } from '../utils/api'

export default function Recognize() {
  const [mode, setMode] = useState('upload')
  const [threshold, setThreshold] = useState(55)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [liveActive, setLiveActive] = useState(false)
  const [liveResult, setLiveResult] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  const recognize = async (file, source = 'upload') => {
    const fd = fileToFormData(file, { threshold: (threshold / 100).toFixed(2), source })
    return await apiPost('/recognize', fd)
  }

  const handleUpload = async (file) => {
    setLoading(true)
    setError('')
    try {
      const data = await recognize(file, 'upload')
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      setLiveActive(true)
      intervalRef.current = setInterval(async () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || video.readyState < 2) return
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0)
        canvas.toBlob(async (blob) => {
          const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' })
          try {
            const data = await recognize(file, 'webcam')
            setLiveResult(data)
          } catch { }
        }, 'image/jpeg', 0.8)
      }, 1200)
    } catch {
      setError('Camera access denied or unavailable.')
    }
  }

  const stopLive = () => {
    clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setLiveActive(false)
    setLiveResult(null)
  }

  useEffect(() => () => stopLive(), [])

  const Btn = ({ onClick, children, variant, style }) => (
    <button onClick={onClick} style={{
      padding: '9px 18px', borderRadius: 8, fontWeight: 500,
      background: variant === 'primary' ? 'var(--accent)' : variant === 'danger' ? 'var(--red)' : 'var(--bg3)',
      color: variant === 'primary' || variant === 'danger' ? '#fff' : 'var(--text)',
      border: '1px solid transparent', ...style,
    }}>{children}</button>
  )

  const FaceTag = ({ face }) => {
    const [showComparison, setShowComparison] = useState(false)
    const isKnown = face.name !== 'Unknown'

    return (
      <div style={{
        borderRadius: 10, overflow: 'hidden',
        background: isKnown ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
        border: `1px solid ${isKnown ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}>
        <div style={{
          padding: '8px 12px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <span style={{ fontWeight: 500, color: isKnown ? 'var(--green)' : 'var(--red)' }}>
              {face.name}
            </span>
            {face.label && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text3)' }}>{face.label}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {face.confidence > 0 && (
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{face.confidence}%</span>
            )}
            {isKnown && face.face_crop && face.matched_photo && (
              <button onClick={() => setShowComparison(!showComparison)} style={{
                padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                background: showComparison ? 'var(--accent)' : 'var(--bg3)',
                color: showComparison ? '#fff' : 'var(--text2)',
                border: '1px solid transparent', fontWeight: 500,
              }}>Compare</button>
            )}
          </div>
        </div>

        {showComparison && face.face_crop && face.matched_photo && (
          <div style={{ padding: '0 12px 12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Detected face</div>
                <img src={`data:image/jpeg;base64,${face.face_crop}`} alt="Detected"
                  style={{ width: '100%', borderRadius: 8, objectFit: 'cover', aspectRatio: '1' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Registered photo</div>
                <img src={`data:image/jpeg;base64,${face.matched_photo}`} alt="Registered"
                  style={{ width: '100%', borderRadius: 8, objectFit: 'cover', aspectRatio: '1' }} />
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: 'var(--text2)' }}>Similarity score</span>
                <span style={{ color: face.confidence > 80 ? 'var(--green)' : face.confidence > 60 ? 'var(--amber)' : 'var(--red)', fontWeight: 500 }}>
                  {face.confidence}%
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${face.confidence}%`,
                  background: face.confidence > 80 ? 'var(--green)' : face.confidence > 60 ? 'var(--amber)' : 'var(--red)',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Recognize faces</h1>
        <p style={{ color: 'var(--text2)' }}>Upload a photo or use live webcam feed</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Btn onClick={() => { setMode('upload'); stopLive() }} variant={mode === 'upload' ? 'primary' : null}>Photo upload</Btn>
        <Btn onClick={() => { setMode('live'); if (!liveActive) startLive() }} variant={mode === 'live' ? 'primary' : null}>Live webcam</Btn>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>Confidence threshold</span>
        <input type="range" min="30" max="90" step="1" value={threshold}
          onChange={e => setThreshold(+e.target.value)}
          style={{ flex: 1, maxWidth: 200 }} />
        <span style={{ fontSize: 13, fontWeight: 500, minWidth: 36 }}>{threshold}%</span>
      </div>

      {mode === 'upload' && (
        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 20 }}>
          <div>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', border: '2px dashed var(--border2)',
              borderRadius: 12, padding: 32, cursor: 'pointer',
              color: 'var(--text2)', gap: 8, minHeight: 140,
            }}>
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
              <span style={{ fontSize: 28 }}>◉</span>
              <span>{loading ? 'Analyzing...' : 'Choose or drop a photo'}</span>
            </label>
            {error && <div style={{ color: 'var(--red)', marginTop: 10, fontSize: 13 }}>{error}</div>}
          </div>

          {result && (
            <div>
              <img
                src={`data:image/jpeg;base64,${result.annotated_image}`}
                alt="Result"
                style={{ width: '100%', borderRadius: 10, marginBottom: 12 }}
              />
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                {result.count} face{result.count !== 1 ? 's' : ''} detected
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.faces.length === 0
                  ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No faces found.</div>
                  : result.faces.map((f, i) => <FaceTag key={i} face={f} />)
                }
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'live' && (
        <div style={{ display: 'grid', gridTemplateColumns: result ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: 20 }}>
          <div>
            {liveResult?.annotated_image
              ? <img src={`data:image/jpeg;base64,${liveResult.annotated_image}`} alt="Live"
                style={{ width: '100%', borderRadius: 10 }} />
              : <video ref={videoRef} autoPlay muted playsInline
                style={{ width: '100%', borderRadius: 10, background: '#000' }} />
            }
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Live results</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: liveActive ? 'var(--green)' : 'var(--red)' }} />
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{liveActive ? 'Active' : 'Stopped'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {!liveResult && <div style={{ color: 'var(--text3)', fontSize: 13 }}>Waiting for first frame...</div>}
              {liveResult?.faces?.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 13 }}>No faces in frame</div>}
              {liveResult?.faces?.map((f, i) => <FaceTag key={i} face={f} />)}
            </div>
            <Btn onClick={liveActive ? stopLive : startLive} variant={liveActive ? 'danger' : 'primary'}
              style={{ width: '100%', marginTop: 16 }}>
              {liveActive ? 'Stop camera' : 'Start camera'}
            </Btn>
          </div>
        </div>
      )}
    </div>
  )
}