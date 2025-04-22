import { useEffect } from 'react';
import { gameConfig } from '@constants/gameConfig';

export default function useStateInfrastructure(
  money, setMoney,
  satisfaction, setSatisfaction,
  stateBuildings, setStateBuildings,
  ensureStartTime
) {
  const buyStateBuilding = (idx) => {
    const building = gameConfig.stateBuildings[idx];
    if (money >= building.costPerSecond && stateBuildings[idx] === 0) {
      ensureStartTime?.();
      setSatisfaction(prev => prev + building.satisfactionValue);
      setStateBuildings(prev => {
        const updated = [...prev];
        updated[idx] = 1;
        return updated;
      });
    }
  };

  // Kosten-Intervall bleibt wie gehabt
  useEffect(() => {
    const interval = setInterval(() => {
      let totalCost = 0;
      stateBuildings.forEach((active, idx) => {
        if (active) {
          totalCost += gameConfig.stateBuildings[idx].costPerSecond;
        }
      });
      // Ziehe Kosten ab oder addiere Einkommen (bei negativen Kosten)
      if (totalCost !== 0) {
        setMoney(prev => Math.max(0, prev - totalCost));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [stateBuildings, setMoney]);

  return { buyStateBuilding };
}