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
      { name: 'Taxi Company', cost: 12750, income: 7 },
      { name: 'Energy Drinks', cost: 26500, income: 16 },
      { name: 'Balcony Power Plants', cost: 38200, income: 23.5 },
      { name: 'Delicatessen', cost: 51500, income: 32 },
      { name: 'Fashion Label', cost: 68000, income: 43 },
      { name: 'E-Car Manufacturer', cost: 81250, income: 52 },
      { name: 'E-Cigarettes', cost: 95500, income: 61 },
      { name: 'Pharma', cost: 110750, income: 72 },
      { name: 'National Airline', cost: 128000, income: 84 },
      { name: 'Space Rocket Enterprises', cost: 145500, income: 97 },
    ],

    stateBuildings: [
      { name: 'School', costPerSecond: 10, satisfactionValue: 1, dissatisfactionValue: 0 },
      { name: 'Free Public Transport', costPerSecond: 20, satisfactionValue: 5, dissatisfactionValue: 0 },
      { name: 'Health Insurance', costPerSecond: 30, satisfactionValue: 10, dissatisfactionValue: 0 },
      { name: 'Tax Cut for Workers', costPerSecond: 40, satisfactionValue: 20, dissatisfactionValue: 0 },
      { name: 'Tax Cuts', costPerSecond: 60, satisfactionValue: 30, dissatisfactionValue: 0 },
      { name: 'Parks & Recreation', costPerSecond: 100, satisfactionValue: 50, dissatisfactionValue: 0 },
      { name: 'Arms Race', costPerSecond: -10, satisfactionValue: 0, dissatisfactionValue: 10 },
      { name: 'Media Manipulation', costPerSecond: -10, satisfactionValue: 0, dissatisfactionValue: 10 }, 
      { name: 'Surveillance Expansion', costPerSecond: -15, satisfactionValue: 0, dissatisfactionValue: 15 }, 
      { name: 'Private Prisons', costPerSecond: -20, satisfactionValue: 0, dissatisfactionValue: 20 }, 
      { name: 'Gig Economy Deregulation', costPerSecond: -25, satisfactionValue: 0, dissatisfactionValue: 30 }, 
      { name: 'Tax Haven Subsidies', costPerSecond: -30, satisfactionValue: 0, dissatisfactionValue: 25 }
    ],

    // Upgrade-Multiplikatoren
    upgradeValueMultiplier: 1.1, // +10% pro Level
    upgradeCooldownReduction: 0.9, // -10% pro Level
    
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
      investments: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // <-- update length to match investments array
      isStateUnlocked: false,
      satisfaction: 0,
      dissatisfaction: 0,
      stateBuildings: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // <-- update length to match stateBuildings array
      offlineEarningsLevel: 0, // Level for offline earnings
      criticalClickChanceLevel: 0, // Level for critical click chance upgrade
    },
    activePlayTime: 0, // Initial aktive Spielzeit
    inactivePlayTime: 0,    // Initial kumulierte inaktive Spiel-Zeit

    // Upgrade-Multiplikatoren
    upgrades: {
      valueMultiplierFactor: 1.1,    // 10% Steigerung pro Level
      cooldownReductionFactor: 0.9,  // 10% Reduktion pro Level
      costIncreaseFactor: 1.5        // 50% Kostensteigerung pro Level
    },

    // Premium-Upgrades Kostenberechnung
    premiumUpgrades: {
      globalMultiplier: {
        baseCost: 1000,
        costExponent: 1.4, // z.B. exponentiell steigend, anpassbar
        factor: 1.05,  // 5% Steigerung pro Level
      },
      globalPriceDecrease: {
        baseCost: 2000,
        costExponent: 1.5, // z.B. exponentiell steigend, anpassbar
        decreaseFactor: 0.95 // -5% pro Level (0.95^level)
      },
      criticalClickChance: { // New upgrade configuration
        baseCost: 3000,
        costLevelMultiplier: 1.6, // Cost increases by 0.75 * baseCost for each level
        effectPerLevel: 0.01 // 1% chance increase per level
      },
      offlineEarnings: { // Changed from unlockOfflineEarnings
        baseCost: 4000,
        costExponent: 1.7, // Cost scaling per level
        effectPerLevel: 0.05 // e.g., 5% earnings per level
      },
      unlockInvestmentCost: 20000, // Kosten für die Freischaltung des Investment-Tabs
      unlockStateCost: 2500000, // Kosten für die Freischaltung des State & Infrastructure-Tabs
      unlockInterventionsCost: 5000000, // Kosten für die Freischaltung des Interventions-Tabs
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

    // Achievement configuration
    achievements: {
      totalClicks: {
        id: 'totalClicks',
        name: 'Click Master',
        description: 'Reach 1000 total clicks',
        target: 1000,
      },
      fastMoney: {
        id: 'fastMoney',
        name: 'Quick Cash',
        description: 'Reach 222€ in under 60 seconds',
        target: 222,
        timeLimit: 60,
      },
      longPlay: {
        id: 'longPlay',
        name: 'Dedicated Player',
        description: 'Play for 5 hour total',
        target: 18000, // 5 hour in seconds
      },
      cheater: {
        id: 'cheater',
        name: 'Cheater!',
        description: 'Caught you red-handed! Your game has been reset.',
        target: 1, // Irrelevant, da Event-basiert
        hidden: true, // Wird nicht in der normalen Liste angezeigt, bis freigeschaltet
        unlocked: false, // Initial nicht freigeschaltet
      },
    }
  };

// Checkpoints für Leaderboard/Meilensteine
export const CHECKPOINTS = [
  { value: 100000, id: '100k', label: '100,000 €', firestoreCollection: 'leaderboard_100k' }, // Beispiel für separate Collections
  { value: 1000000000, id: '1B', label: '1 Billion €', firestoreCollection: 'leaderboard_1B' }  // oder wir filtern eine Collection
];