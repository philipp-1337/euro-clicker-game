import { useCallback, useMemo, useEffect } from 'react';
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

  // Effekt zum Zählen der aktiven und inaktiven Spielzeit
  useEffect(() => {
    let activeIntervalId;
    let inactiveIntervalId;

    const clearAllTimers = () => {
      clearInterval(activeIntervalId);
      clearInterval(inactiveIntervalId);
      activeIntervalId = null;
      inactiveIntervalId = null;
    };

    const startActiveTimer = () => {
      clearAllTimers();
      activeIntervalId = setInterval(() => {
        setActivePlayTime(prev => prev + 1);
      }, 1000);
    };

    const startInactiveTimer = () => {
      clearAllTimers();
      inactiveIntervalId = setInterval(() => {
        setInactivePlayTime(prev => prev + 1);
      }, 1000);
    };

    const handleVisibilityChange = () => {
      if (!isGameStarted) { // Wenn das Spiel nicht gestartet ist, nichts tun
        clearAllTimers();
        return;
      }
      if (document.visibilityState === 'visible') {
        startActiveTimer();
      } else {
        startInactiveTimer();
      }
    };

    if (!isGameStarted) {
      // Stelle sicher, dass Timer aus sind und kein Listener hängt, wenn das Spiel nicht gestartet ist
      clearAllTimers();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      return; // Frühzeitiger Ausstieg, wenn das Spiel nicht gestartet ist
    }

    // Initiale Einrichtung der Timer und des Listeners, wenn das Spiel gestartet ist
    if (document.visibilityState === 'visible') {
      startActiveTimer();
    } else {
      startInactiveTimer();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearAllTimers();
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
    investmentCostMultiplier
  };
}