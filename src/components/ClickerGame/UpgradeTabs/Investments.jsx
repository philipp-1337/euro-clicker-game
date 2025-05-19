import React from 'react';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function Investments({ money, investments, buyInvestment, totalIncomePerSecond, investmentCostMultiplier, onTaxiBoostedChange }) {
  // Add state for taxi company boost tracking
  const [taxiClicks, setTaxiClicks] = React.useState(0);
  const [taxiBoosted, setTaxiBoosted] = React.useState(() => {
    const storedValue = localStorage.getItem('taxiBoosted');
    return storedValue ? JSON.parse(storedValue) : false;
  });
  // Add state for energy drinks boost tracking
  const [energyDrinksClicks, setEnergyDrinksClicks] = React.useState(0);
  const [energyDrinksBoosted, setEnergyDrinksBoosted] = React.useState(() => {
    const storedValue = localStorage.getItem('energyDrinksBoosted');
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const handleTaxiClick = () => {
    if (taxiBoosted) return;
    setTaxiClicks(prev => {
      const newCount = prev + 1;
      if (newCount >= 100) {
        setTaxiBoosted(true);
        localStorage.setItem('taxiBoosted', 'true'); // Save to local storage
        // Notify parent component that taxi boost has been activated
        if (onTaxiBoostedChange) {
          onTaxiBoostedChange(20, true); // Pass boosted income
        }
      }
      return newCount;
    });
  };

  const handleEnergyDrinksClick = () => {
    if (energyDrinksBoosted) return;
    setEnergyDrinksClicks(prev => {
      const newCount = prev + 1;
      if (newCount >= 100) {
        setEnergyDrinksBoosted(true);
        localStorage.setItem('energyDrinksBoosted', 'true'); // Save to local storage
        // Notify parent component that energy drinks boost has been activated
        if (onTaxiBoostedChange) {
          onTaxiBoostedChange(40, true); // Pass boosted income
        }
      }
      return newCount;
    });
  };

  React.useEffect(() => {
    // Ensure the parent component is notified when taxiBoosted changes
    if (onTaxiBoostedChange) {
      onTaxiBoostedChange(taxiBoosted ? 20 : gameConfig.investments.find(investment => investment.name === "Taxi Company").income, taxiBoosted);
    }
  }, [taxiBoosted, onTaxiBoostedChange]);

  React.useEffect(() => {
    // Ensure the parent component is notified when energyDrinksBoosted changes
    if (onTaxiBoostedChange) {
      onTaxiBoostedChange(energyDrinksBoosted ? 40 : gameConfig.investments.find(investment => investment.name === "Energy Drinks").income, energyDrinksBoosted);
    }
  }, [energyDrinksBoosted, onTaxiBoostedChange]);

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
        // For taxi company use boosted income if enabled
        const isTaxi = investment.name === "Taxi Company";
        const isEnergyDrinks = investment.name === "Energy Drinks";
        const effectiveIncome = isTaxi && taxiBoosted ? 20 : isEnergyDrinks && energyDrinksBoosted ? 40 : investment.income;
        const purchased = investments[index] ? true : false;
        return (
          <div key={index} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <h3>{investment.name}</h3>
            </div>
            <p className="premium-upgrade-description">
              {/* For taxi company adjust income display */}
              Invest {formatNumber(cost)} € to earn {formatNumber(effectiveIncome)} €/s.
            </p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Purchased: {purchased ? 'Yes' : 'No'}
              </div>
              {isTaxi && (
                // Add taxi boost button above purchasing button
                <button onClick={handleTaxiClick} className="premium-upgrade-button">
                  {taxiBoosted ? "Earnings Boosted" : `Boost Taxi (${taxiClicks}/100)`}
                </button>
              )}
              {isEnergyDrinks && (
                // Add energy drinks boost button above purchasing button
                <button onClick={handleEnergyDrinksClick} className="premium-upgrade-button">
                  {energyDrinksBoosted ? "Earnings Boosted" : `Boost Energy Drinks (${energyDrinksClicks}/100)`}
                </button>
              )}
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