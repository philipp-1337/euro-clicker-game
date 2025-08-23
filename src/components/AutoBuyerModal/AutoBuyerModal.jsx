import React from 'react';
import { useModal } from '../../hooks/useModal';
import { X as CloseIcon } from 'lucide-react';

const AutoBuyerModal = ({
  show,
  onClose,
  autoBuyerInterval,
  setAutoBuyerInterval,
  autoBuyerBuffer,
  setAutoBuyerBuffer,
  formatNumber,
  autoBuyValueUpgradeEnabled,
  setAutoBuyValueUpgradeEnabled,
  autoBuyCooldownUpgradeEnabled,
  setAutoBuyCooldownUpgradeEnabled,
  autoBuyerUnlocked,
  cooldownAutoBuyerUnlocked,
}) => {
  const modalRef = useModal(show, onClose);

  if (!show) return null;

  const handleIntervalChange = (e) => {
    setAutoBuyerInterval(Number(e.target.value));
  };

  const handleBufferChange = (e) => {
    const value = e.target.value;
    setAutoBuyerBuffer(Number(value));
  };

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal-content">
        <div className="settings-modal-header">
          <h3>AutoBuyer Settings</h3>
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
          <div className="setting">
            <label htmlFor="autoBuyerInterval">
              Purchase Interval: {autoBuyerInterval}ms
            </label>
            <input
              type="range"
              id="autoBuyerInterval"
              min="500"
              max="5000"
              step="100"
              value={autoBuyerInterval}
              onChange={handleIntervalChange}
            />
          </div>
          <div className="setting">
            <label htmlFor="autoBuyerBuffer">
              Money Buffer
            </label>
            <input
              type="number"
              id="autoBuyerBuffer"
              value={autoBuyerBuffer}
              onChange={handleBufferChange}
              placeholder="Enter money buffer"
            />
            <span>Current Buffer: {formatNumber(autoBuyerBuffer)}</span>
          </div>

          {autoBuyerUnlocked && (
            <div className="setting">
              <label htmlFor="valueAutoBuyerToggle">Value AutoBuyer</label>
              <label className="switch">
                <input
                  type="checkbox"
                  id="valueAutoBuyerToggle"
                  checked={autoBuyValueUpgradeEnabled}
                  onChange={() => setAutoBuyValueUpgradeEnabled(v => !v)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          )}

          {cooldownAutoBuyerUnlocked && (
            <div className="setting">
              <label htmlFor="cooldownAutoBuyerToggle">Cooldown AutoBuyer</label>
              <label className="switch">
                <input
                  type="checkbox"
                  id="cooldownAutoBuyerToggle"
                  checked={autoBuyCooldownUpgradeEnabled}
                  onChange={() => setAutoBuyCooldownUpgradeEnabled(v => !v)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoBuyerModal;
