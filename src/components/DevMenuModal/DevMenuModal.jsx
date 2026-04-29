import { useState } from 'react';
import { X as CloseIcon, Copy as CopyIcon, Loader2 as LoaderIcon } from 'lucide-react';
import { useModal } from '@hooks/useModal';

export default function DevMenuModal({
  show,
  onClose,
  cloudSaveUuid,
  onDuplicateCloudSave,
}) {
  const modalRef = useModal(show, onClose);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!show) return null;

  const handleDuplicateCloudSave = async () => {
    setIsDuplicating(true);
    setErrorMessage('');
    setDuplicateResult(null);

    try {
      const duplicatedUuid = await onDuplicateCloudSave();
      setDuplicateResult(duplicatedUuid);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Cloud save duplication failed');
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal-content" style={{ maxWidth: 480 }}>
        <div className="settings-modal-header">
          <h3>Dev Menu</h3>
          <button
            className="settings-button"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="settings-modal-content">
          <h4>Cloud Save Tools</h4>
          <p style={{ marginTop: 0 }}>
            Duplicate the active Firebase cloud save into a new Firestore document with a fresh UUID.
          </p>

          <div className="settings-row" style={{ alignItems: 'flex-start' }}>
            <CopyIcon size={20} className="settings-icon" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Duplicate Cloud Save</div>
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: '4px' }}>
                Active UUID: {cloudSaveUuid || 'Cloud Save inactive'}
              </div>
            </div>
            <button
              className="modal-btn"
              onClick={handleDuplicateCloudSave}
              disabled={isDuplicating || !cloudSaveUuid}
              aria-label="Duplicate active cloud save"
            >
              {isDuplicating ? <LoaderIcon size={16} className="spin" /> : 'Duplicate'}
            </button>
          </div>

          {duplicateResult && (
            <div style={{ marginTop: '16px', color: 'var(--color-success, #1f8f4c)' }}>
              Duplicated successfully. New UUID: <code>{duplicateResult}</code>
            </div>
          )}

          {errorMessage && (
            <div className="modal-error" style={{ marginTop: '16px' }}>
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
