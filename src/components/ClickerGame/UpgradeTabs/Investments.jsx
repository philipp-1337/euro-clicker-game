import React from 'react';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function Investments({ money, investments, buyInvestment, totalIncomePerSecond, investmentCostMultiplier, onTaxiBoostedChange, onEnergyDrinksBoostedChange }) {
  // Add state for boost tracking for all investments
  const [boostStates, setBoostStates] = React.useState(() => {
    return gameConfig.investments.map((investment, index) => {
      const storedValue = localStorage.getItem(`boosted-${index}`);
      return {
        clicks: 0,
        boosted: storedValue ? JSON.parse(storedValue) : false,
      };
    });
  });

  const handleBoostClick = (index) => {
    setBoostStates(prev => {
      const newBoostStates = [...prev];
      if (newBoostStates[index].boosted) return prev;

      const newClicks = newBoostStates[index].clicks + 1;
      const newBoosted = newClicks >= 100;

      newBoostStates[index] = {
        clicks: newClicks,
        boosted: newBoosted,
      };

      localStorage.setItem(`boosted-${index}`, JSON.stringify(newBoosted));

      // Notify parent component
      if (newBoosted && onTaxiBoostedChange) { // Reuse onTaxiBoostedChange, consider a more generic name
        onTaxiBoostedChange(gameConfig.investments[index].income * 2, true); // Pass doubled income
      }

      return newBoostStates;
    });
  };

  React.useEffect(() => {
    // Notify parent component when any investment is boosted
    gameConfig.investments.forEach((investment, index) => {
      if (onTaxiBoostedChange) { // Reuse onTaxiBoostedChange, consider a more generic name
        onTaxiBoostedChange(boostStates[index].boosted ? investment.income * 2 : investment.income, boostStates[index].boosted);
      }
    });
  }, [boostStates, onTaxiBoostedChange]);

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">
        Investments
        <span className="section-label">
          {/* Einkommen pro Sekunde anzeigen */}
          {formatNumber(totalIncomePerSecond)} €/s
        </span>
      </h2>
      {gameConfig.investments.map((investment, index) => {
        const cost = investment.cost * (investmentCostMultiplier ?? 1);
        const purchased = investments[index] ? true : false;
        const effectiveIncome = boostStates[index].boosted ? investment.income * 2 : investment.income;

        return (
          <div key={index} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <h3>{investment.name}</h3>
            </div>
            <p className="premium-upgrade-description">
              Invest {formatNumber(cost)} € to earn {formatNumber(effectiveIncome)} €/s.
            </p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Purchased: {purchased ? 'Yes' : 'No'}
              </div>
              {/* Add boost button for each investment */}
              <button
                onClick={() => handleBoostClick(index)}
                className={`premium-upgrade-button ${boostStates[index].boosted ? 'disabled' : ''}`}
              >
                {boostStates[index].boosted ? "Earnings Boosted" : `Boost ${investment.name} (${boostStates[index].clicks}/100)`}
              </button>
              <button
                onClick={() => buyInvestment(index)}
                disabled={money < cost || purchased}
                className={`premium-upgrade-button ${money < cost || purchased ? 'disabled' : ''}`}
              >
                {purchased ? 'Purchased' : `${formatNumber(cost)} €`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}