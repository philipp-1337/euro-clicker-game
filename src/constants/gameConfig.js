export const gameConfig = {
    // Basis-Kosten für Upgrades
    baseValueUpgradeCosts: [10, 20, 30, 40, 50],
    baseCooldownUpgradeCosts: [10, 20, 30, 40, 50],
    
    // Basis-Button-Konfiguration
    baseButtons: [
      { baseValue: 1, baseCooldownTime: 1, colorClass: 'blue', managerCost: 100 },
      { baseValue: 2, baseCooldownTime: 2, colorClass: 'green', managerCost: 1000 },
      { baseValue: 3, baseCooldownTime: 3, colorClass: 'yellow', managerCost: 2000 },
      { baseValue: 4, baseCooldownTime: 4, colorClass: 'red', managerCost: 5000 },
      { baseValue: 5, baseCooldownTime: 5, colorClass: 'purple', managerCost: 10000 },
    ],
    
    // Upgrade-Multiplikatoren
    upgradeValueMultiplier: 1.1, // +10% pro Level
    upgradeCooldownReduction: 0.9, // -10% pro Level
    
    // Premium-Upgrade-Faktoren
    globalMultiplierIncrease: 1.05, // +5% pro Level
    offlineEarningsBaseRate: 0.2, // 20% der normalen Rate
    offlineEarningsIncreasePerLevel: 0.1, // +10% pro Level
    
    // Zeitlimits
    maxOfflineTimeInHours: 8, // Maximale Zeit für Offline-Einnahmen
    minimumOfflineTimeInSeconds: 10 // Minimale Zeit für Offline-Einnahmen
  };