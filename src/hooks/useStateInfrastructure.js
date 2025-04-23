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
    // Für positive Kosten: genug Geld, für negative Kosten: immer erlauben
    const canBuy = (
      (building.costPerSecond >= 0 && money >= building.costPerSecond) ||
      (building.costPerSecond < 0)
    );
    if (canBuy && stateBuildings[idx] === 0) {
      ensureStartTime?.();
      // Ziehe das Geld ab oder zahle es aus (einmalig beim Aktivieren)
      if (building.costPerSecond !== 0) {
        setMoney(prev => prev - building.costPerSecond);
      }
      if (typeof building.satisfactionValue === 'number') {
        setSatisfaction(prev => (Number.isFinite(prev) ? prev : 0) + building.satisfactionValue);
      }
      if (typeof building.dissatisfactionValue === 'number') {
        console.log('Dissatisfaction vorher:', dissatisfaction, 'Wert:', building.dissatisfactionValue);
        setDissatisfaction(prev => (Number.isFinite(prev) ? prev : 0) + building.dissatisfactionValue);
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