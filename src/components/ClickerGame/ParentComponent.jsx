import React, { useState, useEffect, useCallback } from 'react';
import Investments from './UpgradeTabs/Investments';
import Interventions from './UpgradeTabs/Interventions'; // Import Interventions
import { gameConfig } from '@constants/gameConfig';

function ParentComponent() {
  const [investments] = useState(Array(gameConfig.investments.length).fill(0));
  const [boostedInvestments, setBoostedInvestments] = useState(() => {
    return gameConfig.investments.map((investment, index) => {
      const storedValue = typeof window !== 'undefined' ? localStorage.getItem(`boosted-${index}`) : null;
      return storedValue ? JSON.parse(storedValue) : false;
    });
  });
  const [totalIncomePerSecond, setTotalIncomePerSecond] = useState(0);
  const [money, setMoney] = useState(1000); // Example initial money, now with setter

  // State for interventions
  const [unlockedInterventions, setUnlockedInterventions] = useState([]);

  const buyInvestment = (index) => {
    // ...existing buyInvestment logic...
  };

  const handleBoostedChange = (income, boosted) => {
    setBoostedInvestments(prev => {
      const newBoostedInvestments = [...prev];
      const index = gameConfig.investments.findIndex(investment => investment.income * 2 === income || investment.income === income);
      if (index !== -1) { // Ensure index is found
        newBoostedInvestments[index] = boosted;
        if (typeof window !== 'undefined') localStorage.setItem(`boosted-${index}`, JSON.stringify(boosted));
      }
      return newBoostedInvestments
    });
    recalculateTotalIncome();
  };

  const recalculateTotalIncome = useCallback(() => {
    let newTotalIncome = 0;
    gameConfig.investments.forEach((investment, index) => {
      if (investments[index]) {
        let effectiveIncome = investment.income;
        if (boostedInvestments[index]) {
          effectiveIncome = investment.income * 2;
        }
        newTotalIncome += effectiveIncome;
      }
    });
    setTotalIncomePerSecond(newTotalIncome);
  }, [investments, boostedInvestments]);

  useEffect(() => {
    recalculateTotalIncome();
  }, [investments, boostedInvestments, recalculateTotalIncome]);

  return (
    <div>
      {/* ...other components... */}
      <Investments
        money={money} // Pass the money state
        investments={investments}
        buyInvestment={buyInvestment}
        totalIncomePerSecond={totalIncomePerSecond}
        investmentCostMultiplier={1} // Set a valid default value
        onTaxiBoostedChange={handleBoostedChange}
      />
      <Interventions
        money={money}
        setMoney={setMoney}
        unlocked={unlockedInterventions}
        setUnlocked={setUnlockedInterventions}
      />
    </div>
  );
}

export default ParentComponent;
