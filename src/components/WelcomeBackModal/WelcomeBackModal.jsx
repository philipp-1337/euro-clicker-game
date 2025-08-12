import React from 'react';
import { X as CloseIcon, Zap as ZapIcon } from 'lucide-react'; // Using ZapIcon for a "recharged" feel
import { useModal } from '@hooks/useModal';
import { formatPlaytime, formatNumber } from '@utils/calculators';

export default function WelcomeBackModal({ show, onClose, duration, offlineEarnings, isOfflineEarningsUnlocked }) {
  const modalRef = useModal(show, onClose);

  if (!show) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 10005 }}>
      <div ref={modalRef} className="modal-content" style={{ maxWidth: 400, textAlign: 'center' }}>
        <div className="settings-modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <h3 style={{ flexGrow: 1 }}>Welcome Back!</h3>
          <button 
            className="settings-button" 
            onClick={onClose} 
            title="Close" 
            aria-label="Close"
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="settings-modal-content">
          <ZapIcon size={48} style={{ margin: '20px auto', color: '#f39c12' }} />
          <p>You were away for {formatPlaytime(duration, true)}.</p>
          {isOfflineEarningsUnlocked && offlineEarnings > 0 && (
            <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#2ecc71' }}>
              You earned {formatNumber(offlineEarnings)} € while you were away!
            </p>
          )}
          <button className="modal-btn" onClick={onClose} style={{ marginTop: '10px', width: '90%' }}>
            Continue playing
          </button>
        </div>
      </div>
    </div>
  );
}