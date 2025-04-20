import { useEffect } from 'react';
import { gameConfig } from '@constants/gameConfig';

export default function useInvestments(money, setMoney, investments, setInvestments) {
  const totalIncomePerSecond = investments.reduce(
    (total, count, index) => total + count * gameConfig.investments[index].income,
    0
  );

  const buyInvestment = (index) => {
    const investment = gameConfig.investments[index];
    if (money >= investment.cost) {
      setMoney((prev) => prev - investment.cost);
      setInvestments((prev) => {
        const updated = [...prev];
        updated[index]++;
        return updated;
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMoney((prev) => prev + totalIncomePerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [totalIncomePerSecond, setMoney]);

  return { buyInvestment, totalIncomePerSecond };
}