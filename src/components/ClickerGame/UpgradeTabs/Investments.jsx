import React from 'react';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';
import { Landmark, Unlock, Car, Zap, Sunset, Sandwich, Shirt, CarFront, Cigarette, Beaker, Plane, Rocket } from 'lucide-react';

const InvestmentIcon = ({ iconName }) => {
  const icons = {
    Car,
    Zap,
    Sunset,
    Sandwich,
    Shirt,
    CarFront,
    Cigarette,
    Beaker,
    Plane,
    Rocket,
    Landmark, // fallback
  };

  const IconComponent = icons[iconName] || icons.Landmark;
  return <IconComponent className="premium-icon" />;
};

export default function Investments({ money, investments, buyInvestment, totalIncomePerSecond, investmentCostMultiplier, onInvestmentBoosted, isInvestmentUnlocked, unlockInvestments, unlockInvestmentCost }) {
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
      <h2 className="section-title">Investments</h2>
      {!isInvestmentUnlocked ? (
        <div className="premium-upgrade-card">
          <div className="premium-upgrade-header">
            <h3><Unlock className='premium-icon' />Unlock Investments</h3>
          </div>
          <p className="premium-upgrade-description">
            Unlock the Investments tab to invest in companies.
          </p>
          <div className="premium-upgrade-info">
            <div className="premium-upgrade-level">
              Status: Locked
            </div>
            {/* You may need to pass unlockInvestments and unlockInvestmentCost as props from parent */}
            {typeof unlockInvestments === 'function' && typeof unlockInvestmentCost === 'number' && (
              <button
                onClick={unlockInvestments}
                disabled={money < unlockInvestmentCost}
                className={`premium-upgrade-button ${money < unlockInvestmentCost ? 'disabled' : ''}`}
              >
                {`${formatNumber(unlockInvestmentCost)} €`}
              </button>
            )}
          </div>
        </div>
      ) : (
        gameConfig.investments.map((investment, index) => {
          const cost = investment.cost * (investmentCostMultiplier ?? 1);
          const purchased = investments[index] ? true : false;
          const isLocallyBoosted = boostClickStates[index].boosted;
          const displayedIncome = isLocallyBoosted ? investment.income * 2 : investment.income;
          return (
            <div key={index} className="premium-upgrade-card">
              <div className="premium-upgrade-header">
                <h3><InvestmentIcon iconName={investment.icon} />{investment.name}</h3>
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
                <div className="investment-buttons-group">
                  <button
                    onClick={() => buyInvestment(index)}
                    disabled={money < cost || purchased}
                    className={`premium-upgrade-button ${money < cost || purchased ? 'disabled' : ''}`}
                  >
                    {purchased ? 'Purchased' : `${formatNumber(cost)} €`}
                  </button>
                  <button
                    onClick={() => handleBoostClick(index)}
                    disabled={!purchased || boostClickStates[index].boosted}
                    className={`premium-upgrade-button ${(!purchased || boostClickStates[index].boosted) ? 'disabled' : ''}`}
                  >
                    {boostClickStates[index].boosted ? "Earnings Boosted" : `Boost (${boostClickStates[index].clicks}/100)`}
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
