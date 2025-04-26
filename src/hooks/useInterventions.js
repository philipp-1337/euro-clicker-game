import { gameConfig } from '@constants/gameConfig';

export default function useInterventions({
  money, setMoney,
  satisfaction, setSatisfaction,
  dissatisfaction, setDissatisfaction,
  interventionsState, setInterventionsState,
  setValueMultipliers,
  setCooldownReductions,
  setGlobalPriceDecrease,
  setManagers,
  setInvestments,
  ensureStartTime,
  interventionStrategy, setInterventionStrategy,
}) {
  const applyIntervention = (idx) => {
    const intervention = gameConfig.interventions[idx];
    if (interventionsState[idx]) return;

    // Prüfe Anforderungen
    if (
      satisfaction < (intervention.requiredSatisfaction || 0) ||
      dissatisfaction < (intervention.requiredDissatisfaction || 0)
    ) return;

    // Setze Strategie beim ersten Kauf einer Intervention
    if (!interventionStrategy) {
      if (intervention.unlockCondition === 'satisfaction') {
        setInterventionStrategy('satisfaction');
      } else if (intervention.unlockCondition === 'dissatisfaction') {
        setInterventionStrategy('dissatisfaction');
      }
      // 'mixed' setzt keine Strategie
    }

    // Erlaube nur Interventionen, die zur gewählten Strategie passen
    if (
      interventionStrategy &&
      intervention.unlockCondition !== 'mixed' &&
      intervention.unlockCondition !== interventionStrategy
    ) {
      return; // Blockiere Interventionen der anderen Strategie
    }

    ensureStartTime?.();

    // Ziehe Werte ab
    if (intervention.requiredSatisfaction) setSatisfaction(prev => prev - intervention.requiredSatisfaction);
    if (intervention.requiredDissatisfaction) setDissatisfaction(prev => prev - intervention.requiredDissatisfaction);

    // Effekt anwenden
    switch (intervention.effect) {
      case 'increaseAllClickerValue':
        setValueMultipliers(prev => prev.map(v => v * (1 + intervention.effectValue)));
        break;
      case 'reduceUpgradeCosts':
        setGlobalPriceDecrease(prev => prev * intervention.effectValue);
        break;
      case 'increaseInvestmentIncome':
        setInvestments(prev => prev.map((v, i) => v)); // Dummy, falls du später Investment-Multiplikatoren einbaust
        // Hier könntest du einen Investment-Multiplikator-Status einführen
        break;
      case 'instantMoney':
        setMoney(prev => prev + intervention.effectValue);
        setSatisfaction(prev => Math.max(0, prev - 10)); // Beispiel: Zufriedenheit sinkt
        break;
      case 'reduceCooldowns':
        setCooldownReductions(prev => prev.map(v => v * intervention.effectValue));
        break;
      case 'freeManagers':
        setManagers(prev => prev.map(() => true));
        break;
      case 'resetSatisfactionDissatisfaction':
        setSatisfaction(0);
        setDissatisfaction(0);
        setMoney(prev => prev + 50000);
        break;
      default:
        break;
    }

    // Intervention als gekauft markieren
    setInterventionsState(prev => {
      const updated = [...prev];
      updated[idx] = true;
      return updated;
    });
  };

  return { applyIntervention };
}