import { useEffect } from 'react';
import { gameConfig } from '@constants/gameConfig';

export default function useStateInfrastructure(
  money, setMoney,
  satisfaction, setSatisfaction,
  stateBuildings, setStateBuildings
) {
  // Kauf-Logik: Gebäude kann nur einmal aktiviert werden
  const buyStateBuilding = (idx) => {
    const building = gameConfig.stateBuildings[idx];
    if (money >= building.costPerSecond && stateBuildings[idx] === 0) {
      setMoney(prev => prev - building.costPerSecond);
      setStateBuildings(prev => {
        const updated = [...prev];
        updated[idx] = 1;
        return updated;
      });
    }
  };

  // Effekt: Jede Sekunde Geld abziehen und Zufriedenheit gutschreiben
  useEffect(() => {
    const interval = setInterval(() => {
      let totalCost = 0;
      let totalSatisfaction = 0;
      stateBuildings.forEach((active, idx) => {
        if (active) {
          totalCost += gameConfig.stateBuildings[idx].costPerSecond;
          totalSatisfaction += gameConfig.stateBuildings[idx].satisfactionPerSecond;
        }
      });
      if (totalCost > 0) setMoney(prev => Math.max(0, prev - totalCost));
      if (totalSatisfaction !== 0) setSatisfaction(prev => prev + totalSatisfaction);
    }, 1000);
    return () => clearInterval(interval);
  }, [stateBuildings, setMoney, setSatisfaction]);

  return { buyStateBuilding };
}