import { useState } from 'react';
import { gameConfig } from '@constants/gameConfig';

export default function useGameState(easyMode = false) {
  // Hauptzustände
  const [money, setMoney] = useState(gameConfig.initialState.money);
  const [cooldowns, setCooldowns] = useState([...gameConfig.initialState.cooldowns]);
  const [managers, setManagers] = useState([...gameConfig.initialState.managers]);
  const [satisfaction, setSatisfaction] = useState(gameConfig.initialState.satisfaction ?? 0);
  const [stateBuildings, setStateBuildings] = useState([...gameConfig.initialState.stateBuildings]);
  
  // Upgrade-Zustände
  const [valueMultipliers, setValueMultipliers] = useState([...gameConfig.initialState.valueMultipliers]);
  const [cooldownReductions, setCooldownReductions] = useState([...gameConfig.initialState.cooldownReductions]);
  const [valueUpgradeLevels, setValueUpgradeLevels] = useState([...gameConfig.initialState.valueUpgradeLevels]);
  const [cooldownUpgradeLevels, setCooldownUpgradeLevels] = useState([...gameConfig.initialState.cooldownUpgradeLevels]);
  
  // Premium-Upgrade-Zustände
  const [globalMultiplier, setGlobalMultiplier] = useState(gameConfig.initialState.globalMultiplier);
  const [globalMultiplierLevel, setGlobalMultiplierLevel] = useState(gameConfig.initialState.globalMultiplierLevel);
  const [globalPriceDecrease, setGlobalPriceDecrease] = useState(gameConfig.initialState.globalPriceDecrease);
  const [globalPriceDecreaseLevel, setGlobalPriceDecreaseLevel] = useState(gameConfig.initialState.globalPriceDecreaseLevel);


  // Investment-Tab-Status
  const [isInvestmentUnlocked, setIsInvestmentUnlocked] = useState(
    gameConfig.initialState.isInvestmentUnlocked ?? false
  );

  // Investments
  const [investments, setInvestments] = useState(
    gameConfig.initialState.investments ?? gameConfig.investments.map(() => 0)
  );

  // StateInfrastructure-Tab-Status
  const [isStateUnlocked, setIsStateUnlocked] = useState(
    gameConfig.initialState.isStateUnlocked ?? false
  );

  // Kompakter Spielzustand für Speichern/Laden
  const gameState = {
    money,
    cooldowns,
    managers,
    valueMultipliers,
    cooldownReductions,
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    globalMultiplier,
    globalMultiplierLevel,
    globalPriceDecrease,
    globalPriceDecreaseLevel,
    isInvestmentUnlocked,
    investments,
    satisfaction,
    stateBuildings,
    isStateUnlocked
  };

  // Funktion zum Setzen des kompletten Spielzustands (für Load-Funktionalität)
  const loadGameState = (savedState) => {
    if (!savedState) return;
    
    setMoney(savedState.money ?? gameConfig.initialState.money);
    setCooldowns(savedState.cooldowns ?? [...gameConfig.initialState.cooldowns]);
    setManagers(savedState.managers ?? [...gameConfig.initialState.managers]);
    setValueMultipliers(savedState.valueMultipliers ?? [...gameConfig.initialState.valueMultipliers]);
    setCooldownReductions(savedState.cooldownReductions ?? [...gameConfig.initialState.cooldownReductions]);
    setValueUpgradeLevels(savedState.valueUpgradeLevels ?? [...gameConfig.initialState.valueUpgradeLevels]);
    setCooldownUpgradeLevels(savedState.cooldownUpgradeLevels ?? [...gameConfig.initialState.cooldownUpgradeLevels]);
    setGlobalMultiplier(savedState.globalMultiplier ?? gameConfig.initialState.globalMultiplier);
    setGlobalMultiplierLevel(savedState.globalMultiplierLevel ?? gameConfig.initialState.globalMultiplierLevel);
    setGlobalPriceDecrease(savedState.globalPriceDecrease ?? gameConfig.initialState.globalPriceDecrease);
    setGlobalPriceDecreaseLevel(savedState.globalPriceDecreaseLevel ?? gameConfig.initialState.globalPriceDecreaseLevel);
    setIsInvestmentUnlocked(savedState.isInvestmentUnlocked ?? false);
    setInvestments(savedState.investments ?? gameConfig.investments.map(() => 0));
    setSatisfaction(savedState.satisfaction ?? gameConfig.initialState.satisfaction);
    setStateBuildings(savedState.stateBuildings ?? [...gameConfig.initialState.stateBuildings]);
    setIsStateUnlocked(savedState.isStateUnlocked ?? false);
  };

  return {
    // States
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
    isInvestmentUnlocked, setIsInvestmentUnlocked,
    investments, setInvestments,
    satisfaction, setSatisfaction,
    stateBuildings, setStateBuildings,
    isStateUnlocked, setIsStateUnlocked,
   
    // Save/Load
    gameState,
    loadGameState
  };
}