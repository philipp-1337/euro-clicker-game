import { useCallback } from 'react';
import { gameConfig } from '@constants/gameConfig';
import useGameState from './useGameState';
import useGameCalculations from './useGameCalculations';
import useUpgrades from './useUpgrades';
import useManagers from './useManagers';
import useCooldowns from './useCooldowns';
import usePlaytime from './usePlaytime';
import useOfflineEarnings from './useOfflineEarnings';
import useLocalStorage from './useLocalStorage';

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
    offlineEarningsLevel, setOfflineEarningsLevel,
    gameState, loadGameState
  } = gameStateHook;
  
  // Berechnungen für abgeleitete Zustände 
  const {
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplierCost,
    offlineEarningsCost,
    buttons
  } = useGameCalculations(
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    valueMultipliers,
    cooldownReductions,
    globalMultiplier,
    globalMultiplierLevel,
    offlineEarningsLevel,
    easyMode
  );
  
  // Upgrade-Funktionen
  const {
    buyValueUpgrade,
    buyCooldownUpgrade,
    buyGlobalMultiplier,
    buyOfflineEarnings
  } = useUpgrades(
    money, setMoney,
    valueMultipliers, setValueMultipliers,
    cooldownReductions, setCooldownReductions,
    valueUpgradeLevels, setValueUpgradeLevels,
    cooldownUpgradeLevels, setCooldownUpgradeLevels,
    globalMultiplier, setGlobalMultiplier,
    globalMultiplierLevel, setGlobalMultiplierLevel,
    offlineEarningsLevel, setOfflineEarningsLevel,
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplierCost,
    offlineEarningsCost,
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

  // Offline-Einnahmen
  useOfflineEarnings({
    offlineEarningsLevel,
    managers,
    buttons,
    setMoney
  });

  const buyCompany = (index) => {
  const company = companies[index];
  if (money >= company.cost && !company.owned) {
    setMoney(prev => prev - company.cost);
    const updated = [...companies];
    updated[index] = { ...company, owned: true };
    setCompanies(updated);
  }
  };
  
  // Unternehmen zum Kauf
  const [money, setMoney] = useState(0);
  const [companies, setCompanies] = useState([
  {
    name: "Taxiunternehmen",
    cost: 10000,
    income: 10,
    owned: false,
    colorClass: "yellow-button"
  },
  {
    name: "Energydrink-Verkauf",
    cost: 25000,
    income: 20,
    owned: false,
    colorClass: "blue-button"
  }
  // weitere Unternehmen hier
]);


  
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
    
    // Funktionen
    handleClick: wrappedHandleClick,
    playTime,
    buyManager,
    buyValueUpgrade,
    buyCooldownUpgrade,
    buyGlobalMultiplier,
    buyOfflineEarnings,
    saveGame,
    addQuickMoney,
    
    // Upgrade-Info
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    globalMultiplier,
    globalMultiplierLevel,
    offlineEarningsLevel,
    globalMultiplierCost,
    offlineEarningsCost,
    managerCosts
  };
}
