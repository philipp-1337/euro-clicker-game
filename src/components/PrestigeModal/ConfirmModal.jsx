export default function ConfirmModal({ show, title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel', danger = false }) {
  if (!show) return null;
  return (
    <div className="modal-backdrop" style={{ zIndex: 10010 }}>
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <div className="settings-modal-header">
          <h3>{title}</h3>
        </div>
        <p>{message}</p>
        <div className="modal-actions">
          <button
            className={`modal-btn${danger ? ' danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className="modal-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
