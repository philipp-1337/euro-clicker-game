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

export default function useClickerGame(easyMode = false) {
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
    gameState, loadGameState,
    isInvestmentUnlocked, setIsInvestmentUnlocked,
    investments, setInvestments,
  } = gameStateHook;
  
  // Berechnungen für abgeleitete Zustände 
  const {
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplierCost,
    buttons
  } = useGameCalculations(
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    valueMultipliers,
    cooldownReductions,
    globalMultiplier,
    globalMultiplierLevel,
    easyMode
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
    gameConfig
  );

  // In useClickerGame.js, füge diese Funktion hinzu
  const addQuickMoney = useCallback(() => {
    setMoney(prevMoney => prevMoney + 1);
  }, [setMoney]);
  
  // Manager-Funktionen
  const costMultiplier = gameConfig.getCostMultiplier(easyMode);
  const { buyManager } = useManagers(money, setMoney, managers, setManagers);
  // Managerkosten dynamisch berechnen
  const managerCosts = gameConfig.getBaseManagerCosts().map(cost => cost * costMultiplier);

  // Investments-Logik: Passe useInvestments an, damit es setInvestments verwendet
  const { buyInvestment, totalIncomePerSecond } = useInvestments(
    money, setMoney, investments, setInvestments
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

  // Gesamt-Einkommen pro Sekunde
  const totalMoneyPerSecond = managerIncomePerSecond + totalIncomePerSecond;


  // Cooldown-Management und Click-Handler
  const { handleClick } = useCooldowns(
    cooldowns, setCooldowns, managers, buttons, money, setMoney
  );

  // Spielzeit-Management & Setze Startzeit, falls sie noch nicht existiert
  const { playTime, ensureStartTime } = usePlaytime();
  const wrappedHandleClick = (index) => {
    ensureStartTime();
    handleClick(index);
  };

  const unlockInvestments = useCallback(() => {
    if (money >= gameConfig.premiumUpgrades.unlockInvestmentCost) {
      setMoney(prev => prev - gameConfig.premiumUpgrades.unlockInvestmentCost);
      setIsInvestmentUnlocked(true);
    }
  }, [money, setMoney, setIsInvestmentUnlocked]);

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
    totalMoneyPerSecond,
    
    // Funktionen
    handleClick: wrappedHandleClick,
    playTime,
    buyManager,
    buyValueUpgrade,
    buyCooldownUpgrade,
    buyGlobalMultiplier,
    unlockInvestments,
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
    managerCosts,
    totalIncomePerSecond
  };
}