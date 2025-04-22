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

  return { buyStateBuilding };
}