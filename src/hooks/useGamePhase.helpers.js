export function getGamePhaseRuntimeFlags(gamePhase = 'capital_phase') {
  const isCapitalPhase = gamePhase === 'capital_phase';

  return {
    isCapitalPhase,
    runCapitalTimers: isCapitalPhase,
    allowCapitalActions: isCapitalPhase,
  };
}
