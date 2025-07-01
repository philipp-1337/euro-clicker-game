import React from 'react';
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

  if (!show) return null;

  const totalSharesAfterPrestige = accumulatedPrestigeShares + currentRunShares;
  const bonusPerSharePercentage = gameConfig.prestige.bonusPerShare * 100;
  const activeBonusFromAccumulatedShares = accumulatedPrestigeShares * bonusPerSharePercentage;
  const potentialBonusAfterPrestige = totalSharesAfterPrestige * bonusPerSharePercentage;
  const minSharesRequired = gameConfig.prestige.minSharesToPrestige;
  const moneyNeededForNextShare =
    gameConfig.prestige.moneyPerBasePoint * (minSharesRequired - currentRunShares);

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
            Reset your progress (money, upgrades, investments) and gain permanent{' '}
            <span className="prestige-text">Prestige Shares</span>.
          </p>
          <p>
            Each share boosts your income per second by{' '}
            <strong>+{bonusPerSharePercentage.toFixed(1)}%</strong>.
          </p>
          <p>
            Earn <strong>{gameConfig.prestige.sharesPerBasePoint} share</strong> per{' '}
            <strong>{formatNumber(gameConfig.prestige.moneyPerBasePoint)} €</strong>.
          </p>

          <div className="prestige-summary">
            <p>
              Current Shares: <strong>{formatNumber(accumulatedPrestigeShares)}</strong>{' '}
              <span className="text-secondary">
                (+{formatNumber(activeBonusFromAccumulatedShares)}% income)
              </span>
            </p>
            <p>Shares from this run: <strong>{formatNumber(currentRunShares)}</strong></p>
            <p className="prestige-text">
              After Prestige: <strong>{formatNumber(totalSharesAfterPrestige)} Shares</strong>
            </p>
            <p className="success-text">
              New Income Bonus: +{formatNumber(potentialBonusAfterPrestige)}%
            </p>
          </div>

          <div className="modal-actions">
            <button
              className="modal-btn prestige-btn"
              onClick={onPrestige}
              disabled={!canPrestige}
              title={
                canPrestige
                  ? `Prestige now for +${currentRunShares.toFixed(2)} Shares`
                  : `Need at least ${minSharesRequired.toFixed(1)} Share (currently ${currentRunShares.toFixed(2)})`
              }
            >
              {canPrestige
                ? `Prestige (+${currentRunShares.toFixed(2)} Shares)`
                : `Need ${minSharesRequired.toFixed(1)} Share from this run${
                    currentRunShares > 0
                      ? ` (currently ${currentRunShares.toFixed(2)})`
                      : ''
                  }`}
            </button>
          </div>

          {!canPrestige && (
            <p className="text-secondary" style={{ fontSize: '0.85em', marginTop: 8 }}>
              You need {formatNumber(moneyNeededForNextShare)} € more to earn the next share and prestige.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}