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
  buyOfflineEarnings
}) {
  // Berechne Prozentsätze mit den Hilfsfunktionen und Config-Werten
  const globalMultiplierPercentage = getGlobalMultiplierPercentage(
    gameConfig.upgrades.globalMultiplierFactor
  );
  
  const offlineEarningsPercentage = calculateOfflineEarningsPercentage(
    offlineEarningsLevel,
    gameConfig.premiumUpgrades.offlineEarnings
  );

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
    </div>
  );
}