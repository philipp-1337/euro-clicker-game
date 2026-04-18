import BasicUpgrades from '@components/ClickerGame/UpgradeTabs/BasicUpgrades';
import PremiumUpgrades from '@components/ClickerGame/UpgradeTabs/PremiumUpgrades';
import Investments from '@components/ClickerGame/UpgradeTabs/Investments';
import Crafting from '@components/ClickerGame/UpgradeTabs/Crafting';

const INVESTMENT_UNLOCK_COST = 20000;
const CRAFTING_UNLOCK_COST = 100000000;
const CRAFTING_UNLOCK_PRESTIGE = 1;

const investmentDefinitions = [
  {
    name: "Taxi Company",
    cost: 12750,
    income: 7,
    icon: "Car",
    roleLabel: "Manager Synergy",
    roleDescription: "Supports automated income loops and later manager-focused optimization.",
    boostType: "manager_cycle",
    boostTarget: "Manager automation",
    boostHint: "Future boosts can reward manager-driven actions and stable automation windows.",
    synergyTag: "manager",
    boostRule: {
      type: "manual_actions",
      target: 100,
      progressLabel: "dispatches",
    },
  },
  {
    name: "Energy Drinks",
    cost: 26500,
    income: 16,
    icon: "Zap",
    roleLabel: "Active Burst",
    roleDescription: "Favours short active play spikes and rewards condensed action windows.",
    boostType: "active_window",
    boostTarget: "Active play",
    boostHint: "Designed for timed challenge windows instead of flat click grinding.",
    synergyTag: "active",
    boostRule: {
      type: "timed_actions",
      target: 12,
      windowSeconds: 20,
      progressLabel: "rush actions",
    },
  },
  {
    name: "Balcony Power Plants",
    cost: 38200,
    income: 23.5,
    icon: "Sunset",
    roleLabel: "Steady Growth",
    roleDescription: "Represents stable utility income with room for efficiency-based boosts.",
    boostType: "efficiency_curve",
    boostTarget: "Passive throughput",
    boostHint: "Can later connect to uptime or consistency challenges.",
    synergyTag: "passive",
    boostRule: {
      type: "manual_actions",
      target: 100,
      progressLabel: "efficiency points",
    },
  },
  {
    name: "Delicatessen",
    cost: 51500,
    income: 32,
    icon: "Sandwich",
    roleLabel: "Cash Buffer",
    roleDescription: "Rewards disciplined spending and keeping a healthy reserve before pushing growth.",
    boostType: "reserve_bonus",
    boostTarget: "Cash reserve",
    boostHint: "Prepared for reserve-based challenge rules that check your money buffer on actions.",
    synergyTag: "economy",
    boostRule: {
      type: "reserve_challenge",
      target: 5,
      reserveMultiplier: 1.5,
      progressLabel: "reserve checks",
    },
  },
  {
    name: "Fashion Label",
    cost: 68000,
    income: 43,
    icon: "Shirt",
    roleLabel: "Momentum Brand",
    roleDescription: "Fits purchase streaks and fast follow-up decisions in the midgame.",
    boostType: "momentum_chain",
    boostTarget: "Momentum actions",
    boostHint: "Can evolve into streak-based rules once the UI exposes richer action context.",
    synergyTag: "momentum",
    boostRule: {
      type: "timed_actions",
      target: 8,
      windowSeconds: 15,
      progressLabel: "showcase actions",
    },
  },
  {
    name: "E-Car Manufacturer",
    cost: 81250,
    income: 52,
    icon: "CarFront",
    roleLabel: "Scaling Industry",
    roleDescription: "Leans into larger economy steps and future milestone-based boosts.",
    boostType: "scale_step",
    boostTarget: "Scaling milestones",
    boostHint: "Works as a placeholder for milestone or production-threshold rules later.",
    synergyTag: "scaling",
    boostRule: {
      type: "manual_actions",
      target: 120,
      progressLabel: "production steps",
    },
  },
  {
    name: "E-Cigarettes",
    cost: 95500,
    income: 61,
    icon: "Cigarette",
    roleLabel: "Risk Window",
    roleDescription: "Designed for shorter, riskier boost windows with resettable progress.",
    boostType: "risk_window",
    boostTarget: "Timed actions",
    boostHint: "Encourages a richer time-window rule without affecting current balance yet.",
    synergyTag: "timed",
    boostRule: {
      type: "timed_actions",
      target: 10,
      windowSeconds: 18,
      progressLabel: "risk actions",
    },
  },
  {
    name: "Pharma",
    cost: 110750,
    income: 72,
    icon: "Pill",
    roleLabel: "Crafting Support",
    roleDescription: "Sets up later synergy with wealth production and resource efficiency systems.",
    boostType: "crafting_support",
    boostTarget: "Crafting economy",
    boostHint: "Intended to hook into crafting costs or rare production bonuses later.",
    synergyTag: "crafting",
    boostRule: {
      type: "reserve_challenge",
      target: 6,
      reserveMultiplier: 2,
      progressLabel: "lab checks",
    },
  },
  {
    name: "National Airline",
    cost: 128000,
    income: 84,
    icon: "Plane",
    roleLabel: "Prestige Route",
    roleDescription: "Reserved for prestige-facing scaling and long-run bonuses.",
    boostType: "prestige_scale",
    boostTarget: "Prestige progression",
    boostHint: "Can later reward prestige shares, offline gains, or long-run planning.",
    synergyTag: "prestige",
    boostRule: {
      type: "manual_actions",
      target: 140,
      progressLabel: "route plans",
    },
  },
  {
    name: "Space Rocket Enterprises",
    cost: 145500,
    income: 97,
    icon: "Rocket",
    roleLabel: "Late Push",
    roleDescription: "Targets ambitious midgame bursts and future premium-style challenge rules.",
    boostType: "launch_window",
    boostTarget: "Late-game burst",
    boostHint: "Structured for more demanding timed windows once the new boost UI lands.",
    synergyTag: "burst",
    boostRule: {
      type: "timed_actions",
      target: 15,
      windowSeconds: 25,
      progressLabel: "launch actions",
    },
  },
];

