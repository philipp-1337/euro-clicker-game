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
    <div className="modal-backdrop" style={{ zIndex: 10006 }}> {/* Ensure high z-index */}
      <div ref={modalRef} className="modal-content" style={{ maxWidth: 450, textAlign: 'center' }}>
        <div className="settings-modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <h3 style={{ flexGrow: 1 }}>Prestige</h3>
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
        <div className="settings-modal-content" style={{ padding: '20px' }}>
          <PrestigeIcon size={48} style={{ margin: '10px auto 20px', color: 'var(--color-prestige)' }} />
          
          <p style={{ marginBottom: '15px' }}>
            Reach new heights by prestiging! You'll reset your current game progress (money, upgrades, investments, etc.) 
            but gain permanent Prestige Shares.
          </p>
          <p style={{ marginBottom: '10px' }}>
            Each Prestige Share grants a permanent <strong>{bonusPerSharePercentage.toFixed(1)}% bonus</strong> to your income per second.
          </p>
          <p style={{ marginBottom: '5px' }}>
            You earn <strong>{gameConfig.prestige.sharesPerBasePoint} share</strong> for every <strong>{formatNumber(gameConfig.prestige.moneyPerBasePoint)} €</strong>.
          </p>
           {/* This line is now redundant as 1 share costs 1 Billion */}
           {/* <p style={{ marginBottom: '20px', fontSize: '0.9em', color: 'var(--color-text-secondary)' }}>
            (This means 1 full share costs {formatNumber(nextShareCost)} €)
          </p> */}

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '15px', marginBottom: '15px' }}>
            <p>Current Accumulated Shares: <strong>{accumulatedPrestigeShares.toFixed(2)}</strong></p>
            <p style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)'}}>
              (Your current active income bonus: +{activeBonusFromAccumulatedShares.toFixed(2)}%)
            </p>
            <p>Shares from this run: <strong>{currentRunShares.toFixed(2)}</strong></p>
            <p style={{ fontWeight: 'bold', marginTop: '5px' }}>
              Total Shares after Prestige: <span style={{color: 'var(--color-prestige-dark)'}}>{totalSharesAfterPrestige.toFixed(2)}</span>
            </p>
            <p style={{ fontWeight: 'bold', color: 'var(--color-success)', marginTop: '5px' }}>
              Income Bonus after Prestige: +{potentialBonusAfterPrestige.toFixed(2)}%
            </p>
          </div>

          <button 
            className="modal-btn prestige-btn" 
            onClick={onPrestige} 
            disabled={!canPrestige}
            title={canPrestige ? `Prestige now for ${currentRunShares.toFixed(2)} more shares!` : `You need at least ${gameConfig.prestige.minSharesToPrestige.toFixed(1)} share from this run to prestige (currently ${currentRunShares.toFixed(2)}).`}
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '1.1em',
              backgroundColor: canPrestige ? 'var(--color-prestige)' : 'var(--color-button-disabled-bg)',
              color: canPrestige ? 'white' : 'var(--color-button-disabled-text)',
              cursor: canPrestige ? 'pointer' : 'not-allowed',
              border: 'none',
              borderRadius: 'var(--border-radius-medium)',
              transition: 'background-color 0.2s ease'
            }}
          >
            {canPrestige ? `Prestige (+${currentRunShares.toFixed(2)} Shares)` : `Need ${gameConfig.prestige.minSharesToPrestige.toFixed(1)} Share from this run`}
            {/* Adjust text if currentRunShares is less than minSharesToPrestige */}
            {!canPrestige && currentRunShares > 0 && ` (currently ${currentRunShares.toFixed(2)})`}
          </button>
          {!canPrestige && (
            <p style={{fontSize: '0.85em', marginTop: '8px', color: 'var(--color-text-secondary)'}}>
                (You need {formatNumber(gameConfig.prestige.moneyPerBasePoint * (gameConfig.prestige.minSharesToPrestige - currentRunShares))} more € to earn the next full share and prestige)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
