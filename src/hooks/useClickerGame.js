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
import useStateInfrastructure from './useStateInfrastructure';

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
    satisfaction, setSatisfaction,
    dissatisfaction, setDissatisfaction,
    stateBuildings, setStateBuildings,
    isStateUnlocked, setIsStateUnlocked,
    isInterventionsUnlocked, setIsInterventionsUnlocked,
    activePlayTime, setActivePlayTime,
    inactivePlayTime, setInactivePlayTime,
    offlineEarningsLevel, setOfflineEarningsLevel, // Get new state
    criticalClickChanceLevel, setCriticalClickChanceLevel, // Get new state for critical clicks
    initialOfflineDuration, // Get the initial offline duration from useGameState (calculated on load)
    boostedInvestments, // Get boosted state
    setBoostedInvestments, // Get setter for boosted state
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
  const buyGlobalPriceDecrease = useCallback(() => {
    if (money >= globalPriceDecreaseCost) {
      ensureStartTime?.();
      setMoney(prev => prev - globalPriceDecreaseCost);
      setGlobalPriceDecreaseLevel(prev => prev + 1);
      setGlobalPriceDecrease(prev => prev * gameConfig.premiumUpgrades.globalPriceDecrease.decreaseFactor);
    }
  }, [money, globalPriceDecreaseCost, setMoney, setGlobalPriceDecreaseLevel, setGlobalPriceDecrease, ensureStartTime]);

  // Kauflogik für Staatsgebäude
  const { buyStateBuilding } = useStateInfrastructure(
    money, setMoney,
    satisfaction, setSatisfaction,
    dissatisfaction, setDissatisfaction,
    stateBuildings, setStateBuildings,
    ensureStartTime
  );
  
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
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplierCost,
    gameConfig,
    ensureStartTime
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

  // Laufende Kosten für Staatsgebäude pro Sekunde berechnen
  const stateBuildingsCostPerSecond = useMemo(() => {
    return stateBuildings.reduce((sum, active, idx) => {
      if (active) {
        return sum + gameConfig.stateBuildings[idx].costPerSecond;
      }
      return sum;
    }, 0);
  }, [stateBuildings]);

  // Gesamt-Einkommen pro Sekunde
  const totalMoneyPerSecond = managerIncomePerSecond + investmentIncomePerSecond - stateBuildingsCostPerSecond;

  // Zentrale Geldberechnung pro Sekunde
  useEffect(() => {
    const interval = setInterval(() => {
      setMoney(prev => prev + totalMoneyPerSecond);
    }, 1000);
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

  // Unlock StateInfrastructure Tab
  const unlockState = useCallback(() => {
    const unlockCost = gameConfig.premiumUpgrades.unlockStateCost * costMultiplier;
    if (money >= unlockCost) {
      ensureStartTime?.();
      setMoney(prev => prev - unlockCost);
      setIsStateUnlocked(true);
    }
  }, [money, setMoney, setIsStateUnlocked, costMultiplier, ensureStartTime]);

  const unlockStateCost = gameConfig.premiumUpgrades.unlockStateCost * costMultiplier;

  // Unlock Interventions Tab
  const unlockInterventions = useCallback(() => {
    const unlockCost = gameConfig.premiumUpgrades.unlockInterventionsCost * costMultiplier;
    if (money >= unlockCost) {
      ensureStartTime?.();
      setMoney(prev => prev - unlockCost);
      setIsInterventionsUnlocked(true);
    }
  }, [money, setMoney, setIsInterventionsUnlocked, costMultiplier, ensureStartTime]);

  const interventionsUnlockCost = gameConfig.premiumUpgrades.unlockInterventionsCost * costMultiplier;

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

  const buyOfflineEarningsLevel = useCallback(() => {
    if (money >= offlineEarningsLevelCost) {
      ensureStartTime?.();
      setMoney(prev => prev - offlineEarningsLevelCost);
      setOfflineEarningsLevel(prev => prev + 1);
    }
  }, [money, offlineEarningsLevelCost, setMoney, setOfflineEarningsLevel, ensureStartTime]);

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

  const buyCriticalClickChanceLevel = useCallback(() => {
    if (money >= criticalClickChanceCost) {
      ensureStartTime?.();
      setMoney(prev => prev - criticalClickChanceCost);
      setCriticalClickChanceLevel(prev => prev + 1);
    }
  }, [money, criticalClickChanceCost, setMoney, setCriticalClickChanceLevel, ensureStartTime]);

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

  // Funktion für den Floating Click Button
  const addQuickMoney = useCallback(() => {
    ensureStartTime?.();
    const isCritical = Math.random() < currentCriticalClickChance;
    let moneyToAdd = 1; // Standard +1€
    if (isCritical) {
      moneyToAdd = totalMoneyPerSecond;
      // Hier könnte man später einen speziellen Sound für kritische Treffer einbauen
    }
    setMoney(prevMoney => prevMoney + moneyToAdd); // Add money before returning
    return { isCritical, amount: moneyToAdd }; // Return object with critical status and amount
  }, [setMoney, ensureStartTime, currentCriticalClickChance, totalMoneyPerSecond]);


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

  return {
    // Hauptzustände
    money,
    buttons,
    cooldowns,
    managers,
    investments,
    isInvestmentUnlocked,
    // isOfflineEarningsUnlocked, // No longer directly used, derived from offlineEarningsLevel
    isStateUnlocked,
    isInterventionsUnlocked,
    totalMoneyPerSecond,
    satisfaction,
    dissatisfaction,
    stateBuildings,
    activePlayTime,
    inactivePlayTime,
    
    // Funktionen 
    handleClick: wrappedHandleClick,
    playTime,
    buyManager,
    buyValueUpgrade,
    buyCooldownUpgrade,
    buyGlobalMultiplier,
    buyGlobalPriceDecrease,
    buyStateBuilding,
    unlockInvestments,
    unlockState,
    unlockInterventions,
    buyInvestment,
    saveGame,
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
    unlockStateCost,
    interventionsUnlockCost,
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
  };
}