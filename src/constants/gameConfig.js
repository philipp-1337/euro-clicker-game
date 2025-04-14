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
    minimumOfflineTimeInSeconds: 10, // Minimale Zeit für Offline-Einnahmen
    // Startbedingungen
    initialState: {
      money: 0,
      cooldowns: [0, 0, 0, 0, 0],
      managers: [false, false, false, false, false],
      valueMultipliers: [1, 1, 1, 1, 1],
      cooldownReductions: [1, 1, 1, 1, 1],
      valueUpgradeLevels: [0, 0, 0, 0, 0],
      cooldownUpgradeLevels: [0, 0, 0, 0, 0],
      globalMultiplier: 1,
      globalMultiplierLevel: 0,
      offlineEarningsLevel: 0
    },

    // Upgrade-Multiplikatoren
    upgrades: {
      valueMultiplierFactor: 1.1,    // 10% Steigerung pro Level
      cooldownReductionFactor: 0.9,  // 10% Reduktion pro Level
      globalMultiplierFactor: 1.05,  // 5% Steigerung pro Level
      costIncreaseFactor: 1.5        // 50% Kostensteigerung pro Level
    },

    // Premium-Upgrades Kostenberechnung
    premiumUpgrades: {
      globalMultiplier: {
        baseCost: 1000,
        costExponent: 2.5
      },
      offlineEarnings: {
        baseCost: 5000,
        costExponent: 2.2,
        basePercentage: 20,    // Basis-Prozentsatz bei Level 1
        percentagePerLevel: 10, // Zusätzliche Prozent pro Level
        maxOfflineHours: 8      // Maximale Offline-Zeit in Stunden
      }
    },

    // Timing-Konstanten
    timing: {
      updateInterval: 100,  // 100ms für Timer-Updates
    },
    
    // UI-bezogene Konfigurationen
    ui: {
      tabs: [
        { id: 'basic', label: 'Basic Upgrades' },
        { id: 'premium', label: 'Premium Upgrades' }
        // Leicht erweiterbar für zukünftige Tab-Typen
      ]
    },
    // Schwierigkeitseinstellungen
    difficulty: {
      normal: {
        costMultiplier: 1
      },
      easy: {
        costMultiplier: 0.01 // 1/100 der normalen Kosten
      }
    },
    // Hilfsfunktion zur Kostenberechnung mit Schwierigkeitsgrad
    getCostMultiplier: (easyMode = false) => {
      return easyMode ? gameConfig.difficulty.easy.costMultiplier : gameConfig.difficulty.normal.costMultiplier;
    }
  };