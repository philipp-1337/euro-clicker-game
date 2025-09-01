import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { X as CloseIcon } from 'lucide-react';
import { useModal } from '@hooks/useModal';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function PrestigeModal({
  show,
  onClose,
  currentRunShares = 0,
  accumulatedPrestigeShares = 0,
  onPrestige,
  canPrestige,
}) {

  const modalRef = useModal(show, onClose);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!show) return null;

  const totalSharesAfterPrestige = accumulatedPrestigeShares + currentRunShares;
  const bonusPerSharePercentage = gameConfig.prestige.bonusPerShare * 100;
  // const activeBonusFromAccumulatedShares = accumulatedPrestigeShares * bonusPerSharePercentage;
  const potentialBonusAfterPrestige = totalSharesAfterPrestige * bonusPerSharePercentage;
  const minSharesRequired = gameConfig.prestige.minSharesToPrestige;
  // Kosten für den nächsten Share: Index = bereits vorhandene Shares
  const nextShareCost = gameConfig.prestige.getShareCost(accumulatedPrestigeShares);
  // Fehlende Summe für den nächsten Share
  const moneyNeededForNextShare = nextShareCost;

  const handlePrestigeClick = () => setShowConfirm(true);
  const handleConfirm = () => {
    setShowConfirm(false);
    onPrestige();
  };
  const handleCancel = () => setShowConfirm(false);

  return (
    <div className="modal-backdrop" style={{ zIndex: 10006 }}>
      <div ref={modalRef} className="modal-content prestige-modal">
        <div className="settings-modal-header">
          <h3>Prestige</h3>
          <button
            className="settings-button"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div>
          <p>
            Reset your progress and gain permanent <span className="prestige-text">Prestige Shares</span>.<br />
            Each share costs more than the last.
          </p>
          <div className="prestige-summary">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Current Shares:</span>
              <strong>{formatNumber(accumulatedPrestigeShares)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>This Run:</span>
              <strong>{formatNumber(currentRunShares)}</strong>
            </div>
            {canPrestige && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>After Prestige:</span>
              <strong className="prestige-text">{formatNumber(totalSharesAfterPrestige)} Shares</strong>
            </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>
                {!canPrestige && (
                  <span>Current </span>
                )}
                {canPrestige && (
                  <span>New </span>
                )}
                Income Bonus:
              </span>
              <strong>+{formatNumber(potentialBonusAfterPrestige)}%</strong>
            </div>
            {!canPrestige && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Next 1 share costs:</span>
              <strong>{formatNumber(moneyNeededForNextShare)} €</strong>
            </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              className="modal-btn prestige-btn"
              onClick={handlePrestigeClick}
              disabled={!canPrestige}
              title={
                canPrestige
                  ? `Prestige now for +${formatNumber(currentRunShares)} Shares`
                  : `Need at least ${formatNumber(minSharesRequired)} Share (currently ${formatNumber(currentRunShares)})`
              }
            >
              {canPrestige
                ? `Prestige (+${formatNumber(currentRunShares)} Shares)`
                : `Need ${formatNumber(minSharesRequired)} Share${
                    currentRunShares > 0
                      ? ` (currently ${formatNumber(currentRunShares)})`
                      : ''
                  }`}
            </button>
          </div>

          <ConfirmModal
            show={showConfirm}
            title="Confirm Prestige"
            message={"Are you sure? Progress will be reset, but you get Prestige Shares. This cannot be undone."}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            confirmText="Prestige Now"
            cancelText="Cancel"
            danger
          />
        </div>
      </div>
    </div>
  );
}