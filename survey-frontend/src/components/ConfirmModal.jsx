export default function ConfirmModal({ open, onClose, onConfirm, loading, title = 'Delete Record', message = 'This action cannot be undone.' }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: 'var(--red)' }}>⚠ {title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>{message}</p>
        <div className="flex-row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="spinner" /> Deleting…</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
