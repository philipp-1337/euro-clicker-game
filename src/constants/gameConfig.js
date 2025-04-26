import BasicUpgrades from '@components/ClickerGame/UpgradeTabs/BasicUpgrades';
import PremiumUpgrades from '@components/ClickerGame/UpgradeTabs/PremiumUpgrades';
import Investments from '@components/ClickerGame/UpgradeTabs/Investments';
import StateInfrastructure from '@components/ClickerGame/UpgradeTabs/StateInfrastructure';
import Interventions from '@components/ClickerGame/UpgradeTabs/Interventions';

export const gameConfig = {
    // Basis-Kosten für Upgrades
    baseValueUpgradeCosts: [10, 20, 30, 40, 50],
    baseCooldownUpgradeCosts: [10, 20, 30, 40, 50],
    
    // Basis-Button-Konfiguration
    baseButtons: [
      { baseValue: 10, baseCooldownTime: 10, colorClass: 'blue', managerCost: 200 },
      { baseValue: 20, baseCooldownTime: 20, colorClass: 'green', managerCost: 1000 },
      { baseValue: 30, baseCooldownTime: 30, colorClass: 'yellow', managerCost: 2000 },
      { baseValue: 40, baseCooldownTime: 40, colorClass: 'red', managerCost: 5000 },
      { baseValue: 50, baseCooldownTime: 50, colorClass: 'purple', managerCost: 10000 },
    ],

    investments: [
      { name: 'Taxi Company', cost: 10000, income: 10 },
      { name: 'Energy Drinks', cost: 20000, income: 20 },
      { name: 'Balcony Power Plants', cost: 30000, income: 30 },
      { name: 'Delicatessen', cost: 40000, income: 40 },
      { name: 'Fashion Label', cost: 50000, income: 50 },
      { name: 'E-Car Manufacturer', cost: 60000, income: 60 },
      { name: 'E-Cigarettes', cost: 70000, income: 70 },
      { name: 'Pharma', cost: 80000, income: 80 },
      { name: 'National Airline', cost: 90000, income: 90 },
      { name: 'Space Rocket Enterprises', cost: 100000, income: 100 }, // <-- Added
    ],

    stateBuildings: [
      { name: 'School', costPerSecond: 10, satisfactionValue: 1, dissatisfactionValue: 0 },
      { name: 'Free Public Transport', costPerSecond: 20, satisfactionValue: 5, dissatisfactionValue: 0 },
      { name: 'Health Insurance', costPerSecond: 30, satisfactionValue: 10, dissatisfactionValue: 0 },
      { name: 'Tax Cut for Workers', costPerSecond: 40, satisfactionValue: 20, dissatisfactionValue: 0 },
      { name: 'Tax Cuts', costPerSecond: 60, satisfactionValue: 30, dissatisfactionValue: 0 },
      { name: 'Parks & Recreation', costPerSecond: 100, satisfactionValue: 50, dissatisfactionValue: 0 },
      { name: 'Arms Race', costPerSecond: 10, satisfactionValue: 0, dissatisfactionValue: 10 },
      { name: 'Private Prisons', costPerSecond: 20, satisfactionValue: 0, dissatisfactionValue: 20 },
    ],

    interventions: [
      {
        name: 'Bürgerdividende',
        requiredSatisfaction: 50,
        requiredDissatisfaction: 0,
        effect: 'increaseAllClickerValue',
        effectValue: 0.1,
        description: 'Erhöhe alle Klickerwerte dauerhaft um 10%.',
        unlockCondition: 'satisfaction', // Nur bei positiver Strategie
        once: true
      },
      {
        name: 'Bildungsoffensive',
        requiredSatisfaction: 30,
        requiredDissatisfaction: 0,
        effect: 'reduceUpgradeCosts',
        effectValue: 0.9,
        description: 'Reduziert Upgrade-Kosten um 10%.',
        unlockCondition: 'satisfaction',
        once: true
      },
      {
        name: 'Grüne Infrastruktur',
        requiredSatisfaction: 40,
        requiredDissatisfaction: 0,
        effect: 'increaseInvestmentIncome',
        effectValue: 0.2,
        description: 'Erhöht Einkommen aus Investments um 20%.',
        unlockCondition: 'satisfaction',
        once: true
      },
      {
        name: 'Privatisierung',
        requiredSatisfaction: 0,
        requiredDissatisfaction: 40,
        effect: 'instantMoney',
        effectValue: 20000,
        description: 'Einmaliger Geldbonus, aber Zufriedenheit sinkt dauerhaft.',
        unlockCondition: 'dissatisfaction',
        once: true
      },
      {
        name: 'Überwachungsausbau',
        requiredSatisfaction: 0,
        requiredDissatisfaction: 30,
        effect: 'reduceCooldowns',
        effectValue: 0.9,
        description: 'Reduziert Cooldown-Zeiten aller Buttons um 10%.',
        unlockCondition: 'dissatisfaction',
        once: true
      },
      {
        name: 'Steueramnestie',
        requiredSatisfaction: 0,
        requiredDissatisfaction: 50,
        effect: 'freeManagers',
        effectValue: 1,
        description: 'Alle Manager werden kostenlos.',
        unlockCondition: 'dissatisfaction',
        once: true
      },
      {
        name: 'Sozialer Ausgleich',
        requiredSatisfaction: 20,
        requiredDissatisfaction: 20,
        effect: 'resetSatisfactionDissatisfaction',
        effectValue: 1,
        description: 'Setzt beide Werte auf 0, gibt aber einen großen Geldbonus.',
        unlockCondition: 'mixed',
        once: true
      }
    ],
    
    // Upgrade-Multiplikatoren
    upgradeValueMultiplier: 1.1, // +10% pro Level
    upgradeCooldownReduction: 0.9, // -10% pro Level
    
    // Premium-Upgrade-Faktoren
    globalMultiplierIncrease: 1.05, // +5% pro Level
    
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
      globalPriceDecreaseLevel: 0,
      globalPriceDecrease: 1, // Multiplikator für Kosten (1 = 100%)
      isInvestmentUnlocked: false,
      investments: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      isStateUnlocked: false,
      satisfaction: 0,
      dissatisfaction: 0,
      stateBuildings: [0, 0, 0, 0, 0, 0, 0, 0],
      interventionsState: [false, false, false, false, false, false, false],
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
        costExponent: 1.75
      },
      globalPriceDecrease: {
        baseCost: 2500,
        costExponent: 1.75, // z.B. exponentiell steigend, anpassbar
        decreaseFactor: 0.95 // -5% pro Level (0.95^level)
      },
      unlockInvestmentCost: 20000, // Kosten für die Freischaltung des Investment-Tabs
      unlockStateCost: 25000, // Kosten für die Freischaltung des State & Infrastructure-Tabs
      unlockInterventionsCost: 50000, // Kosten für die Freischaltung des Interventions-Tabs
    },

    // Timing-Konstanten
    timing: {
      updateInterval: 100,  // 100ms für Timer-Updates
    },
    
    // UI-bezogene Konfigurationen
    ui: {
      tabs: [
        { id: 'basic', label: 'Basic Upgrades', component: BasicUpgrades },
        { id: 'premium', label: 'Premium Upgrades', component: PremiumUpgrades },
        { id: 'investments', label: 'Investments', component: Investments },
        { id: 'state', label: 'State & Infrastructure', component: StateInfrastructure },
        { id: 'interventions', label: 'Interventions', component: Interventions },
      ],
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
    },
    getBaseManagerCosts: () => gameConfig.baseButtons.map(button => button.managerCost),
  };