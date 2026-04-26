export function Skeleton({ width, height, style }) {
  return (
    <div style={{
      width: width || '100%', height: height || 16,
      background: 'var(--bg3)', borderRadius: 6,
      animation: 'pulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  )
}

export function StatSkeleton() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px' }}>
      <Skeleton height={12} width={80} style={{ marginBottom: 10 }} />
      <Skeleton height={28} width={60} />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
      <Skeleton width={52} height={52} style={{ borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Skeleton height={14} width={120} style={{ marginBottom: 8 }} />
        <Skeleton height={11} width={80} />
      </div>
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div style={{ padding: '12px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
      <Skeleton width={28} height={28} style={{ borderRadius: '50%', flexShrink: 0 }} />
      <Skeleton height={13} width={120} />
      <Skeleton height={13} width={60} style={{ marginLeft: 'auto' }} />
    </div>
  )
}