import { createContext, useContext, useState, useCallback } from 'react'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setDialog({ message, resolve })
    })
  }, [])

  const handle = (result) => {
    dialog?.resolve(result)
    setDialog(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)', padding: 24, maxWidth: 360, width: '90%',
          }}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Are you sure?</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>{dialog.message}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => handle(false)} style={{
                padding: '8px 16px', borderRadius: 8, background: 'var(--bg3)',
                color: 'var(--text2)', border: '1px solid var(--border2)', cursor: 'pointer', fontSize: 13,
              }}>Cancel</button>
              <button onClick={() => handle(true)} style={{
                padding: '8px 16px', borderRadius: 8, background: 'var(--red)',
                color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}