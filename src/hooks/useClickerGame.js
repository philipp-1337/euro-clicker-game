import { useState, useEffect } from 'react';
import useOfflineEarnings from './useOfflineEarnings';
import { gameConfig } from '../constants/gameConfig';

export default function useClickerGame() {
  // Hauptzustände
  const [money, setMoney] = useState(0);
  const [cooldowns, setCooldowns] = useState([0, 0, 0, 0, 0]);
  const [managers, setManagers] = useState([false, false, false, false, false]);
  
  // Upgrade-Zustände
  const [valueMultipliers, setValueMultipliers] = useState([1, 1, 1, 1, 1]);
  const [cooldownReductions, setCooldownReductions] = useState([1, 1, 1, 1, 1]);
  const [valueUpgradeLevels, setValueUpgradeLevels] = useState([0, 0, 0, 0, 0]);
  const [cooldownUpgradeLevels, setCooldownUpgradeLevels] = useState([0, 0, 0, 0, 0]);
  
  // Premium-Upgrade-Zustände
  const [globalMultiplier, setGlobalMultiplier] = useState(1);
  const [globalMultiplierLevel, setGlobalMultiplierLevel] = useState(0);
  const [offlineEarningsLevel, setOfflineEarningsLevel] = useState(0);

  // Kosten berechnen
  const valueUpgradeCosts = valueUpgradeLevels.map((lvl, i) => 
    gameConfig.baseValueUpgradeCosts[i] * Math.pow(1.5, lvl));
  
  const cooldownUpgradeCosts = cooldownUpgradeLevels.map((lvl, i) => 
    gameConfig.baseCooldownUpgradeCosts[i] * Math.pow(1.5, lvl));
  
  const globalMultiplierCost = 10 * Math.pow(2, globalMultiplierLevel);
  const offlineEarningsCost = 50 * Math.pow(2.2, offlineEarningsLevel);

  // Buttons mit aktualisierten Werten berechnen
  const buttons = gameConfig.baseButtons.map((button, index) => {
    const actualValue = button.baseValue * valueMultipliers[index] * globalMultiplier;
    const actualCooldownTime = button.baseCooldownTime * cooldownReductions[index];
    return {
      ...button,
      value: actualValue,
      cooldownTime: actualCooldownTime,
      label: `+${actualValue.toLocaleString("en-GB", { minimumFractionDigits: 1 })} €`
    };
  });

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
    }, 100);

    return () => clearInterval(interval);
  }, [managers, buttons]);

  // Manager Auto-Clicking
  useEffect(() => {
    const autoClickInterval = setInterval(() => {
      managers.forEach((hasManager, index) => {
        if (hasManager && cooldowns[index] <= 0) {
          handleClick(index);
        }
      });
    }, 100);

    return () => clearInterval(autoClickInterval);
  }, [managers, cooldowns, buttons]);

  function handleClick(index) {
    if (cooldowns[index] <= 0) {
      setMoney(prevMoney => prevMoney + buttons[index].value);
      
      setCooldowns(prevCooldowns => {
        const newCooldowns = [...prevCooldowns];
        newCooldowns[index] = buttons[index].cooldownTime;
        return newCooldowns;
      });
    }
  }

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
        updated[index] *= 1.1;
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
        updated[index] *= 0.9;
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
      setGlobalMultiplier(prev => prev * 1.15); // +15% pro Level
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