export function createDefaultInvestmentBoostState(investment) {
  const target = Math.max(1, investment?.boostRule?.target ?? 100);

  return {
    boosted: false,
    ruleType: investment?.boostRule?.type ?? "manual_actions",
    currentProgress: 0,
    requiredProgress: target,
    bestProgress: 0,
    challengeWindowStartedAt: null,
    challengeWindowEndsAt: null,
    lastAdvancedAt: null,
    completedAt: null,
  };
}

export function normalizeInvestmentBoostState(investment, state) {
  const baseState = createDefaultInvestmentBoostState(investment);

  if (!state || typeof state !== "object") {
    return baseState;
  }

  const normalizedProgress = Number.isFinite(state.currentProgress)
    ? Math.max(0, state.currentProgress)
    : baseState.currentProgress;
  const normalizedBest = Number.isFinite(state.bestProgress)
    ? Math.max(0, state.bestProgress)
    : Math.max(baseState.bestProgress, normalizedProgress);
  const boosted = state.boosted === true || normalizedProgress >= baseState.requiredProgress;

  return {
    ...baseState,
    currentProgress: boosted ? baseState.requiredProgress : normalizedProgress,
    bestProgress: boosted ? baseState.requiredProgress : Math.max(normalizedBest, normalizedProgress),
    boosted,
    challengeWindowStartedAt: Number.isFinite(state.challengeWindowStartedAt)
      ? state.challengeWindowStartedAt
      : null,
    challengeWindowEndsAt: Number.isFinite(state.challengeWindowEndsAt)
      ? state.challengeWindowEndsAt
      : null,
    lastAdvancedAt: Number.isFinite(state.lastAdvancedAt) ? state.lastAdvancedAt : null,
    completedAt: Number.isFinite(state.completedAt) ? state.completedAt : null,
  };
}

export function isInvestmentBoostCompleted(investment, state) {
  return normalizeInvestmentBoostState(investment, state).boosted === true;
}

export function getBoostedInvestmentsProjection(
  investmentBoostStates,
  investments = investmentDefinitions
) {
  return investments.map((investment, index) => isInvestmentBoostCompleted(investment, investmentBoostStates?.[index]));
}

export function toPersistedInvestmentBoostState(state) {
  return {
    boosted: state?.boosted === true,
    currentProgress: Number.isFinite(state?.currentProgress) ? Math.max(0, state.currentProgress) : 0,
    bestProgress: Number.isFinite(state?.bestProgress) ? Math.max(0, state.bestProgress) : 0,
    challengeWindowStartedAt: Number.isFinite(state?.challengeWindowStartedAt)
      ? state.challengeWindowStartedAt
      : null,
    challengeWindowEndsAt: Number.isFinite(state?.challengeWindowEndsAt)
      ? state.challengeWindowEndsAt
      : null,
    lastAdvancedAt: Number.isFinite(state?.lastAdvancedAt) ? state.lastAdvancedAt : null,
    completedAt: Number.isFinite(state?.completedAt) ? state.completedAt : null,
  };
}

