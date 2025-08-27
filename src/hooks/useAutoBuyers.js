import { useCallback, useMemo, useEffect, useRef } from 'react';
import { calculateCostWithDifficulty } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function useAutoBuyers({
  money,
  setMoney,
  easyMode,
  globalPriceDecrease,
  buyQuantity,
  ensureStartTime,
  
  autoBuyerUnlocked,
  setAutoBuyerUnlocked,
  cooldownAutoBuyerUnlocked,
  setCooldownAutoBuyerUnlocked,
  autoBuyValueUpgradeEnabled,
  autoBuyCooldownUpgradeEnabled,
  autoBuyerInterval,
  autoBuyerBuffer,
  
  valueUpgradeLevels,
  setValueUpgradeLevels,
  setValueMultipliers,
  
  cooldownUpgradeLevels,
  setCooldownUpgradeLevels,
  setCooldownReductions,

  autoBuyGlobalMultiplierEnabled,
  autoBuyGlobalPriceDecreaseEnabled,
  globalMultiplierAutoBuyerUnlocked,
  setGlobalMultiplierAutoBuyerUnlocked,
  globalPriceDecreaseAutoBuyerUnlocked,
  setGlobalPriceDecreaseAutoBuyerUnlocked,
  globalMultiplierLevel,
  setGlobalMultiplierLevel,
  globalPriceDecreaseLevel,
  setGlobalPriceDecreaseLevel,
  setGlobalMultiplier,
  setGlobalPriceDecrease: setGlobalPriceDecreaseState,
}) {
  
  const moneyRef = useRef(money);
  useEffect(() => { moneyRef.current = money; }, [money]);

  const globalMultiplierLevelRef = useRef(globalMultiplierLevel);
  useEffect(() => { globalMultiplierLevelRef.current = globalMultiplierLevel; }, [globalMultiplierLevel]);

  const globalPriceDecreaseLevelRef = useRef(globalPriceDecreaseLevel);
  useEffect(() => { globalPriceDecreaseLevelRef.current = globalPriceDecreaseLevel; }, [globalPriceDecreaseLevel]);

  const valueUpgradeLevelsRef = useRef(valueUpgradeLevels);
  useEffect(() => { valueUpgradeLevelsRef.current = valueUpgradeLevels; }, [valueUpgradeLevels]);

  const cooldownUpgradeLevelsRef = useRef(cooldownUpgradeLevels);
  useEffect(() => { cooldownUpgradeLevelsRef.current = cooldownUpgradeLevels; }, [cooldownUpgradeLevels]);

  const autoBuyerUnlockCost = useMemo(() =>
    gameConfig.premiumUpgrades.autoBuyerUnlock.baseCost *
    gameConfig.getCostMultiplier(easyMode),
    [easyMode]
  );

  const cooldownAutoBuyerUnlockCost = useMemo(() =>
    gameConfig.premiumUpgrades.cooldownAutoBuyerUnlock.baseCost *
    gameConfig.getCostMultiplier(easyMode),
    [easyMode]
  );

  const globalMultiplierAutoBuyerUnlockCost = useMemo(() =>
    gameConfig.premiumUpgrades.globalMultiplierAutoBuyerUnlock.baseCost *
    gameConfig.getCostMultiplier(easyMode),
    [easyMode]
  );

  const globalPriceDecreaseAutoBuyerUnlockCost = useMemo(() =>
    gameConfig.premiumUpgrades.globalPriceDecreaseAutoBuyerUnlock.baseCost *
    gameConfig.getCostMultiplier(easyMode),
    [easyMode]
  );

  const buyAutoBuyerUnlock = useCallback(() => {
    if (!autoBuyerUnlocked && money >= autoBuyerUnlockCost) {
      ensureStartTime?.();
      setMoney(prev => prev - autoBuyerUnlockCost);
      setAutoBuyerUnlocked(true);
    }
  }, [autoBuyerUnlocked, money, autoBuyerUnlockCost, setMoney, setAutoBuyerUnlocked, ensureStartTime]);

  const buyCooldownAutoBuyerUnlock = useCallback(() => {
    if (!cooldownAutoBuyerUnlocked && money >= cooldownAutoBuyerUnlockCost) {
      ensureStartTime?.();
      setMoney(prev => prev - cooldownAutoBuyerUnlockCost);
      setCooldownAutoBuyerUnlocked(true);
    }
  }, [cooldownAutoBuyerUnlocked, money, cooldownAutoBuyerUnlockCost, setMoney, setCooldownAutoBuyerUnlocked, ensureStartTime]);

  const buyGlobalMultiplierAutoBuyerUnlock = useCallback(() => {
    if (!globalMultiplierAutoBuyerUnlocked && money >= globalMultiplierAutoBuyerUnlockCost) {
      ensureStartTime?.();
      setMoney(prev => prev - globalMultiplierAutoBuyerUnlockCost);
      setGlobalMultiplierAutoBuyerUnlocked(true);
    }
  }, [globalMultiplierAutoBuyerUnlocked, money, globalMultiplierAutoBuyerUnlockCost, setMoney, setGlobalMultiplierAutoBuyerUnlocked, ensureStartTime]);

  const buyGlobalPriceDecreaseAutoBuyerUnlock = useCallback(() => {
    if (!globalPriceDecreaseAutoBuyerUnlocked && money >= globalPriceDecreaseAutoBuyerUnlockCost) {
      ensureStartTime?.();
      setMoney(prev => prev - globalPriceDecreaseAutoBuyerUnlockCost);
      setGlobalPriceDecreaseAutoBuyerUnlocked(true);
    }
  }, [globalPriceDecreaseAutoBuyerUnlocked, money, globalPriceDecreaseAutoBuyerUnlockCost, setMoney, setGlobalPriceDecreaseAutoBuyerUnlocked, ensureStartTime]);

  useEffect(() => {
    const autoBuyerLoop = () => {
      const purchases = [];

      if (autoBuyValueUpgradeEnabled) {
        let minCost = Infinity;
        let minIndex = -1;
        valueUpgradeLevelsRef.current.forEach((level, idx) => {
          const cost = calculateCostWithDifficulty(
            gameConfig.baseValueUpgradeCosts[idx],
            level,
            gameConfig.upgrades.costIncreaseFactor,
            easyMode,
            gameConfig.getCostMultiplier
          ) * globalPriceDecrease;
          if (cost < minCost) {
            minCost = cost;
            minIndex = idx;
          }
        });

        if (minIndex !== -1) {
          let totalCost = 0;
          let tempLevel = valueUpgradeLevelsRef.current[minIndex];
          for (let i = 0; i < buyQuantity; i++) {
            totalCost += calculateCostWithDifficulty(
              gameConfig.baseValueUpgradeCosts[minIndex],
              tempLevel + i,
              gameConfig.upgrades.costIncreaseFactor,
              easyMode,
              gameConfig.getCostMultiplier
            ) * globalPriceDecrease;
          }
          purchases.push({
            cost: totalCost,
            action: () => {
              setMoney(prev => prev - totalCost);
              setValueUpgradeLevels(prev => {
                const updated = [...prev];
                updated[minIndex] += buyQuantity;
                return updated;
              });
              setValueMultipliers(prev => {
                const updated = [...prev];
                for (let i = 0; i < buyQuantity; i++) {
                  updated[minIndex] *= gameConfig.upgrades.valueMultiplierFactor;
                }
                return updated;
              });
            }
          });
        }
      }

      if (autoBuyCooldownUpgradeEnabled) {
        let minCost = Infinity;
        let minIndex = -1;
        cooldownUpgradeLevelsRef.current.forEach((level, idx) => {
          const cost = calculateCostWithDifficulty(
            gameConfig.baseCooldownUpgradeCosts[idx],
            level,
            gameConfig.upgrades.costIncreaseFactor,
            easyMode,
            gameConfig.getCostMultiplier
          ) * globalPriceDecrease;
          if (cost < minCost) {
            minCost = cost;
            minIndex = idx;
          }
        });

        if (minIndex !== -1) {
          let totalCost = 0;
          let tempLevel = cooldownUpgradeLevelsRef.current[minIndex];
          for (let i = 0; i < buyQuantity; i++) {
            totalCost += calculateCostWithDifficulty(
              gameConfig.baseCooldownUpgradeCosts[minIndex],
              tempLevel + i,
              gameConfig.upgrades.costIncreaseFactor,
              easyMode,
              gameConfig.getCostMultiplier
            ) * globalPriceDecrease;
          }
          purchases.push({
            cost: totalCost,
            action: () => {
              setMoney(prev => prev - totalCost);
              setCooldownUpgradeLevels(prev => {
                const updated = [...prev];
                updated[minIndex] += buyQuantity;
                return updated;
              });
              setCooldownReductions(prev => {
                const updated = [...prev];
                for (let i = 0; i < buyQuantity; i++) {
                  updated[minIndex] *= gameConfig.upgrades.cooldownReductionFactor;
                }
                return updated;
              });
            }
          });
        }
      }

      if (autoBuyGlobalMultiplierEnabled) {
        const costMultiplier = gameConfig.getCostMultiplier(easyMode);
        let totalCost = 0;
        let currentLevel = globalMultiplierLevelRef.current;
        for (let i = 0; i < buyQuantity; i++) {
          totalCost += gameConfig.premiumUpgrades.globalMultiplier.baseCost *
            Math.pow(gameConfig.premiumUpgrades.globalMultiplier.costExponent, currentLevel + i) *
            costMultiplier;
        }
        purchases.push({
          cost: totalCost,
          action: () => {
            setMoney(prev => prev - totalCost);
            setGlobalMultiplierLevel(prev => prev + buyQuantity);
            for (let i = 0; i < buyQuantity; i++) {
              setGlobalMultiplier(prev => prev * gameConfig.premiumUpgrades.globalMultiplier.factor);
            }
          }
        });
      }

      if (autoBuyGlobalPriceDecreaseEnabled) {
        const costMultiplier = gameConfig.getCostMultiplier(easyMode);
        let totalCost = 0;
        let currentLevel = globalPriceDecreaseLevelRef.current;
        for (let i = 0; i < buyQuantity; i++) {
          totalCost += gameConfig.premiumUpgrades.globalPriceDecrease.baseCost *
            Math.pow(gameConfig.premiumUpgrades.globalPriceDecrease.costExponent, currentLevel + i) *
            costMultiplier;
        }
        purchases.push({
          cost: totalCost,
          action: () => {
            setMoney(prev => prev - totalCost);
            setGlobalPriceDecreaseLevel(prev => prev + buyQuantity);
            for (let i = 0; i < buyQuantity; i++) {
              setGlobalPriceDecreaseState(prev => prev * gameConfig.premiumUpgrades.globalPriceDecrease.decreaseFactor);
            }
          }
        });
      }

      if (purchases.length > 0) {
        purchases.sort((a, b) => a.cost - b.cost);
        const cheapestPurchase = purchases[0];
        if (moneyRef.current >= cheapestPurchase.cost + autoBuyerBuffer) {
          cheapestPurchase.action();
        }
      }
    };

    const interval = setInterval(autoBuyerLoop, autoBuyerInterval);

    return () => clearInterval(interval);
  }, [
    autoBuyValueUpgradeEnabled,
    autoBuyCooldownUpgradeEnabled,
    autoBuyGlobalMultiplierEnabled,
    autoBuyGlobalPriceDecreaseEnabled,
    easyMode,
    globalPriceDecrease,
    buyQuantity,
    autoBuyerBuffer,
    autoBuyerInterval,
    setMoney,
    setValueUpgradeLevels,
    setValueMultipliers,
    setCooldownUpgradeLevels,
    setCooldownReductions,
    setGlobalMultiplier,
    setGlobalMultiplierLevel,
    setGlobalPriceDecreaseState,
    setGlobalPriceDecreaseLevel,
  ]);

  return {
    autoBuyerUnlockCost,
    buyAutoBuyerUnlock,
    cooldownAutoBuyerUnlockCost,
    buyCooldownAutoBuyerUnlock,
    globalMultiplierAutoBuyerUnlockCost,
    buyGlobalMultiplierAutoBuyerUnlock,
    globalPriceDecreaseAutoBuyerUnlockCost,
    buyGlobalPriceDecreaseAutoBuyerUnlock,
  };
}