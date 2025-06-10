import React from 'react';
import { X as CloseIcon, Zap as PrestigeIcon } from 'lucide-react';
import { useModal } from '@hooks/useModal';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function PrestigeModal({
  show,
  onClose,
  currentRunShares = 0, // Default to 0 if undefined
  accumulatedPrestigeShares = 0, // Default to 0 if undefined
  onPrestige,
  canPrestige,
}) {
  const modalRef = useModal(show, onClose);

  if (!show) return null;

  const totalSharesAfterPrestige = accumulatedPrestigeShares + currentRunShares;
  const bonusPerSharePercentage = gameConfig.prestige.bonusPerShare * 100;
  const activeBonusFromAccumulatedShares = (accumulatedPrestigeShares * gameConfig.prestige.bonusPerShare) * 100;
  const potentialBonusAfterPrestige = (totalSharesAfterPrestige * gameConfig.prestige.bonusPerShare) * 100;


  return (
    <div className="modal-backdrop" style={{ zIndex: 10006 }}>
      <div ref={modalRef} className="modal-content prestige-modal" style={{ maxWidth: 450 }}>
        <div className="settings-modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <h3 className="modal-title">Prestige</h3>
          <button
            className="settings-button"
            onClick={onClose}
            title="Close"
            aria-label="Close"
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="settings-modal-content">
          <div className="prestige-icon-wrapper">
            <PrestigeIcon size={48} className="prestige-icon" />
          </div>
          <p>
            Reach new heights by prestiging! You'll reset your current game progress (money, upgrades, investments, etc.)
            but gain permanent <span className="prestige-text">Prestige Shares</span>.
          </p>
          <p>
            Each Prestige Share grants a permanent <strong>{bonusPerSharePercentage.toFixed(1)}% bonus</strong> to your income per second.
          </p>
          <p>
            You earn <strong>{gameConfig.prestige.sharesPerBasePoint} share</strong> for every <strong>{formatNumber(gameConfig.prestige.moneyPerBasePoint)} €</strong>.
          </p>
          <div className="prestige-summary">
            <p>Current Accumulated Shares: <strong>{accumulatedPrestigeShares.toFixed(2)}</strong></p>
            <p className="text-secondary">
              (Your current active income bonus: +{activeBonusFromAccumulatedShares.toFixed(2)}%)
            </p>
            <p>Shares from this run: <strong>{currentRunShares.toFixed(2)}</strong></p>
            <p className="prestige-text">
              Total Shares after Prestige: <span>{totalSharesAfterPrestige.toFixed(2)}</span>
            </p>
            <p className="success-text">
              Income Bonus after Prestige: +{potentialBonusAfterPrestige.toFixed(2)}%
            </p>
          </div>
          <div className='modal-actions'>
          <button
            className="modal-btn prestige-btn"
            onClick={onPrestige}
            disabled={!canPrestige}
            title={canPrestige ? `Prestige now for ${currentRunShares.toFixed(2)} more shares!` : `You need at least ${gameConfig.prestige.minSharesToPrestige.toFixed(1)} share from this run to prestige (currently ${currentRunShares.toFixed(2)}).`}
          >
            {canPrestige ? `Prestige (+${currentRunShares.toFixed(2)} Shares)` : `Need ${gameConfig.prestige.minSharesToPrestige.toFixed(1)} Share from this run`}
            {!canPrestige && currentRunShares > 0 && ` (currently ${currentRunShares.toFixed(2)})`}
          </button>
          </div>
          {!canPrestige && (
            <p className="text-secondary" style={{ fontSize: '0.85em', marginTop: 8 }}>
              (You need {formatNumber(gameConfig.prestige.moneyPerBasePoint * (gameConfig.prestige.minSharesToPrestige - currentRunShares))} more € to earn the next full share and prestige)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
