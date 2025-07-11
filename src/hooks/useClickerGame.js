import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { gameConfig } from '@constants/gameConfig';
import useGameState from './useGameState';
import useGameCalculations from './useGameCalculations';
import useUpgrades from './useUpgrades';
import useManagers from './useManagers';
import useCooldowns from './useCooldowns';
import usePlaytime from './usePlaytime';
import useLocalStorage from './useLocalStorage';
import useInvestments from './useInvestments';

export default function useClickerGame(easyMode = false, soundEffectsEnabled) {

  // Spielzeit-Management & Setze Startzeit, falls sie noch nicht existiert
  const { playTime, ensureStartTime, isGameStarted } = usePlaytime(); // isGameStarted hier holen

  // Überprüfe, ob die Startzeit gesetzt ist
  const wrappedHandleClick = (index) => {
    ensureStartTime();
    handleClick(index);
  };

  // Basis-Spielzustand
  const gameStateHook = useGameState(easyMode);
  const {
    money, setMoney,
    cooldowns, setCooldowns,
    managers, setManagers,
    valueMultipliers, setValueMultipliers,
    cooldownReductions, setCooldownReductions,
    valueUpgradeLevels, setValueUpgradeLevels,
    cooldownUpgradeLevels, setCooldownUpgradeLevels,
    globalMultiplier, setGlobalMultiplier,
    globalMultiplierLevel, setGlobalMultiplierLevel,
    globalPriceDecrease, setGlobalPriceDecrease,
    globalPriceDecreaseLevel, setGlobalPriceDecreaseLevel,
    gameState, loadGameState,
    isInvestmentUnlocked, setIsInvestmentUnlocked,
    investments, setInvestments,
    activePlayTime, setActivePlayTime,
    inactivePlayTime, setInactivePlayTime,
    offlineEarningsLevel, setOfflineEarningsLevel, // Get new state
    criticalClickChanceLevel, setCriticalClickChanceLevel, // Get new state for critical clicks
    initialOfflineDuration, // Get the initial offline duration from useGameState (calculated on load)
    boostedInvestments, // Get boosted state
    setBoostedInvestments, // Get setter for boosted state
    prestigeShares, setPrestigeShares, // Prestige shares
    prestigeCount, setPrestigeCount, // Prestige count
  } = gameStateHook;
  
  // Berechnungen für abgeleitete Zustände 
  const {
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplierCost,
    globalPriceDecreaseCost,
    buttons
  } = useGameCalculations(
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    valueMultipliers,
    cooldownReductions,
    globalMultiplier,
    globalMultiplierLevel,
    globalPriceDecrease,
    globalPriceDecreaseLevel,
    easyMode,
  );

  // Kauflogik für das neue Upgrade
  const buyGlobalPriceDecrease = useCallback((quantity = 1) => {
    ensureStartTime?.();
    let totalCalculatedCost = 0;
    let tempLevel = globalPriceDecreaseLevel;
    const currentCostMultiplier = gameConfig.getCostMultiplier(easyMode);

    for (let i = 0; i < quantity; i++) {
      const costForThisStep = gameConfig.premiumUpgrades.globalPriceDecrease.baseCost *
        Math.pow(gameConfig.premiumUpgrades.globalPriceDecrease.costExponent, tempLevel + i) *
        currentCostMultiplier;
      totalCalculatedCost += costForThisStep;
    }

    if (money >= totalCalculatedCost) {
      ensureStartTime?.();
      setMoney(prev => prev - totalCalculatedCost);
      for (let i = 0; i < quantity; i++) {
        setGlobalPriceDecreaseLevel(prev => prev + 1);
        setGlobalPriceDecrease(prev => prev * gameConfig.premiumUpgrades.globalPriceDecrease.decreaseFactor);
      }
    }
  }, [
    money,
    globalPriceDecreaseLevel,
    setMoney,
    setGlobalPriceDecreaseLevel,
    setGlobalPriceDecrease,
    ensureStartTime,
    easyMode
  ]);
  
  // Upgrade-Funktionen
  const {
    buyValueUpgrade,
    buyCooldownUpgrade,
    buyGlobalMultiplier,
  } = useUpgrades(
    money, setMoney,
    valueMultipliers, setValueMultipliers,
    cooldownReductions, setCooldownReductions,
    valueUpgradeLevels, setValueUpgradeLevels,
    cooldownUpgradeLevels, setCooldownUpgradeLevels,
    globalMultiplier, setGlobalMultiplier,
    globalMultiplierLevel, setGlobalMultiplierLevel,
    // valueUpgradeCosts, // No longer passed directly if useUpgrades recalculates or if BasicUpgrades handles display cost
    // cooldownUpgradeCosts,
    // globalMultiplierCost,
    gameConfig,
    ensureStartTime,
    easyMode, // Pass easyMode
    globalPriceDecrease // Pass globalPriceDecrease
  );

  // Manager-Funktionen
  const costMultiplier = gameConfig.getCostMultiplier(easyMode);
  const { buyManager } = useManagers(money, setMoney, managers, setManagers, ensureStartTime, soundEffectsEnabled);
  // Managerkosten dynamisch berechnen
  const managerCosts = gameConfig.getBaseManagerCosts().map(cost => cost * costMultiplier);

  // Investments-Logik: Passe useInvestments an, damit es setInvestments verwendet
  const { buyInvestment, totalIncomePerSecond: investmentIncomePerSecond, costMultiplier: investmentCostMultiplier } = useInvestments(
    money, 
    setMoney, 
    investments, 
    setInvestments, 
    ensureStartTime, 
    easyMode,
    boostedInvestments // Pass boostedInvestments state
  );

  // Manager-Einkommen pro Sekunde berechnen
  const managerIncomePerSecond = useMemo(() => {
    return managers.reduce((sum, hasManager, idx) => {
      if (hasManager) {
        // Button-Wert pro Cooldown, umgerechnet auf 1 Sekunde
        const button = buttons[idx];
        return sum + (button.value / button.cooldownTime);
      }
      return sum;
    }, 0);
  }, [managers, buttons]);

  // Calculate current run shares and prestige bonus
  const currentRunShares = useMemo(() => {
    if (typeof money !== 'number' || isNaN(money) || money <= 0) return 0; // money muss eine positive Zahl sein
    // Mindestgeld für 0.01 Anteile, um sehr kleine Brüche zu vermeiden
    const minMoneyForAnyShares = (0.01 / gameConfig.prestige.sharesPerBasePoint) * gameConfig.prestige.moneyPerBasePoint;
    if (money < minMoneyForAnyShares) return 0;

    const shares = (money / gameConfig.prestige.moneyPerBasePoint) * gameConfig.prestige.sharesPerBasePoint;
    return (typeof shares === 'number' && !isNaN(shares) && shares > 0) ? shares : 0; // Ensure the result is a number
  }, [money]);

  const prestigeBonusMultiplier = useMemo(() => {
    const effectiveTotalShares =
      ((typeof prestigeShares === 'number' && !isNaN(prestigeShares)) ? prestigeShares : 0);
    const bonus = 1 + (effectiveTotalShares * gameConfig.prestige.bonusPerShare);
    // console.log('[useClickerGame] Calculating prestigeBonusMultiplier. prestigeShares:', prestigeShares, 'Bonus:', bonus);
    return (typeof bonus === 'number' && !isNaN(bonus) && bonus > 0) ? bonus : 1; // Sicherstellen, dass der Bonus mindestens 1 ist
  }, [prestigeShares]);

  // Gesamt-Einkommen pro Sekunde
  const baseTotalMoneyPerSecond = managerIncomePerSecond + investmentIncomePerSecond;
  const totalMoneyPerSecond = (typeof baseTotalMoneyPerSecond === 'number' && !isNaN(baseTotalMoneyPerSecond)) ? baseTotalMoneyPerSecond * prestigeBonusMultiplier : 0;

  // Zentrale Geldberechnung pro Sekunde
  useEffect(() => {
    const interval = setInterval(() => {
      setMoney(prev => prev + (totalMoneyPerSecond / (1000 / gameConfig.timing.updateInterval))); // Distribute income over updateInterval
    }, 1000);
    return () => clearInterval(interval);
  }, [totalMoneyPerSecond, setMoney]); // ACHTUNG: Dieser Block wird durch den nächsten ersetzt

  // Korrigierte Zentrale Geldberechnung pro Sekunde
  useEffect(() => {
    const interval = setInterval(() => {
      const incomeThisTick = (typeof totalMoneyPerSecond === 'number' && !isNaN(totalMoneyPerSecond))
        ? totalMoneyPerSecond / (1000 / gameConfig.timing.updateInterval)
        : 0;
      setMoney(prev => {
        const currentPrev = (typeof prev === 'number' && !isNaN(prev)) ? prev : 0;
        const nextVal = currentPrev + incomeThisTick;
        return (typeof nextVal === 'number' && !isNaN(nextVal)) ? nextVal : currentPrev; // Verhindert, dass money NaN wird
      });
    }, gameConfig.timing.updateInterval); // Nutze das konfigurierte Update-Intervall
    return () => clearInterval(interval);
  }, [totalMoneyPerSecond, setMoney]);

  // Cooldown-Management und Click-Handler
  const { handleClick } = useCooldowns(
    cooldowns, setCooldowns, managers, buttons, money, setMoney, soundEffectsEnabled
  );


  // Kauflogik für Investments freischalten
  const unlockInvestments = useCallback(() => {
    const unlockCost = gameConfig.premiumUpgrades.unlockInvestmentCost * costMultiplier; // <--- Easy Mode berücksichtigen
    if (money >= unlockCost) {
      ensureStartTime?.();
      setMoney(prev => prev - unlockCost);
      setIsInvestmentUnlocked(true);
    }
  }, [money, setMoney, setIsInvestmentUnlocked, costMultiplier, ensureStartTime]);

  const unlockInvestmentCost = gameConfig.premiumUpgrades.unlockInvestmentCost * costMultiplier;

  // Offline Earnings Upgrade
  const currentOfflineEarningsFactor = useMemo(() =>
    offlineEarningsLevel * gameConfig.premiumUpgrades.offlineEarnings.effectPerLevel,
    [offlineEarningsLevel]
  );

  const offlineEarningsLevelCost = useMemo(() =>
    gameConfig.premiumUpgrades.offlineEarnings.baseCost *
    Math.pow(gameConfig.premiumUpgrades.offlineEarnings.costExponent, offlineEarningsLevel) *
    costMultiplier,
    [offlineEarningsLevel, costMultiplier]
  );

  const buyOfflineEarningsLevel = useCallback((quantity = 1) => {
    ensureStartTime?.();
    let totalCalculatedCost = 0;
    let tempLevel = offlineEarningsLevel;
    const currentCostMultiplier = gameConfig.getCostMultiplier(easyMode);

    for (let i = 0; i < quantity; i++) {
      const costForThisStep = gameConfig.premiumUpgrades.offlineEarnings.baseCost *
        Math.pow(gameConfig.premiumUpgrades.offlineEarnings.costExponent, tempLevel + i) *
        currentCostMultiplier;
      totalCalculatedCost += costForThisStep;
    }

    if (money >= totalCalculatedCost) {
      ensureStartTime?.();
      setMoney(prev => prev - totalCalculatedCost);
      for (let i = 0; i < quantity; i++) {
        setOfflineEarningsLevel(prev => prev + 1);
      }
    }
  }, [
    money,
    offlineEarningsLevel,
    setMoney,
    setOfflineEarningsLevel,
    ensureStartTime,
    easyMode
  ]);

  // Critical Click Chance Upgrade
  const currentCriticalClickChance = useMemo(() =>
    criticalClickChanceLevel * gameConfig.premiumUpgrades.criticalClickChance.effectPerLevel,
    [criticalClickChanceLevel]
  );
  
  const criticalClickChanceCost = useMemo(() =>
    gameConfig.premiumUpgrades.criticalClickChance.baseCost *
    (1 + criticalClickChanceLevel * gameConfig.premiumUpgrades.criticalClickChance.costLevelMultiplier) *
    costMultiplier,
    [criticalClickChanceLevel, costMultiplier]
  );
  
  const buyCriticalClickChanceLevel = useCallback((quantity = 1) => {
    ensureStartTime?.();
    const maxLevel = 100;
    const actualQuantity = Math.min(quantity, maxLevel - criticalClickChanceLevel);

    if (actualQuantity <= 0) return;

    let totalCalculatedCost = 0;
    let tempLevel = criticalClickChanceLevel;
    const currentCostMultiplier = gameConfig.getCostMultiplier(easyMode);

    for (let i = 0; i < actualQuantity; i++) {
      const costForThisStep = gameConfig.premiumUpgrades.criticalClickChance.baseCost *
        (1 + (tempLevel + i) * gameConfig.premiumUpgrades.criticalClickChance.costLevelMultiplier) *
        currentCostMultiplier;
      totalCalculatedCost += costForThisStep;
    }

    if (money >= totalCalculatedCost) {
      ensureStartTime?.();
      setMoney(prev => prev - totalCalculatedCost);
      for (let i = 0; i < actualQuantity; i++) {
        setCriticalClickChanceLevel(prev => prev + 1);
      }
    }
  }, [
    money,
    criticalClickChanceLevel,
    setMoney,
    setCriticalClickChanceLevel,
    ensureStartTime,
    easyMode
  ]);

  // Floating Click Value Premium Upgrade State aus gameStateHook holen
  const { floatingClickValueLevel, setFloatingClickValueLevel, floatingClickValueMultiplier, setFloatingClickValueMultiplier } = gameStateHook;

  // Kauflogik für das neue Floating Click Value Premium Upgrade
  const buyFloatingClickValue = useCallback((quantity = 1) => {
    ensureStartTime?.();
    let totalCalculatedCost = 0;
    let tempLevel = floatingClickValueLevel;
    const currentCostMultiplier = gameConfig.getCostMultiplier(easyMode);
    for (let i = 0; i < quantity; i++) {
      const costForThisStep = gameConfig.premiumUpgrades.floatingClickValue.baseCost *
        Math.pow(gameConfig.premiumUpgrades.floatingClickValue.costExponent, tempLevel + i) *
        currentCostMultiplier;
      totalCalculatedCost += costForThisStep;
    }
    if (money >= totalCalculatedCost) {
      setMoney(prev => prev - totalCalculatedCost);
      for (let i = 0; i < quantity; i++) {
        setFloatingClickValueLevel(prev => prev + 1);
        setFloatingClickValueMultiplier(prev => prev * gameConfig.premiumUpgrades.floatingClickValue.factor);
      }
    }
  }, [money, floatingClickValueLevel, setMoney, setFloatingClickValueLevel, setFloatingClickValueMultiplier, ensureStartTime, easyMode]);

  const { saveGame } = useLocalStorage(gameState, loadGameState);



   // State for "Welcome Back" modal
   // This state will be updated either by initialOfflineDuration on load
   // or by the visibilitychange handler during a session.
   const [lastInactiveDuration, setLastInactiveDuration] = useState(0); // Initialize to 0

   // State for calculated offline earnings
   const [calculatedOfflineEarnings, setCalculatedOfflineEarnings] = useState(0);

   // Effect to set lastInactiveDuration based on initialOfflineDuration after load
   useEffect(() => {
     console.log('[useClickerGame] Effect for initialOfflineDuration. Value:', initialOfflineDuration);
     if (initialOfflineDuration > 0) {
       setLastInactiveDuration(initialOfflineDuration);
     }
   }, [initialOfflineDuration]); // Watch initialOfflineDuration

  // Effect to calculate offline earnings when lastInactiveDuration changes
  // This uses 'offlineEarningsFactor'
  useEffect(() => {
  if (offlineEarningsLevel > 0 && lastInactiveDuration > 0 && totalMoneyPerSecond > 0) {
    const earnings = Math.floor(lastInactiveDuration * totalMoneyPerSecond * currentOfflineEarningsFactor);
    setCalculatedOfflineEarnings(earnings);
    console.log(`[useClickerGame] Calculated offline earnings: ${earnings} for duration ${lastInactiveDuration}s`);
  } else {
    setCalculatedOfflineEarnings(0);
  }
  }, [lastInactiveDuration, offlineEarningsLevel, totalMoneyPerSecond, currentOfflineEarningsFactor]);

  // Floating Click Button Wert-Berechnung
  const currentFloatingClickValue = useMemo(() => {
    return floatingClickValueMultiplier;
  }, [floatingClickValueMultiplier]);

  // Funktion für den Floating Click Button
  const addQuickMoney = useCallback(() => {
    ensureStartTime?.();
    const isCritical = Math.random() < currentCriticalClickChance;
    let moneyToAdd = currentFloatingClickValue; // Standardwert jetzt Upgrade-abhängig

    if (isCritical) {
      const criticalAmount = (typeof totalMoneyPerSecond === 'number' && !isNaN(totalMoneyPerSecond)) ? totalMoneyPerSecond : 0;
      moneyToAdd = Math.max(currentFloatingClickValue, criticalAmount); // Mindestens Upgrade-Wert
    }

    const finalMoneyToAdd = (typeof moneyToAdd === 'number' && !isNaN(moneyToAdd) && moneyToAdd > 0) ? moneyToAdd : currentFloatingClickValue;
    setMoney(prevMoney => {
      const currentPrevMoney = (typeof prevMoney === 'number' && !isNaN(prevMoney)) ? prevMoney : 0;
      return currentPrevMoney + finalMoneyToAdd;
    });
    return { isCritical, amount: moneyToAdd }; // Return object with critical status and amount
  }, [setMoney, ensureStartTime, currentCriticalClickChance, totalMoneyPerSecond, currentFloatingClickValue]);

  const inactiveStartTimeRef = useRef(null); // To track when inactivity period started

  const claimOfflineEarnings = useCallback(() => {
    if (calculatedOfflineEarnings > 0) {
      setMoney(prev => prev + calculatedOfflineEarnings);
      console.log(`[useClickerGame] Claimed offline earnings: ${calculatedOfflineEarnings}`);
      setCalculatedOfflineEarnings(0); // Reset after claiming
    }
  }, [calculatedOfflineEarnings, setMoney]);

  const clearLastInactiveDuration = useCallback(() => {
     setLastInactiveDuration(0);
     setCalculatedOfflineEarnings(0); // Auch berechnete Einnahmen zurücksetzen
   }, []);

  // Effekt zum Zählen der aktiven und inaktiven Spielzeit
  useEffect(() => {
    let activeIntervalId;
    // inactiveIntervalId wird nicht mehr benötigt

    const clearActiveTimer = () => { // Umbenannt, da nur noch der aktive Timer so verwaltet wird
      clearInterval(activeIntervalId);
      activeIntervalId = null;
    };

    const startActiveTimer = () => {
      clearActiveTimer(); // Stellt sicher, dass nicht mehrere aktive Timer laufen
      activeIntervalId = setInterval(() => {
        setActivePlayTime(prev => prev + 1);
      }, 1000);
    };

    // startInactiveTimer wird nicht mehr benötigt

    const handleVisibilityChange = () => {
      if (!isGameStarted) { // Wenn das Spiel nicht gestartet ist, nichts tun
        clearActiveTimer();
        inactiveStartTimeRef.current = null; // Ensure reset if game not started
        return;
      }
      if (document.visibilityState === 'visible') {
        startActiveTimer();
        if (inactiveStartTimeRef.current) {
          const inactiveMs = Date.now() - inactiveStartTimeRef.current;
          // Addiere die gerade beendete Inaktivitätsdauer zur Gesamt-Inaktivitätszeit
          const currentInactiveSeconds = Math.floor(inactiveMs / 1000);
          if (currentInactiveSeconds > 0) {
            setInactivePlayTime(prev => prev + currentInactiveSeconds);
          }
          
          inactiveStartTimeRef.current = null; // Reset after calculating
          const inactiveSeconds = Math.floor(inactiveMs / 1000);
          // Show modal if inactive for more than 5 seconds
          if (inactiveSeconds > 5) { 
            setLastInactiveDuration(inactiveSeconds);
          }
        }
      } else {
        clearActiveTimer(); // Stoppe den aktiven Timer, wenn der Tab in den Hintergrund geht
        inactiveStartTimeRef.current = Date.now(); // Record time when tab becomes hidden
      }
    };

    if (!isGameStarted) {
      // Stelle sicher, dass Timer aus sind und kein Listener hängt, wenn das Spiel nicht gestartet ist
      clearActiveTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      return; // Frühzeitiger Ausstieg, wenn das Spiel nicht gestartet ist
    }

    // Initiale Einrichtung der Timer und des Listeners, wenn das Spiel gestartet ist
    if (document.visibilityState === 'visible') {
      startActiveTimer();
      // If the game loads and is immediately visible, nullify inactiveStartTimeRef.
      // This prevents handleVisibilityChange from calculating a duration from a potentially
      // lingering ref if the tab was hidden just before a full reload.
      // initialOfflineDuration already covers the time before this load.
      inactiveStartTimeRef.current = null;
    } else {
      inactiveStartTimeRef.current = Date.now(); // Wenn das Spiel geladen wird und der Tab bereits unsichtbar ist
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearActiveTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setActivePlayTime, setInactivePlayTime, isGameStarted]);

  // Callback to handle when an investment is boosted
  const handleInvestmentBoost = useCallback((investmentIndex, isBoosted) => {
    setBoostedInvestments(prevBoosted => {
      const newBoosted = [...(prevBoosted || Array(gameConfig.investments.length).fill(false))];
      newBoosted[investmentIndex] = isBoosted;
      // Persistence to localStorage is handled by setBoostedInvestments in useGameState
      return newBoosted;
    });
  }, [setBoostedInvestments]);

  // Prestige Game Logic
  const canPrestige = currentRunShares >= gameConfig.prestige.minSharesToPrestige;

  const prestigeGame = useCallback(() => {
    if (!canPrestige) return;

    const currentMoneyForPrestige = (typeof money === 'number' && !isNaN(money) && money > 0) ? money : 0;
    let sharesEarnedThisRun = 0;
    if (currentMoneyForPrestige > 0) {
        sharesEarnedThisRun = (currentMoneyForPrestige / gameConfig.prestige.moneyPerBasePoint) * gameConfig.prestige.sharesPerBasePoint;
    }
    sharesEarnedThisRun = (typeof sharesEarnedThisRun === 'number' && !isNaN(sharesEarnedThisRun) && sharesEarnedThisRun > 0) ? sharesEarnedThisRun : 0;
    const newTotalPrestigeShares = ((typeof prestigeShares === 'number' && !isNaN(prestigeShares)) ? prestigeShares : 0) + sharesEarnedThisRun;
    // Prepare the state for reset
    const freshInitialState = JSON.parse(JSON.stringify(gameConfig.initialState));

    const stateToReset = {
      ...freshInitialState,
      // Preserve specific fields
      prestigeShares: (typeof newTotalPrestigeShares === 'number' && !isNaN(newTotalPrestigeShares)) ? newTotalPrestigeShares : 0,
      activePlayTime: gameState.activePlayTime,
      inactivePlayTime: gameState.inactivePlayTime,
      lastSaved: Date.now(), // Set lastSaved to now to avoid immediate large offline earning display
      // easyMode is a prop and will be preserved by App state
      // UI settings are in localStorage via useUiProgress
      // Dark mode from localStorage
      darkMode: localStorage.getItem('darkMode') === 'true',
      // Audio settings from localStorage
      musicEnabled: (localStorage.getItem('musicEnabled') ?? 'true') === 'true',
      soundEffectsEnabled: (localStorage.getItem('soundEffectsEnabled') ?? 'true') === 'true',
      
      // Ensure specific progression arrays/objects are truly reset
      investments: gameConfig.initialState.investments.map(() => 0),
      boostedInvestments: gameConfig.investments.map(() => false),
      // Reset managers, upgrade levels etc., by taking them from freshInitialState
    };

    // Update the persistent prestige shares state, ensuring it's a valid number
    const finalNewTotalPrestigeShares = (typeof newTotalPrestigeShares === 'number' && !isNaN(newTotalPrestigeShares)) ? newTotalPrestigeShares : 0;
    setPrestigeShares(finalNewTotalPrestigeShares);
    // Prestige-Counter erhöhen und im neuen Spielstand übernehmen
    setPrestigeCount(prev => {
      const newCount = (typeof prev === 'number' && !isNaN(prev) ? prev + 1 : 1);
      const stateToResetWithPrestigeCount = {
        ...stateToReset,
        prestigeCount: newCount
      };
      loadGameState(stateToResetWithPrestigeCount); // Apply the reset state mit neuem Counter
      // Clear individual localStorage items for boosted investments and clicks
      gameConfig.investments.forEach((_, index) => {
        localStorage.removeItem(`boosted-${index}`);
        localStorage.removeItem(`boostClicks-${index}`);
      });
      saveGame(); // Save immediately after prestige
      return newCount;
    });

    // Clear individual localStorage items for boosted investments and clicks
    gameConfig.investments.forEach((_, index) => {
      localStorage.removeItem(`boosted-${index}`);
      localStorage.removeItem(`boostClicks-${index}`);
    });
    saveGame(); // Save immediately after prestige
  }, [money, prestigeShares, setPrestigeShares, setPrestigeCount, loadGameState, gameState, saveGame, canPrestige]);

  return {
    // Hauptzustände
    money,
    buttons,
    cooldowns,
    managers,
    investments,
    isInvestmentUnlocked,
    totalMoneyPerSecond,
    activePlayTime,
    inactivePlayTime,
    prestigeShares,
    prestigeCount,
    currentRunShares,
    prestigeBonusMultiplier,
    canPrestige,
    
    // Funktionen 
    handleClick: wrappedHandleClick,
    playTime,
    buyManager,
    buyValueUpgrade,
    buyCooldownUpgrade,
    buyGlobalMultiplier,
    buyGlobalPriceDecrease,
    unlockInvestments,
    buyInvestment,
    saveGame,
    prestigeGame,
    addQuickMoney,
    handleInvestmentBoost, // Export this handler
    
    // Upgrade-Info
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplier,
    globalMultiplierLevel,
    globalMultiplierCost,
    globalPriceDecrease,
    globalPriceDecreaseLevel,
    globalPriceDecreaseCost,
    managerCosts,
    totalIncomePerSecond: totalMoneyPerSecond,
    unlockInvestmentCost,
    investmentCostMultiplier,
    offlineEarningsLevel, // Export new state
    currentOfflineEarningsFactor, // Export new calculated factor
    offlineEarningsLevelCost, // Export new cost
    buyOfflineEarningsLevel, // Export new buy function
    criticalClickChanceLevel, // Export new state for critical clicks
    currentCriticalClickChance, // Export calculated chance
    criticalClickChanceCost, // Export cost for next level
    buyCriticalClickChanceLevel, // Export buy function for critical clicks
    boostedInvestments, // Export for potential direct use or debugging
    lastInactiveDuration,
    clearLastInactiveDuration,
    calculatedOfflineEarnings,
    claimOfflineEarnings,
    floatingClickValueLevel,
    floatingClickValueMultiplier,
    buyFloatingClickValue,
    currentFloatingClickValue,
  };
}