import { calculateCostWithDifficulty } from '@utils/calculators'; // Import the calculator

export default function useUpgrades(
    money, setMoney,
    valueMultipliers, setValueMultipliers,
    cooldownReductions, setCooldownReductions,
    valueUpgradeLevels, setValueUpgradeLevels,
    cooldownUpgradeLevels, setCooldownUpgradeLevels,
    gameConfig,
    ensureStartTime,
    easyMode, // Added
    globalPriceDecrease // Added
  ) {
    // buyValueUpgrade needs to handle quantity
    function buyValueUpgrade(index, quantity = 1) {
      ensureStartTime?.();
      // States synchron updaten, keine Geld-Prüfung mehr
      let totalCalculatedCost = 0;
      let tempLevel = valueUpgradeLevels[index];
      for (let i = 0; i < quantity; i++) {
        const costForThisStep = calculateCostWithDifficulty(
          gameConfig.baseValueUpgradeCosts[index],
          tempLevel + i,
          gameConfig.upgrades.costIncreaseFactor,
          easyMode,
          gameConfig.getCostMultiplier // Pass the function itself
        ) * globalPriceDecrease;
        totalCalculatedCost += costForThisStep;
      }
      setMoney(money - totalCalculatedCost);
      setValueMultipliers(prev => {
        const updated = [...prev];
        for (let i = 0; i < quantity; i++) {
          updated[index] *= gameConfig.upgrades.valueMultiplierFactor;
        }
        return updated;
      });
      setValueUpgradeLevels(prev => {
        const updated = [...prev];
        updated[index] += quantity;
        return updated;
      });
    }
  
    function buyCooldownUpgrade(index, quantity = 1) {
      ensureStartTime?.();

      let totalCalculatedCost = 0;
      let tempLevel = cooldownUpgradeLevels[index];

      // Calculate the actual total cost for 'quantity' upgrades
      for (let i = 0; i < quantity; i++) {
        const costForThisStep = calculateCostWithDifficulty(
          gameConfig.baseCooldownUpgradeCosts[index],
          tempLevel + i,
          gameConfig.upgrades.costIncreaseFactor,
          easyMode,
          gameConfig.getCostMultiplier // Pass the function itself
        ) * globalPriceDecrease;
        totalCalculatedCost += costForThisStep;
      }

      if (money >= totalCalculatedCost) {
        ensureStartTime?.();
        setMoney(prev => prev - totalCalculatedCost);
        for (let i = 0; i < quantity; i++) {
          // Apply effect for each upgrade
          setCooldownReductions(prev => {
            const updated = [...prev];
            updated[index] *= gameConfig.upgrades.cooldownReductionFactor;
            return updated;
          });
          setCooldownUpgradeLevels(prev => {
            const updated = [...prev];
            updated[index]++;
            return updated;
          });
        }
      }
    }
  
    return {
      buyValueUpgrade,
      buyCooldownUpgrade,
    };
  }