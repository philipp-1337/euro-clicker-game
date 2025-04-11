import { Star, Zap, RefreshCw } from 'lucide-react';

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
  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Premium Upgrades</h2>
      
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <Star className="premium-icon" />
          <h3>Global Value Multiplier</h3>
        </div>
        <p className="premium-upgrade-description">
          Erhöht den Wert aller Klicks um 15%
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {globalMultiplierLevel} (×{globalMultiplier.toLocaleString("en-GB", { minimumFractionDigits: 2 })})
          </div>
          <button
            onClick={buyGlobalMultiplier}
            disabled={money < globalMultiplierCost}
            className={`premium-upgrade-button ${money < globalMultiplierCost ? 'disabled' : ''}`}
          >
            {globalMultiplierCost.toLocaleString("en-GB")} €
          </button>
        </div>
      </div>
      
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <RefreshCw className="premium-icon" />
          <h3>Offline Earnings</h3>
        </div>
        <p className="premium-upgrade-description">
          Verdiene Geld, auch wenn du nicht spielst (max. 8 Stunden)
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {offlineEarningsLevel} ({offlineEarningsLevel > 0 ? `${(20 + offlineEarningsLevel * 10)}% der normalen Rate` : 'Inaktiv'})
          </div>
          <button
            onClick={buyOfflineEarnings}
            disabled={money < offlineEarningsCost}
            className={`premium-upgrade-button ${money < offlineEarningsCost ? 'disabled' : ''}`}
          >
            {offlineEarningsCost.toLocaleString("en-GB")} €
          </button>
        </div>
      </div>
    </div>
  );
}