import React, { useState, useEffect } from 'react';
import Investments from './UpgradeTabs/Investments';
import { gameConfig } from '@constants/gameConfig';

function ParentComponent() {
  const [investments, setInvestments] = useState(Array(gameConfig.investments.length).fill(0));
  const [taxiBoosted, setTaxiBoosted] = useState(() => {
    const storedValue = localStorage.getItem('taxiBoosted');
    return storedValue ? JSON.parse(storedValue) : false;
  });
  const [energyDrinksBoosted, setEnergyDrinksBoosted] = useState(() => {
    const storedValue = localStorage.getItem('energyDrinksBoosted');
    return storedValue ? JSON.parse(storedValue) : false;
  });
  const [totalIncomePerSecond, setTotalIncomePerSecond] = useState(0);

  const buyInvestment = (index) => {
    // ...existing buyInvestment logic...
  };

  const handleTaxiBoostedChange = (income, boosted) => {
    setTaxiBoosted(boosted);
    recalculateTotalIncome();
  };

  const handleEnergyDrinksBoostedChange = (income, boosted) => {
    setEnergyDrinksBoosted(boosted);
    recalculateTotalIncome();
  };

  const recalculateTotalIncome = () => {
    let newTotalIncome = 0;
    gameConfig.investments.forEach((investment, index) => {
      if (investments[index]) {
        let effectiveIncome = investment.income;
        if (investment.name === "Taxi Company" && taxiBoosted) {
          effectiveIncome = 20;
        } else if (investment.name === "Energy Drinks" && energyDrinksBoosted) {
          effectiveIncome = 40;
        }
        newTotalIncome += effectiveIncome;
      }
    });
    setTotalIncomePerSecond(newTotalIncome);
  };

  useEffect(() => {
    recalculateTotalIncome();
  }, [investments, taxiBoosted, energyDrinksBoosted]);

  return (
    <div>
      {/* ...other components... */}
      <Investments
        money={/* ... */}
        investments={investments}
        buyInvestment={buyInvestment}
        totalIncomePerSecond={totalIncomePerSecond}
        investmentCostMultiplier={/* ... */}
        onTaxiBoostedChange={handleTaxiBoostedChange}
      />
    </div>
  );
}

export default ParentComponent;
