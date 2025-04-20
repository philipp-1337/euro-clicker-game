import { Star, RefreshCw } from 'lucide-react';
import { 
  formatNumber, 
  getGlobalMultiplierPercentage, 
  calculateOfflineEarningsPercentage 
} from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function PremiumUpgrades({
  money,
  globalMultiplier,
  globalMultiplierLevel,
  offlineEarningsLevel,
  globalMultiplierCost,
  offlineEarningsCost,
  buyGlobalMultiplier,
  buyOfflineEarnings,
  isInvestmentUnlocked,
  unlockInvestments
}) {
  // Berechne Prozentsätze mit den Hilfsfunktionen und Config-Werten
  const globalMultiplierPercentage = getGlobalMultiplierPercentage(
    gameConfig.upgrades.globalMultiplierFactor
  );
  
  const offlineEarningsPercentage = calculateOfflineEarningsPercentage(
    offlineEarningsLevel,
    gameConfig.premiumUpgrades.offlineEarnings
  );

  // Kosten für die Freischaltung des Investment-Tabs aus der gameConfig abrufen
  const unlockInvestmentCost = gameConfig.premiumUpgrades.unlockInvestmentCost;

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Premium Upgrades</h2>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Star className="premium-icon" />
          <h3>Global Value Multiplier</h3>
        </div>
        <p className="premium-upgrade-description">
          Erhöht den Wert aller Klicks um {globalMultiplierPercentage}%
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {globalMultiplierLevel} (×{formatNumber(globalMultiplier)})
          </div>
          <button
            onClick={buyGlobalMultiplier}
            disabled={money < globalMultiplierCost}
            className={`premium-upgrade-button ${money < globalMultiplierCost ? 'disabled' : ''}`}
          >
            {formatNumber(globalMultiplierCost)} €
          </button>
        </div>
      </div>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <RefreshCw className="premium-icon" />
          <h3>Offline Earnings</h3>
        </div>
        <p className="premium-upgrade-description">
          Verdiene Geld, auch wenn du nicht spielst (max. {gameConfig.premiumUpgrades.offlineEarnings.maxOfflineHours} Stunden)
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {offlineEarningsLevel} ({offlineEarningsLevel > 0 ? `${offlineEarningsPercentage}% der normalen Rate` : 'Inaktiv'})
          </div>
          <button
            onClick={buyOfflineEarnings}
            disabled={money < offlineEarningsCost}
            className={`premium-upgrade-button ${money < offlineEarningsCost ? 'disabled' : ''}`}
          >
            {formatNumber(offlineEarningsCost)} €
          </button>
        </div>
      </div>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <h3>Unlock Investments</h3>
        </div>
        <p className="premium-upgrade-description">
          Schalte den Investment-Tab frei, um in Unternehmen zu investieren.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Status: {isInvestmentUnlocked ? 'Freigeschaltet' : 'Nicht freigeschaltet'}
          </div>
          <button
            onClick={() => {
              console.log('Button clicked, money:', money, 'cost:', unlockInvestmentCost);
              unlockInvestments();
            }}
            disabled={money < unlockInvestmentCost || isInvestmentUnlocked}
            className={`premium-upgrade-button ${money < unlockInvestmentCost || isInvestmentUnlocked ? 'disabled' : ''}`}
          >
            {isInvestmentUnlocked ? 'Freigeschaltet' : `${formatNumber(unlockInvestmentCost)} €`}
          </button>
        </div>
      </div>
    </div>
  );
}