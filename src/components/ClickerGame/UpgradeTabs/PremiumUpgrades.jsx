import { DollarSign, Star, Percent } from 'lucide-react';
import { 
  formatNumber, 
  getGlobalMultiplierPercentage, 
} from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function PremiumUpgrades({
  money,
  globalMultiplier,
  globalMultiplierLevel,
  globalMultiplierCost,
  globalPriceDecrease,
  globalPriceDecreaseLevel,
  globalPriceDecreaseCost,
  buyGlobalPriceDecrease,
  buyGlobalMultiplier,
  isInvestmentUnlocked,
  unlockInvestments
}) {
  // Berechne Prozentsätze mit den Hilfsfunktionen und Config-Werten
  const globalMultiplierPercentage = getGlobalMultiplierPercentage(
    gameConfig.upgrades.globalMultiplierFactor
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
          <Percent className="premium-icon" />
          <h3>Global Price Decrease</h3>
        </div>
        <p className="premium-upgrade-description">
          Reduziert alle Basic-Upgrade-Kosten um 5% pro Level.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Level: {globalPriceDecreaseLevel} (Kostenfaktor: ×{(globalPriceDecrease ?? 1).toFixed(2)})
          </div>
          <button
            onClick={buyGlobalPriceDecrease}
            disabled={money < globalPriceDecreaseCost || isNaN(globalPriceDecreaseCost)}
            className={`premium-upgrade-button ${money < globalPriceDecreaseCost ? 'disabled' : ''}`}
          >
            {isNaN(globalPriceDecreaseCost) ? 'Fehler' : `${formatNumber(globalPriceDecreaseCost)} €`}
          </button>
        </div>
      </div>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
        <DollarSign className="premium-icon" />
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