import { gameConfig } from '@constants/gameConfig';

export default function useInvestments(money, setMoney, investments, setInvestments, ensureStartTime, easyMode = false) {
  // Kostenmultiplikator für easyMode berücksichtigen
  const costMultiplier = gameConfig.getCostMultiplier(easyMode);

  const totalIncomePerSecond = investments.reduce(
    (total, count, index) => total + count * gameConfig.investments[index].income,
    0
  );

  const buyInvestment = (index) => {
    const investment = gameConfig.investments[index];
    const investmentCost = investment.cost * costMultiplier;
    if (money >= investmentCost && investments[index] === 0) { // Nur kaufen, wenn noch nicht gekauft
      ensureStartTime?.();
      setMoney((prev) => prev - investmentCost);
      setInvestments((prev) => {
        const updated = [...prev];
        updated[index] = 1; // Nur einmal kaufbar
        return updated;
      });
    }
  };

  return { buyInvestment, totalIncomePerSecond, costMultiplier };
}