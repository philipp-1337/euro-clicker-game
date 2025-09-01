import { useCallback, useMemo, useEffect } from 'react';
import { gameConfig } from '@constants/gameConfig';

/**
 * Manages the core economy of the game including:
 * - Money management
 * - Income calculations (manager + investment income)
 * - Prestige system (shares, bonus multipliers)
 * - Total money per second calculations
 */
export default function useGameEconomy({
  money,
  setMoney,
  buttons,
  managers,
  totalMoneyPerSecond: investmentIncomePerSecond,
  prestigeShares,
  setPrestigeShares,
  setPrestigeCount,
  gameState,
  loadGameState,
  saveGame
}) {
  
  // Manager income calculation
  const managerIncomePerSecond = useMemo(() => {
    return managers.reduce((sum, hasManager, idx) => {
      if (hasManager) {
        const button = buttons[idx];
        return sum + (button.value / button.cooldownTime);
      }
      return sum;
    }, 0);
  }, [managers, buttons]);

  // Neue Berechnung: Wie viele Shares kann man sich mit dem aktuellen Geld leisten?
  const currentRunShares = useMemo(() => {
    if (typeof money !== 'number' || isNaN(money) || money <= 0) return 0;
    let shares = 0;
    let remainingMoney = money;
    let startIndex = (typeof prestigeShares === 'number' && !isNaN(prestigeShares)) ? prestigeShares : 0;
    while (true) {
      const cost = gameConfig.prestige.getShareCost(startIndex + shares);
      if (remainingMoney >= cost) {
        remainingMoney -= cost;
        shares++;
      } else {
        break;
      }
    }
    return shares;
  }, [money, prestigeShares]);

  // Calculate prestige bonus multiplier
  const prestigeBonusMultiplier = useMemo(() => {
    const effectiveTotalShares = ((typeof prestigeShares === 'number' && !isNaN(prestigeShares)) ? prestigeShares : 0);
    const bonus = 1 + (effectiveTotalShares * gameConfig.prestige.bonusPerShare);
    return (typeof bonus === 'number' && !isNaN(bonus) && bonus > 0) ? bonus : 1;
  }, [prestigeShares]);

  // Calculate total money per second
  const baseTotalMoneyPerSecond = managerIncomePerSecond + investmentIncomePerSecond;
  const totalMoneyPerSecond = (typeof baseTotalMoneyPerSecond === 'number' && !isNaN(baseTotalMoneyPerSecond)) 
    ? baseTotalMoneyPerSecond * prestigeBonusMultiplier 
    : 0;

  // Central money income effect
  useEffect(() => {
    const interval = setInterval(() => {
      const incomeThisTick = (typeof totalMoneyPerSecond === 'number' && !isNaN(totalMoneyPerSecond))
        ? totalMoneyPerSecond / (1000 / gameConfig.timing.updateInterval)
        : 0;
      setMoney(prev => {
        const currentPrev = (typeof prev === 'number' && !isNaN(prev)) ? prev : 0;
        const nextVal = currentPrev + incomeThisTick;
        return (typeof nextVal === 'number' && !isNaN(nextVal)) ? nextVal : currentPrev;
      });
    }, gameConfig.timing.updateInterval);
    return () => clearInterval(interval);
  }, [totalMoneyPerSecond, setMoney]);

  // Prestige logic
  const canPrestige = currentRunShares >= gameConfig.prestige.minSharesToPrestige;

  const prestigeGame = useCallback(() => {
    if (!canPrestige) return;
    const currentMoneyForPrestige = (typeof money === 'number' && !isNaN(money) && money > 0) ? money : 0;
    // Berechne, wie viele Shares man sich leisten kann und wie viel Geld dafür ausgegeben wird
    let sharesEarnedThisRun = 0;
    let remainingMoney = currentMoneyForPrestige;
    while (true) {
      const cost = gameConfig.prestige.getShareCost(sharesEarnedThisRun);
      if (remainingMoney >= cost) {
        remainingMoney -= cost;
        sharesEarnedThisRun++;
      } else {
        break;
      }
    }
    sharesEarnedThisRun = (typeof sharesEarnedThisRun === 'number' && !isNaN(sharesEarnedThisRun) && sharesEarnedThisRun > 0) ? sharesEarnedThisRun : 0;
    const newTotalPrestigeShares = ((typeof prestigeShares === 'number' && !isNaN(prestigeShares)) ? prestigeShares : 0) + sharesEarnedThisRun;

    // Prepare fresh state for reset
    const freshInitialState = JSON.parse(JSON.stringify(gameConfig.initialState));

    const stateToReset = {
      ...freshInitialState,
      // Preserve specific fields
      prestigeShares: (typeof newTotalPrestigeShares === 'number' && !isNaN(newTotalPrestigeShares)) ? newTotalPrestigeShares : 0,
      activePlayTime: gameState.activePlayTime,
      inactivePlayTime: gameState.inactivePlayTime,
      lastSaved: Date.now(),

      // UI settings from localStorage
      darkMode: localStorage.getItem('darkMode') === 'true',
      musicEnabled: (localStorage.getItem('musicEnabled') ?? 'true') === 'true',
      soundEffectsEnabled: (localStorage.getItem('soundEffectsEnabled') ?? 'true') === 'true',

      // Reset progression
      investments: gameConfig.initialState.investments.map(() => 0),
      boostedInvestments: gameConfig.investments.map(() => false),

      // Preserve auto-buyers on prestige
      autoBuyValueUpgradeEnabled: gameState.autoBuyValueUpgradeEnabled,
      autoBuyCooldownUpgradeEnabled: gameState.autoBuyCooldownUpgradeEnabled,
      autoBuyerUnlocked: gameState.autoBuyerUnlocked,
      cooldownAutoBuyerUnlocked: gameState.cooldownAutoBuyerUnlocked,
      globalMultiplierAutoBuyerUnlocked: gameState.globalMultiplierAutoBuyerUnlocked,
      globalPriceDecreaseAutoBuyerUnlocked: gameState.globalPriceDecreaseAutoBuyerUnlocked,
      autoBuyGlobalMultiplierEnabled: gameState.autoBuyGlobalMultiplierEnabled,
      autoBuyGlobalPriceDecreaseEnabled: gameState.autoBuyGlobalPriceDecreaseEnabled,
      autoBuyerInterval: gameState.autoBuyerInterval,
      autoBuyerBuffer: gameState.autoBuyerBuffer,
    };

    // Update prestige shares
    const finalNewTotalPrestigeShares = (typeof newTotalPrestigeShares === 'number' && !isNaN(newTotalPrestigeShares)) ? newTotalPrestigeShares : 0;
    setPrestigeShares(finalNewTotalPrestigeShares);

    // Increment prestige counter
    setPrestigeCount(prev => {
      const newCount = (typeof prev === 'number' && !isNaN(prev) ? prev + 1 : 1);
      const stateToResetWithPrestigeCount = {
        ...stateToReset,
        prestigeCount: newCount
      };
      loadGameState(stateToResetWithPrestigeCount);
      // Clear boosted investment localStorage
      gameConfig.investments.forEach((_, index) => {
        localStorage.removeItem(`boosted-${index}`);
        localStorage.removeItem(`boostClicks-${index}`);
      });
      saveGame();
      return newCount;
    });
  }, [money, prestigeShares, setPrestigeShares, setPrestigeCount, loadGameState, gameState, saveGame, canPrestige]);

  return {
    // Income calculations
    managerIncomePerSecond,
    totalMoneyPerSecond,
    
    // Prestige system
    currentRunShares,
    prestigeBonusMultiplier,
    canPrestige,
    prestigeGame,
  };
}