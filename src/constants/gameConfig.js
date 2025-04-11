export const gameConfig = {
    // Basis-Kosten für Upgrades
    baseValueUpgradeCosts: [1, 2, 3, 4, 5],
    baseCooldownUpgradeCosts: [1, 2, 3, 4, 5],
    
    // Basis-Button-Konfiguration
    baseButtons: [
      { baseValue: 1, baseCooldownTime: 1, colorClass: 'blue', managerCost: 1 },
      { baseValue: 2, baseCooldownTime: 2, colorClass: 'green', managerCost: 5 },
      { baseValue: 3, baseCooldownTime: 3, colorClass: 'yellow', managerCost: 10 },
      { baseValue: 4, baseCooldownTime: 4, colorClass: 'red', managerCost: 20 },
      { baseValue: 5, baseCooldownTime: 5, colorClass: 'purple', managerCost: 50 }
    ],
    
    // Upgrade-Multiplikatoren
    upgradeValueMultiplier: 1.1, // +10% pro Level
    upgradeCooldownReduction: 0.9, // -10% pro Level
    
    // Premium-Upgrade-Faktoren
    globalMultiplierIncrease: 1.15, // +15% pro Level
    offlineEarningsBaseRate: 0.2, // 20% der normalen Rate
    offlineEarningsIncreasePerLevel: 0.1, // +10% pro Level
    
    // Zeitlimits
    maxOfflineTimeInHours: 8, // Maximale Zeit für Offline-Einnahmen
    minimumOfflineTimeInSeconds: 10 // Minimale Zeit für Offline-Einnahmen
  };