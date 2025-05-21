import React from 'react';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function Investments({ money, investments, buyInvestment, totalIncomePerSecond, investmentCostMultiplier, onInvestmentBoosted }) {
  const [boostClickStates, setBoostClickStates] = React.useState(() => {
    // Initialize boost states from localStorage
    return gameConfig.investments.map((investment, index) => {
      const storedBoosted = localStorage.getItem(`boosted-${index}`);
      const storedClicks = localStorage.getItem(`boostClicks-${index}`);
      return {
        clicks: storedClicks ? parseInt(storedClicks, 10) : 0,
        boosted: storedBoosted ? JSON.parse(storedBoosted) : false,
      };
    });
  });

  // Ref to store the previous boostClickStates to compare in useEffect
  const prevBoostClickStatesRef = React.useRef(boostClickStates);

  React.useEffect(() => {
    // Iterate over investments to check if any became newly boosted
    boostClickStates.forEach((currentInvestmentState, index) => {
      const prevInvestmentState = prevBoostClickStatesRef.current[index];
      // If the investment is now boosted and was not boosted previously
      if (currentInvestmentState.boosted && (!prevInvestmentState || !prevInvestmentState.boosted)) {
        if (onInvestmentBoosted) {
          onInvestmentBoosted(index, true); // Notify parent
        }
      }
    });
    // Update the ref to the current boostClickStates for the next render cycle
    prevBoostClickStatesRef.current = boostClickStates;
  }, [boostClickStates, onInvestmentBoosted]); // Dependencies for the effect

  const handleBoostClick = (index) => {
    setBoostClickStates(prevClickStates => {
      const newClickStates = [...prevClickStates];

      if (newClickStates[index].boosted) return prevClickStates; // Already boosted, no change

      const newClicks = newClickStates[index].clicks + 1;
      const newBoosted = newClicks >= 100;

      newClickStates[index] = {
        clicks: newClicks,
        boosted: newBoosted,
      };

      // Persist click counts and boosted status to localStorage
      localStorage.setItem(`boosted-${index}`, JSON.stringify(newBoosted));
      localStorage.setItem(`boostClicks-${index}`, newClicks.toString());

      return newClickStates;
    });
  };

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">
        Investments
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
              {/* Wrap buttons in a div to control spacing between them */}
              <div className="investment-buttons-group">
                <button
                  onClick={() => buyInvestment(index)}
                  disabled={money < cost || purchased}
                  className={`premium-upgrade-button ${money < cost || purchased ? 'disabled' : ''}`}
                >
                  {purchased ? 'Purchased' : `${formatNumber(cost)} €`}
                </button>
                {/* Add boost button for each investment */}
                <button
                  onClick={() => handleBoostClick(index)}
                  disabled={!purchased || boostClickStates[index].boosted} // Disable if not purchased or already boosted
                  className={`premium-upgrade-button ${(!purchased || boostClickStates[index].boosted) ? 'disabled' : ''}`} // Apply disabled class based on new condition
                >
                  {boostClickStates[index].boosted ? "Earnings Boosted" : `Boost (${boostClickStates[index].clicks}/100)`}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}