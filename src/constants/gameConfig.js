import BasicUpgrades from '@components/ClickerGame/UpgradeTabs/BasicUpgrades';
import PremiumUpgrades from '@components/ClickerGame/UpgradeTabs/PremiumUpgrades';
import Investments from '@components/ClickerGame/UpgradeTabs/Investments';
import StateInfrastructure from '@components/ClickerGame/UpgradeTabs/StateInfrastructure';


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

    investments: [
      { name: 'Taxiunternehmen', cost: 10000, income: 10 },
      { name: 'Energydrinks', cost: 20000, income: 20 },
      { name: 'Balkonkraftwerke', cost: 30000, income: 30 },
      { name: 'Delikatessenladen', cost: 40000, income: 40 },
      { name: 'Modelabel', cost: 50000, income: 50 },
      { name: 'E-Autohersteller', cost: 60000, income: 60 },
      { name: 'E-Zigaretten', cost: 70000, income: 70 },
      { name: 'Pharma', cost: 80000, income: 80 },
    ],

    stateBuildings: [
      { name: 'Schule', costPerSecond: 10, satisfactionValue: 1 },
      { name: 'Freier ÖPNV', costPerSecond: 20, satisfactionValue: 5 },
      { name: 'Krankenversicherung', costPerSecond: 30, satisfactionValue: 10 },
      { name: 'Rüstungsindustrie', costPerSecond: -50, satisfactionValue: -50 },
      { name: 'Steuersenkung für ArbeiterInnen', costPerSecond: 40, satisfactionValue: 20 },
      { name: 'Steuersenkungen', costPerSecond: 60, satisfactionValue: 30 },
      { name: 'Parkanlagen', costPerSecond: 100, satisfactionValue: 50 },
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
      investments: [0, 0, 0, 0, 0, 0, 0, 0], // gleiche Länge wie investments-Array
      satisfaction: 0,
      stateBuildings: [0, 0, 0, 0, 0, 0, 0], // Anzahl pro Gebäude
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