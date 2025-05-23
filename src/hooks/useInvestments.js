import { gameConfig } from '@constants/gameConfig';

export default function useInvestments(money, setMoney, investments, setInvestments, ensureStartTime, easyMode = false, boostedInvestments) {
  // Kostenmultiplikator für easyMode berücksichtigen
  const costMultiplier = gameConfig.getCostMultiplier(easyMode);

  const totalIncomePerSecond = investments.reduce(
    (total, count, index) => {
      if (count > 0) { // Investments are marked with 1 if purchased
        let income = gameConfig.investments[index].income;
        // Check if boostedInvestments is available and the current investment is boosted
        if (boostedInvestments && boostedInvestments[index]) {
          income *= 2; // Double the income if boosted
        }
        return total + income;
      }
      return total;
    },
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