export default function ProductionHqTransitionModal({
  open = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop production-hq-transition-overlay" style={{ zIndex: 10010 }} role="presentation">
      <div
        className="modal-content production-hq-transition-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="production-hq-transition-title"
        style={{ maxWidth: 460 }}
      >
        <div className="settings-modal-header">
          <h3 id="production-hq-transition-title">Production HQ Ready</h3>
        </div>
        <span className="crafting-journey-card__eyebrow">Phase Shift</span>
        <p>
          You have built enough industrial foundation to leave capital behind.
        </p>
        <p><strong>This permanently ends the cash phase.</strong></p>
        <div className="crafting-journey-card__highlights">
          <span>Money disappears</span>
          <span>Prestige disappears</span>
          <span>Production takes over</span>
        </div>
        <div className="modal-actions production-hq-transition-modal__actions">
          <button type="button" className="modal-btn" onClick={onCancel}>
            Stay
          </button>
          <button type="button" className="modal-btn prestige-btn" onClick={onConfirm}>
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
