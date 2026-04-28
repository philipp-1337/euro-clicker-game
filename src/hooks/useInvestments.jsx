import {
  gameConfig,
  getInvestmentBoostStateKey,
  isInvestmentBoostCompleted,
} from '@constants/gameConfig';

export default function useInvestments(
  money,
  setMoney,
  investments,
  setInvestments,
  ensureStartTime,
  easyMode = false,
  investmentBoostStates = {},
  spendMoney
) {
  // Kostenmultiplikator für easyMode berücksichtigen
  const costMultiplier = gameConfig.getCostMultiplier(easyMode);

  const totalIncomePerSecond = investments.reduce(
    (total, count, index) => {
      if (count > 0) { // Investments are marked with 1 if purchased
        const investment = gameConfig.investments[index];
        let income = investment.income;
        if (isInvestmentBoostCompleted(investment, investmentBoostStates[getInvestmentBoostStateKey(investment)])) {
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

    if (investments[index] !== 0) {
      return false;
    }

    const wasSpent = typeof spendMoney === 'function'
      ? spendMoney(investmentCost)
      : (money >= investmentCost);

    if (!wasSpent) {
      return false;
    }

    ensureStartTime?.();

    if (typeof spendMoney !== 'function') {
      setMoney((prev) => prev - investmentCost);
    }

    setInvestments((prev) => {
      const updated = [...prev];
      updated[index] = 1;
      return updated;
    });

    return true;
  };

  return { buyInvestment, totalIncomePerSecond, costMultiplier };
}
