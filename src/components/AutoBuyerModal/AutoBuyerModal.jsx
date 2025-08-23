import React from 'react';
import { useModal } from '../../hooks/useModal';
import {
  X as CloseIcon,
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
  DollarSign as DollarSignIcon,
  Clock as ClockIcon,
  PiggyBank as PiggyBankIcon,
} from 'lucide-react';

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
          {autoBuyerUnlocked && (
            <div className="settings-row">
              <DollarSignIcon size={20} className="settings-icon" />
              <span className="settings-label">Value AutoBuyer</span>
              <button
                className={`settings-button${autoBuyValueUpgradeEnabled ? ' active' : ''}`}
                onClick={() => setAutoBuyValueUpgradeEnabled((v) => !v)}
                title={
                  autoBuyValueUpgradeEnabled
                    ? 'Disable Value AutoBuyer'
                    : 'Enable Value AutoBuyer'
                }
                type="button"
              >
                {autoBuyValueUpgradeEnabled ? (
                  <PowerIcon size={18} />
                ) : (
                  <PowerOffIcon size={18} />
                )}
              </button>
            </div>
          )}

          {cooldownAutoBuyerUnlocked && (
            <div className="settings-row">
              <ClockIcon size={20} className="settings-icon" />
              <span className="settings-label">Cooldown AutoBuyer</span>
              <button
                className={`settings-button${
                  autoBuyCooldownUpgradeEnabled ? ' active' : ''
                }`}
                onClick={() => setAutoBuyCooldownUpgradeEnabled((v) => !v)}
                title={
                  autoBuyCooldownUpgradeEnabled
                    ? 'Disable Cooldown AutoBuyer'
                    : 'Enable Cooldown AutoBuyer'
                }
                type="button"
              >
                {autoBuyCooldownUpgradeEnabled ? (
                  <PowerIcon size={18} />
                ) : (
                  <PowerOffIcon size={18} />
                )}
              </button>
            </div>
          )}

          <hr />

          <div className="settings-row">
            <ClockIcon size={20} className="settings-icon" />
            <label htmlFor="autoBuyerInterval" className="settings-label">
              Purchase Interval: {autoBuyerInterval / 1000}s
            </label>
            <input
              type="range"
              id="autoBuyerInterval"
              min="500"
              max="5000"
              step="500"
              value={autoBuyerInterval}
              onChange={handleIntervalChange}
              className="settings-slider"
            />
          </div>

          <div className="settings-row">
            <PiggyBankIcon size={20} className="settings-icon" />
            <label htmlFor="autoBuyerBuffer" className="settings-label">
              Money Buffer: {formatNumber(autoBuyerBuffer)}
            </label>
            <input
              type="number"
              id="autoBuyerBuffer"
              value={autoBuyerBuffer}
              onChange={handleBufferChange}
              placeholder="Enter money buffer"
              className="settings-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoBuyerModal;

