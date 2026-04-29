const DEFAULT_PRODUCTION_HQ_ENTRY_REQUIREMENTS = {
  collectibleCoin: 10,
  goldReserve: 5,
};

export function getProductionHqEntryState({
  craftingItems = [],
  gamePhase = 'capital_phase',
  requirements = DEFAULT_PRODUCTION_HQ_ENTRY_REQUIREMENTS,
} = {}) {
  const coinCount = Math.max(0, craftingItems?.[0] ?? 0);
  const goldCount = Math.max(0, craftingItems?.[1] ?? 0);
  const requiredCoins = Math.max(0, requirements?.collectibleCoin ?? 0);
  const requiredGold = Math.max(0, requirements?.goldReserve ?? 0);
  const isCapitalPhase = gamePhase === 'capital_phase';
  const canEnterProductionHq = isCapitalPhase
    && coinCount >= requiredCoins
    && goldCount >= requiredGold;

  return {
    canEnterProductionHq,
    coinCount,
    goldCount,
    requiredCoins,
    requiredGold,
    isCapitalPhase,
  };
}