export function createInitialInvestmentBoostStates(investments = investmentDefinitions) {
  return investments.map((investment) => createDefaultInvestmentBoostState(investment));
}

export const gameConfig = {
  craftingCooldownSeconds: 5, // Standard-Cooldown für Crafting (Sekunden)
  // Basis-Kosten für Upgrades
  baseValueUpgradeCosts: [10, 20, 30, 40, 50],
  baseCooldownUpgradeCosts: [10, 20, 30, 40, 50],

  // Basis-Button-Konfiguration
  baseButtons: [
    {
      baseValue: 10,
      baseCooldownTime: 10,
      colorClass: "blue",
      managerCost: 200,
      label: "Savings",
      icon: "PiggyBank",
    },
    {
      baseValue: 20,
      baseCooldownTime: 20,
      colorClass: "green",
      managerCost: 1000,
      label: "Revenue",
      icon: "Banknote",
    },
    {
      baseValue: 30,
      baseCooldownTime: 30,
      colorClass: "yellow",
      managerCost: 2000,
      label: "Bonus",
      icon: "Gift",
    },
    {
      baseValue: 40,
      baseCooldownTime: 40,
      colorClass: "red",
      managerCost: 5000,
      label: "Trade",
      icon: "Handshake",
    },
    {
      baseValue: 50,
      baseCooldownTime: 50,
      colorClass: "purple",
      managerCost: 10000,
      label: "Windfall",
      icon: "Sparkles",
    },
  ],
  
  investments: investmentDefinitions,
  
  unlockInvestmentCost: INVESTMENT_UNLOCK_COST, // Kosten für die Freischaltung des Investment-Tabs

  unlockCraftingCost: CRAFTING_UNLOCK_COST,
  unlockCraftingPrestige: CRAFTING_UNLOCK_PRESTIGE,
  unlockRoadmap: [
    {
      id: "investments",
      title: "Investments",
      description: "Unlock passive companies and the midgame investment tab.",
      unlockType: "money",
      scope: "run",
      progressStrategy: "segments",
      targetValueOverrideKey: "unlockInvestmentCost",
      readyWhen: { type: "threshold", key: "money", target: "targetValue" },
      reachedWhen: { type: "flag", key: "isInvestmentUnlocked" },
      progressSegments: [
        { key: "money", target: "targetValue", start: 0, end: 100 },
      ],
      remainingRequirements: [
        { key: "money", target: "targetValue", format: "money" },
      ],
      get targetValue() {
        return gameConfig.unlockInvestmentCost;
      },
      ctaLabel: "Unlock Investments",
      previewText: "Passive companies with their own boost path.",
    },
    {
      id: "prestige",
      title: "Prestige",
      description: "Reach the first prestige threshold and open the reset loop.",
      unlockType: "money",
      scope: "career",
      progressStrategy: "segments",
      targetValueOverrideKey: "prestigeThresholdMoney",
      readyWhen: { type: "threshold", key: "money", target: "targetValue" },
      reachedWhen: { type: "threshold", key: "prestigeCount", value: 1 },
      readyLabel: "Ready to prestige",
      progressSegments: [
        { key: "money", target: "targetValue", start: 0, end: 100 },
      ],
      remainingRequirements: [
        { key: "money", target: "targetValue", format: "money" },
      ],
      get targetValue() {
        return gameConfig.prestige.minMoneyForModalButton;
      },
      ctaLabel: "Reach Prestige",
      previewText: "Reset into stronger runs with persistent prestige shares.",
    },
    {
      id: "wealthProduction",
      title: "Wealth Production",
      description: "Unlock crafting after your first prestige and start producing assets.",
      unlockType: "moneyAndPrestige",
      scope: "run",
      progressStrategy: "segments",
      targetValueOverrideKey: "craftingUnlockCost",
      targetPrestigeOverrideKey: "craftingUnlockPrestige",
      readyWhen: [
        { type: "threshold", key: "money", target: "targetValue" },
        { type: "threshold", key: "prestigeShares", target: "targetPrestige" },
      ],
      reachedWhen: { type: "flag", key: "isCraftingUnlocked" },
      readyLabel: "Ready to unlock",
      progressSegments: [
        {
          key: "money",
          target: "targetValue",
          start: 0,
          end: 25,
          maxProgress: 0.5,
        },
        { key: "prestigeShares", target: "targetPrestige", start: 25, end: 60 },
        {
          key: "money",
          target: "targetValue",
          start: 60,
          end: 100,
          requires: { type: "threshold", key: "prestigeShares", target: "targetPrestige" },
          minProgress: 0.5,
        },
      ],
      remainingRequirements: [
        { key: "money", target: "targetValue", format: "money" },
        { key: "prestigeShares", target: "targetPrestige", format: "prestige" },
      ],
      get targetValue() {
        return gameConfig.unlockCraftingCost;
      },
      get targetPrestige() {
        return gameConfig.unlockCraftingPrestige;
      },
      ctaLabel: "Unlock Wealth Production",
      previewText: "Craft assets and build a post-prestige production loop.",
    },
  ],
  rawMaterials: [
    { id: "metal", name: "Precious Metals", baseCost: 10000, costIncreaseFactor: 1.14,},
    { id: "parts", name: "Forging Instruments", baseCost: 22000, costIncreaseFactor: 1.30,},
    { id: "tech", name: "Investment Molds", baseCost: 130000, costIncreaseFactor: 5.20,},
  ],

  craftingRecipes: [
    {
      id: "collectors_coin",
      name: "Issue Collectible Coin",
      materials: [
        { id: "metal", quantity: 5 },
        { id: "parts", quantity: 2 },
      ],
      output: { money: 100000000 },
      cooldownSeconds: 50, // Individueller Cooldown für dieses Produkt
    },
    {
      id: "gold_bar",
      name: "Forge Gold Reserve",
      materials: [
        { id: "metal", quantity: 10 },
        { id: "parts", quantity: 5 },
        { id: "tech", quantity: 1 },
      ],
      output: { money: 500000000 },
      cooldownSeconds: 140, // Individueller Cooldown für dieses Produkt
    },
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
    investmentBoostStates: createInitialInvestmentBoostStates(),
    isCraftingUnlocked: false,
    craftingItems: [0, 0, 0],
    rawMaterials: { metal: 0, parts: 0, tech: 0 }, // New: Raw materials
    resourcePurchaseCounts: { metal: 0, parts: 0, tech: 0 },
    offlineEarningsLevel: 0, // Level for offline earnings
    criticalClickChanceLevel: 0, // Level for critical click chance upgrade
    floatingClickValueLevel: 1, // Start at level 1
    floatingClickValueMultiplier: 1, // Start with a multiplier of 1
    prestigeCount: 0, // Initial prestige count
    autoBuyerInterval: 1000, // Initial interval in ms
    autoBuyerBuffer: 0, // Initial buffer
    autoBuyerUnlocked: false,
    cooldownAutoBuyerUnlocked: false,
    autoBuyValueUpgradeEnabled: false,
    autoBuyCooldownUpgradeEnabled: false,
    autoBuyGlobalMultiplierEnabled: false,
    autoBuyGlobalPriceDecreaseEnabled: false,
    globalMultiplierAutoBuyerUnlocked: false,
    globalPriceDecreaseAutoBuyerUnlocked: false,
  },
  activePlayTime: 0, // Initial aktive Spielzeit
  prestigeShares: 0, // Initial prestige shares

  // Upgrade-Multiplikatoren
  upgrades: {
    valueMultiplierFactor: 1.1, // 10% Steigerung pro Level
    cooldownReductionFactor: 0.9, // 10% Reduktion pro Level
    costIncreaseFactor: 1.5, // 50% Kostensteigerung pro Level
  },

  // Premium-Upgrades Kostenberechnung
  premiumUpgrades: {
    floatingClickValue: {
      costMultiplier: 175
    },
    criticalClickChance: {
      // New upgrade configuration
      baseCost: 600,
      costLevelMultiplier: 1.5, // Cost increases by 0.75 * baseCost for each level
      effectPerLevel: 0.005, // 0.5% chance increase per level
      baseMultiplier: 1.0, // Startwert x1.0
      multiplierPerLevel: 0.1 // +10% Multiplier pro Level
    },
    globalMultiplier: {
      baseCost: 2000,
      costExponent: 1.5, // z.B. exponentiell steigend, anpassbar
      factor: 1.05, // 5% Steigerung pro Level
    },
    globalPriceDecrease: {
      baseCost: 4000,
      costExponent: 1.6, // z.B. exponentiell steigend, anpassbar
      decreaseFactor: 0.95, // 5% Kostenreduktion pro Level
    },
    offlineEarnings: {
      // Changed from unlockOfflineEarnings
      baseCost: 5000,
      costExponent: 1.9, // Cost scaling per level
      effectPerLevel: 0.025, // e.g., 5% earnings per level
    },
    autoBuyerUnlock: {
      baseCost: 50000,
    },
    cooldownAutoBuyerUnlock: {
      baseCost: 50000,
    },
    globalMultiplierAutoBuyerUnlock: {
      baseCost: 75000,
    },
    globalPriceDecreaseAutoBuyerUnlock: {
      baseCost: 75000,
    }
  },

  // Prestige-Konfiguration
  prestige: {
    moneyPerBasePoint: 1000000000, // 1 Milliarde Euro
    sharesPerBasePoint: 1, // für 1 Anteil
    bonusPerShare: 0.01, // 1% Bonus pro Anteil auf Einkommen/Sekunde
    minMoneyForModalButton: 1000000000, // 1 Milliarde für Button-Sichtbarkeit
    minSharesToPrestige: 1.0, // Mindestanteile für Prestige-Aktion
    // Neue Funktion: Kosten für den n-ten Share (progressiv, mit Sättigung)
    getShareCost: (shareIndex) => {
      // shareIndex: 0 = erster Share, 1 = zweiter Share, ...
      const base = 1000000000; // 1 Billion
      const exponent = 1.005; // Anfangs langsam, dann steiler
      const saturation = 1000000000000000000; // 1 Quintillion
      const cost = base * Math.pow(exponent, shareIndex);
      return cost >= saturation ? saturation : Math.floor(cost);
    },
    getTotalCostForShares: (numShares) => {
      // Summe der Kosten für numShares Shares
      let total = 0;
      for (let i = 0; i < numShares; i++) {
        total += gameConfig.prestige.getShareCost(i);
      }
      return total;
    },
  },

  // Timing-Konstanten
  timing: {
    updateInterval: 100, // 100ms für Timer-Updates
  },

  // UI-bezogene Konfigurationen
  ui: {
    tabs: [
      { id: "basic", label: "Basic Upgrades", component: BasicUpgrades },
      { id: "premium", label: "Premium Upgrades", component: PremiumUpgrades },
      { id: "investments", label: "Investments", component: Investments },
      { id: "crafting", label: "Wealth Production", component: Crafting },
    ],
  },
  // Schwierigkeitseinstellungen
  difficulty: {
    normal: {
      costMultiplier: 1,
    },
    easy: {
      costMultiplier: 0.01, // 1/100 der normalen Kosten
    },
  },
  // Hilfsfunktion zur Kostenberechnung mit Schwierigkeitsgrad
  getCostMultiplier: (easyMode = false) => {
    return easyMode
      ? gameConfig.difficulty.easy.costMultiplier
      : gameConfig.difficulty.normal.costMultiplier;
  },
  getBaseManagerCosts: () =>
    gameConfig.baseButtons.map((button) => button.managerCost),

  // Achievement configuration
  achievements: {
    totalClicks: {
      id: "totalClicks",
      name: "Click Master",
      description: "Reach 1000 total clicks",
      target: 1000,
    },
    fastMoney: {
      id: "fastMoney",
      name: "Quick Cash",
      description: "Reach 222€ in under 60 seconds",
      target: 222,
      timeLimit: 60,
    },
    longPlay: {
      id: "longPlay",
      name: "Dedicated Player",
      description: "Play for 5 hour total",
      target: 18000, // 5 hour in seconds
    },
    cheater: {
      id: "cheater",
      name: "Cheater!",
      description: "Caught you red-handed! Your game has been reset.",
      target: 1, // Irrelevant, da Event-basiert
      hidden: true, // Wird nicht in der normalen Liste angezeigt, bis freigeschaltet
      unlocked: false, // Initial nicht freigeschaltet
    },
  },
};

// Checkpoints für Leaderboard/Meilensteine
export const CHECKPOINTS = [
  { value: 100000, id: '100k', label: '100,000 €', firestoreCollection: 'leaderboard_100k' }, // Beispiel für separate Collections
  { value: 1000000000, id: '1B', label: '1 Billion €', firestoreCollection: 'leaderboard_1B' },  // oder wir filtern eine Collection
  { value: 10000000000000, id: '10T', label: '10 Trillion €', firestoreCollection: 'leaderboard_10T' },
  { value: 100000000000000000, id: '100Q', label: '100 Quadrillion €', firestoreCollection: 'leaderboard_100Q' },
  { value: 1000000000000000000, id: '1Qi', label: '1 Quintillion €', firestoreCollection: 'leaderboard_1Qi' }
];
