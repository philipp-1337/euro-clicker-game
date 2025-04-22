import { useCallback, useMemo } from 'react';
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
  const { playTime, ensureStartTime } = usePlaytime();

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
    stateBuildings, setStateBuildings,
    isStateUnlocked, setIsStateUnlocked,
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
  const { buyInvestment, totalIncomePerSecond } = useInvestments(
    money, setMoney, investments, setInvestments, ensureStartTime
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

  // Spielstand-Speichern
  const stableLoadGameState = useCallback((state) => {
    loadGameState(state);
  }, [loadGameState]);
  
  const { saveGame } = useLocalStorage(gameState, stableLoadGameState);

  return {
    // Hauptzustände
    money,
    buttons,
    cooldowns,
    managers,
    investments,
    isInvestmentUnlocked,
    isStateUnlocked,
    totalMoneyPerSecond,
    satisfaction,
    stateBuildings,
    
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
    unlockStateCost
  };
}