import React from 'react';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function Investments({ money, investments, buyInvestment, totalIncomePerSecond, investmentCostMultiplier, onInvestmentBoosted }) {
  // Add state for boost tracking for all investments
  const [boostClickStates, setBoostClickStates] = React.useState(() => {
    return gameConfig.investments.map((investment, index) => {
      const storedBoosted = localStorage.getItem(`boosted-${index}`);
      const storedClicks = localStorage.getItem(`boostClicks-${index}`);
      return {
        clicks: storedClicks ? parseInt(storedClicks, 10) : 0,
        boosted: storedBoosted ? JSON.parse(storedBoosted) : false,
      };
    });
  });

  const handleBoostClick = (index) => {
    setBoostClickStates(prevClickStates => {
      const newClickStates = [...prevClickStates];
      // If already boosted according to local click state, do nothing further for clicks.
      // The actual boosted status for income calculation comes from the parent.
      if (newClickStates[index].boosted) return prevClickStates;

      const newClicks = newClickStates[index].clicks + 1;
      const newBoosted = newClicks >= 100;

      newClickStates[index] = {
        clicks: newClicks,
        boosted: newBoosted,
      };

      // Persist the boosted status to localStorage for this component's own tracking
      localStorage.setItem(`boosted-${index}`, JSON.stringify(newBoosted));
      localStorage.setItem(`boostClicks-${index}`, newClicks.toString());

      // Notify parent component only when the investment becomes newly boosted
      if (newBoosted && !prevClickStates[index].boosted) {
        if (onInvestmentBoosted) {
          onInvestmentBoosted(index, true); // Pass index and new boosted status
        }
      }
      return newClickStates;
    });
  };

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
        // Determine effective income based on the local boost click state for display purposes.
        // The actual income calculation for totalIncomePerSecond happens in the parent hook.
        const isLocallyBoosted = boostClickStates[index].boosted;
        const displayedIncome = isLocallyBoosted ? investment.income * 2 : investment.income;

        return (
          <div key={index} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <h3>{investment.name}</h3>
            </div>
            <p className="premium-upgrade-description">
              Invest {formatNumber(cost)} € to earn {formatNumber(displayedIncome)} €/s.
            </p>
            <p className="premium-upgrade-description" style={{ fontSize: '0.9em', marginTop: '5px' }}>
              Click the "Boost" button 100 times to permanently double the income from this investment!
            </p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Purchased: {purchased ? 'Yes' : 'No'}
              </div>
              {/* Add boost button for each investment */}
              <button
                onClick={() => handleBoostClick(index)}
                className={`premium-upgrade-button ${boostClickStates[index].boosted ? 'disabled' : ''}`}
              >
                {boostClickStates[index].boosted ? "Earnings Boosted" : `Boost (${boostClickStates[index].clicks}/100)`}
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