import { X as CloseIcon } from 'lucide-react';
import { useModal } from '../../hooks/useModal';

const Modal = ({ show, onClose, title, children }) => {
  const modalRef = useModal(show, onClose);
  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal-content">
        <div className="settings-modal-header">
          <h3>{title}</h3>
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
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
