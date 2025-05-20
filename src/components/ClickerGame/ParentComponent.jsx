import React, { useState, useEffect } from 'react';
import Investments from './UpgradeTabs/Investments';
import { gameConfig } from '@constants/gameConfig';

function ParentComponent() {
  const [investments, setInvestments] = useState(Array(gameConfig.investments.length).fill(0));
  const [boostedInvestments, setBoostedInvestments] = useState(() => {
    return gameConfig.investments.map((investment, index) => {
      const storedValue = localStorage.getItem(`boosted-${index}`);
      return storedValue ? JSON.parse(storedValue) : false;
    });
  });
  const [totalIncomePerSecond, setTotalIncomePerSecond] = useState(0);
  const [money, setMoney] = useState(1000); // Example initial money

  const buyInvestment = (index) => {
    // ...existing buyInvestment logic...
  };

  const handleBoostedChange = (income, boosted) => {
    setBoostedInvestments(prev => {
      const newBoostedInvestments = [...prev];
      const index = gameConfig.investments.findIndex(investment => investment.income * 2 === income || investment.income === income);
      newBoostedInvestments[index] = boosted;
      localStorage.setItem(`boosted-${index}`, JSON.stringify(boosted));
      return newBoostedInvestments
    });
    recalculateTotalIncome();
  };

  const recalculateTotalIncome = () => {
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
  };

  useEffect(() => {
    recalculateTotalIncome();
  }, [investments, boostedInvestments]);

  return (
    <div>
      {/* ...other components... */}
      <Investments
        money={money} // Pass the money state
        investments={investments}
        buyInvestment={buyInvestment}
        totalIncomePerSecond={totalIncomePerSecond}
        investmentCostMultiplier={/* ... */}
        onTaxiBoostedChange={handleBoostedChange}
      />
    </div>
  );
}

export default ParentComponent;
