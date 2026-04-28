import { useCallback, useEffect, useRef } from 'react';

export default function useAtomicMoney(money, setMoney) {
  const moneyRef = useRef(typeof money === 'number' && Number.isFinite(money) ? money : 0);

  useEffect(() => {
    moneyRef.current = typeof money === 'number' && Number.isFinite(money) ? money : 0;
  }, [money]);

  const spendMoney = useCallback((cost) => {
    const normalizedCost = Number(cost);

    if (!Number.isFinite(normalizedCost) || normalizedCost <= 0) {
      return false;
    }

    if (moneyRef.current < normalizedCost) {
      return false;
    }

    moneyRef.current -= normalizedCost;
    setMoney((previousMoney) => {
      const safePreviousMoney = Number.isFinite(previousMoney) ? previousMoney : 0;
      return Math.max(0, safePreviousMoney - normalizedCost);
    });

    return true;
  }, [setMoney]);

  return {
    moneyRef,
    spendMoney,
  };
}
