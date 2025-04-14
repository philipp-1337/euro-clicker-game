import { useState, useEffect, useCallback } from 'react';
import useOfflineEarnings from './useOfflineEarnings';
import { gameConfig } from '@constants/gameConfig';
import { calculateButtons, calculateCostWithDifficulty } from '@utils/calculators';

export default function useClickerGame(easyMode = false) {
  // Hauptzustände mit Anfangswerten aus Config
  const [money, setMoney] = useState(gameConfig.initialState.money);
  const [cooldowns, setCooldowns] = useState([...gameConfig.initialState.cooldowns]);
  const [managers, setManagers] = useState([...gameConfig.initialState.managers]);
  
  // Upgrade-Zustände mit Anfangswerten aus Config
  const [valueMultipliers, setValueMultipliers] = useState([...gameConfig.initialState.valueMultipliers]);
  const [cooldownReductions, setCooldownReductions] = useState([...gameConfig.initialState.cooldownReductions]);
  const [valueUpgradeLevels, setValueUpgradeLevels] = useState([...gameConfig.initialState.valueUpgradeLevels]);
  const [cooldownUpgradeLevels, setCooldownUpgradeLevels] = useState([...gameConfig.initialState.cooldownUpgradeLevels]);
  
  // Premium-Upgrade-Zustände mit Anfangswerten aus Config
  const [globalMultiplier, setGlobalMultiplier] = useState(gameConfig.initialState.globalMultiplier);
  const [globalMultiplierLevel, setGlobalMultiplierLevel] = useState(gameConfig.initialState.globalMultiplierLevel);
  const [offlineEarningsLevel, setOfflineEarningsLevel] = useState(gameConfig.initialState.offlineEarningsLevel);

  // Kosten berechnen
  const valueUpgradeCosts = valueUpgradeLevels.map((_, i) =>
    calculateCostWithDifficulty(
      gameConfig.baseValueUpgradeCosts[i],
      valueUpgradeLevels[i],
      gameConfig.upgrades.costIncreaseFactor,
      easyMode,
      gameConfig.getCostMultiplier
    )
  );
  
  const cooldownUpgradeCosts = cooldownUpgradeLevels.map((_, i) =>
    calculateCostWithDifficulty(
      gameConfig.baseCooldownUpgradeCosts[i],
      cooldownUpgradeLevels[i],
      gameConfig.upgrades.costIncreaseFactor,
      easyMode,
      gameConfig.getCostMultiplier
    )
  );
  
  // Premium-Upgrade-Kosten mit Config-Werten
  const globalMultiplierCost = calculateCostWithDifficulty(
    gameConfig.premiumUpgrades.globalMultiplier.baseCost,
    globalMultiplierLevel,
    gameConfig.premiumUpgrades.globalMultiplier.costExponent,
    easyMode,
    gameConfig.getCostMultiplier
  );
  
  const offlineEarningsCost = calculateCostWithDifficulty(
    gameConfig.premiumUpgrades.offlineEarnings.baseCost,
    offlineEarningsLevel,
    gameConfig.premiumUpgrades.offlineEarnings.costExponent,
    easyMode,
    gameConfig.getCostMultiplier
  );

  // Buttons mit aktualisierten Werten berechnen
  const buttons = calculateButtons(
    gameConfig.baseButtons,
    valueMultipliers,
    globalMultiplier,
    cooldownReductions
  );


  const handleClick = useCallback((index) => {
    if (cooldowns[index] <= 0) {
      setMoney(prevMoney => prevMoney + buttons[index].value);
  
      setCooldowns(prevCooldowns => {
        const newCooldowns = [...prevCooldowns];
        newCooldowns[index] = buttons[index].cooldownTime;
        return newCooldowns;
      });
    }
  }, [cooldowns, buttons, setMoney, setCooldowns]);

  // Offline-Einnahmen initialisieren
  useOfflineEarnings({
    offlineEarningsLevel,
    managers,
    buttons,
    setMoney
  });

  // Cooldown-Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prevCooldowns => 
        prevCooldowns.map((cooldown, index) => {
          // Cooldown-Zeit verringern
          const newCooldown = cooldown > 0 ? cooldown - 0.1 : 0;
          
          // Wenn Manager existiert und Cooldown gerade fertig ist, Auto-Click auslösen
          if (managers[index] && cooldown > 0 && newCooldown <= 0) {
            setTimeout(() => handleClick(index), 0);
          }
          
          return newCooldown;
        })
      );
    }, gameConfig.timing.updateInterval);

    return () => clearInterval(interval);
  }, [managers, buttons, handleClick]);

  // Manager Auto-Clicking
  useEffect(() => {
    const autoClickInterval = setInterval(() => {
      managers.forEach((hasManager, index) => {
        if (hasManager && cooldowns[index] <= 0) {
          handleClick(index);
        }
      });
    }, gameConfig.timing.updateInterval);

    return () => clearInterval(autoClickInterval);
  }, [managers, cooldowns, buttons, handleClick]);

  function buyManager(index, cost) {
    if (money >= cost && !managers[index]) {
      setMoney(prevMoney => prevMoney - cost);
      setManagers(prevManagers => {
        const newManagers = [...prevManagers];
        newManagers[index] = true;
        return newManagers;
      });
    }
  }

  function buyValueUpgrade(index) {
    const cost = valueUpgradeCosts[index];
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setValueMultipliers(prev => {
        const updated = [...prev];
        updated[index] *= gameConfig.upgrades.valueMultiplierFactor;
        return updated;
      });
      setValueUpgradeLevels(prev => {
        const updated = [...prev];
        updated[index]++;
        return updated;
      });
    }
  }

  function buyCooldownUpgrade(index) {
    const cost = cooldownUpgradeCosts[index];
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setCooldownReductions(prev => {
        const updated = [...prev];
        updated[index] *= gameConfig.upgrades.cooldownReductionFactor;
        return updated;
      });
      setCooldownUpgradeLevels(prev => {
        const updated = [...prev];
        updated[index]++;
        return updated;
      });
    }
  }

  // Premium-Upgrade-Handler
  function buyGlobalMultiplier() {
    if (money >= globalMultiplierCost) {
      setMoney(prev => prev - globalMultiplierCost);
      setGlobalMultiplier(prev => prev * gameConfig.upgrades.globalMultiplierFactor);
      setGlobalMultiplierLevel(prev => prev + 1);
    }
  }

  function buyOfflineEarnings() {
    if (money >= offlineEarningsCost) {
      setMoney(prev => prev - offlineEarningsCost);
      setOfflineEarningsLevel(prev => prev + 1);
    }
  }

  return {
    money,
    buttons,
    cooldowns,
    managers,
    handleClick,
    buyManager,
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    buyValueUpgrade,
    buyCooldownUpgrade,
    globalMultiplier,
    globalMultiplierLevel,
    offlineEarningsLevel,
    globalMultiplierCost,
    offlineEarningsCost,
    buyGlobalMultiplier,
    buyOfflineEarnings
  };
}