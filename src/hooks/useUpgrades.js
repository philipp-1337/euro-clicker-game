export default function useUpgrades(
    money, setMoney,
    valueMultipliers, setValueMultipliers,
    cooldownReductions, setCooldownReductions,
    valueUpgradeLevels, setValueUpgradeLevels,
    cooldownUpgradeLevels, setCooldownUpgradeLevels,
    globalMultiplier, setGlobalMultiplier,
    globalMultiplierLevel, setGlobalMultiplierLevel,
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplierCost,
    gameConfig,
    ensureStartTime
  ) {
    function buyValueUpgrade(index) {
      const cost = valueUpgradeCosts[index];
      if (money >= cost) {
        ensureStartTime?.();
        setMoney(prev => prev - cost);
        setValueMultipliers(prev => {
          const updated = [...prev];
          updated[index] *= gameConfig.upgrades.valueMultiplierFactor;
          return updated;
        });
        setValueUpgradeLevels(prev => {
          const updated = [...prev];
          updated[index]++;
          return updated;
        });
      }
    }
  
    function buyCooldownUpgrade(index) {
      const cost = cooldownUpgradeCosts[index];
      if (money >= cost) {
        ensureStartTime?.();
        setMoney(prev => prev - cost);
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
  
    function buyGlobalMultiplier() {
      if (money >= globalMultiplierCost) {
        ensureStartTime?.();
        setMoney(prev => prev - globalMultiplierCost);
        setGlobalMultiplier(prev => prev * gameConfig.premiumUpgrades.globalMultiplier.factor);
        setGlobalMultiplierLevel(prev => prev + 1);
      }
    }
  
    return {
      buyValueUpgrade,
      buyCooldownUpgrade,
      buyGlobalMultiplier,
    };
  }