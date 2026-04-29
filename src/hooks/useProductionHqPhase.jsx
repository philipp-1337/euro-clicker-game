import { useCallback, useMemo } from 'react';
import { getProductionHqEntryState } from './useProductionHqPhase.helpers';

export default function useProductionHqPhase({
  craftingItems,
  gamePhase,
  setGamePhase,
  hasEnteredProductionHq,
  setHasEnteredProductionHq,
}) {
  const entryState = useMemo(() => getProductionHqEntryState({
    craftingItems,
    gamePhase,
  }), [craftingItems, gamePhase]);

  const enterProductionHq = useCallback(() => {
    if (!entryState.canEnterProductionHq || hasEnteredProductionHq) {
      return false;
    }

    setHasEnteredProductionHq(true);
    setGamePhase('hq_phase');
    return true;
  }, [
    entryState.canEnterProductionHq,
    hasEnteredProductionHq,
    setGamePhase,
    setHasEnteredProductionHq,
  ]);

  return {
    ...entryState,
    enterProductionHq,
  };
}
