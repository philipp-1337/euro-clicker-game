import { useState } from 'react';
import { gameConfig } from '@constants/gameConfig';

export default function useGameState(easyMode = false) {
  // Hauptzustände
  const [money, setMoney] = useState(gameConfig.initialState.money);
  const [cooldowns, setCooldowns] = useState([...gameConfig.initialState.cooldowns]);
  const [managers, setManagers] = useState([...gameConfig.initialState.managers]);
  
  // Upgrade-Zustände
  const [valueMultipliers, setValueMultipliers] = useState([...gameConfig.initialState.valueMultipliers]);
  const [cooldownReductions, setCooldownReductions] = useState([...gameConfig.initialState.cooldownReductions]);
  const [valueUpgradeLevels, setValueUpgradeLevels] = useState([...gameConfig.initialState.valueUpgradeLevels]);
  const [cooldownUpgradeLevels, setCooldownUpgradeLevels] = useState([...gameConfig.initialState.cooldownUpgradeLevels]);
  
  // Premium-Upgrade-Zustände
  const [globalMultiplier, setGlobalMultiplier] = useState(gameConfig.initialState.globalMultiplier);
  const [globalMultiplierLevel, setGlobalMultiplierLevel] = useState(gameConfig.initialState.globalMultiplierLevel);

  // NEU: Investment-Tab-Status
  const [isInvestmentUnlocked, setIsInvestmentUnlocked] = useState(
    gameConfig.initialState.isInvestmentUnlocked ?? false
  );
  // NEU: Investments
  const [investments, setInvestments] = useState(
    gameConfig.initialState.investments ?? gameConfig.investments.map(() => 0)
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
    isInvestmentUnlocked,
    investments
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
    setIsInvestmentUnlocked(savedState.isInvestmentUnlocked ?? false);
    setInvestments(savedState.investments ?? gameConfig.investments.map(() => 0));
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
    isInvestmentUnlocked, setIsInvestmentUnlocked,
    investments, setInvestments,
    
    // Save/Load
    gameState,
    loadGameState
  };
}