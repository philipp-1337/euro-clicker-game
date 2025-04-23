import { gameConfig } from '@constants/gameConfig';

export default function useStateInfrastructure(
  money, setMoney,
  satisfaction, setSatisfaction,
  dissatisfaction, setDissatisfaction,
  stateBuildings, setStateBuildings,
  ensureStartTime
) {
  const buyStateBuilding = (idx) => {
    const building = gameConfig.stateBuildings[idx];
    if (money >= building.costPerSecond && stateBuildings[idx] === 0) {
      ensureStartTime?.();
      if (building.satisfactionValue > 0) {
        setSatisfaction(prev => prev + building.satisfactionValue);
      }
      if (building.dissatisfactionValue > 0) {
        setDissatisfaction(prev => prev + building.dissatisfactionValue);
      }
      setStateBuildings(prev => {
        const updated = [...prev];
        updated[idx] = 1;
        return updated;
      });
    }
  };

  return { buyStateBuilding };
}