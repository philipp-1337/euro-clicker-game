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

export default function useClickerGame(easyMode = false) {

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

  // In useClickerGame.js, füge diese Funktion hinzu
  const addQuickMoney = useCallback(() => {
    ensureStartTime?.();
    setMoney(prevMoney => prevMoney + 1);
  }, [setMoney, ensureStartTime]);
  
  // Manager-Funktionen
  const costMultiplier = gameConfig.getCostMultiplier(easyMode);
  const { buyManager } = useManagers(money, setMoney, managers, setManagers, ensureStartTime);
  // Managerkosten dynamisch berechnen
  const managerCosts = gameConfig.getBaseManagerCosts().map(cost => cost * costMultiplier);

  // Investments-Logik: Passe useInvestments an, damit es setInvestments verwendet
  const { buyInvestment, totalIncomePerSecond, costMultiplier: investmentCostMultiplier } = useInvestments(
    money, setMoney, investments, setInvestments, ensureStartTime, easyMode
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
  const totalMoneyPerSecond = managerIncomePerSecond + totalIncomePerSecond - stateBuildingsCostPerSecond;

  // Zentrale Geldberechnung pro Sekunde
  useEffect(() => {
    const interval = setInterval(() => {
      setMoney(prev => prev + totalMoneyPerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [totalMoneyPerSecond, setMoney]);

  // Cooldown-Management und Click-Handler
  const { handleClick } = useCooldowns(
    cooldowns, setCooldowns, managers, buttons, money, setMoney
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
  
  const { saveGame } = useLocalStorage(gameState, loadGameState);

   // State for "Welcome Back" modal
   const [lastInactiveDuration, setLastInactiveDuration] = useState(0);
   const inactiveStartTimeRef = useRef(null); // To track when inactivity period started
   const clearLastInactiveDuration = useCallback(() => {
     setLastInactiveDuration(0);
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
      // Wenn das Spiel startet und der Tab sichtbar ist, aber vorher ein inactiveStartTimeRef gesetzt war (z.B. durch schnelles Neuladen im Hidden-State),
      // sollte dieser hier ggf. verarbeitet oder genullt werden, um falsche Berechnungen zu vermeiden.
      // Für den Moment ist es aber okay, da inactiveStartTimeRef.current nur gesetzt wird, wenn der Tab *aktiv* in den Hintergrund geht.
    } else {
      inactiveStartTimeRef.current = Date.now(); // Wenn das Spiel geladen wird und der Tab bereits unsichtbar ist
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearActiveTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setActivePlayTime, setInactivePlayTime, isGameStarted]);

  return {
    // Hauptzustände
    money,
    buttons,
    cooldowns,
    managers,
    investments,
    isInvestmentUnlocked,
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
    totalIncomePerSecond,
    unlockInvestmentCost,
    unlockStateCost,
    interventionsUnlockCost,
    investmentCostMultiplier,
    lastInactiveDuration,
    clearLastInactiveDuration
  };
}