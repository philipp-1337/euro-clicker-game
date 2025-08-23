import { useCallback, useMemo, useEffect, useState } from 'react';

/**
 * Manages floating click button functionality including:
 * - Quick money generation via floating click button
 * - Critical click chances and bonuses
 * - Click history tracking for manual money per second calculation
 * - Click-based income statistics
 */
export default function useFloatingClick({
  money,
  setMoney,
  setClickHistory,
  totalMoneyPerSecond,
  criticalClickChanceLevel,
  floatingClickValueMultiplier,
  ensureStartTime
}) {
  
  // State for manual money per second calculation
  const [manualMoneyPerSecond, setManualMoneyPerSecond] = useState(0);

  // Calculate current critical click chance
  const currentCriticalClickChance = useMemo(() =>
    criticalClickChanceLevel * 0.01, // Assuming 1% per level, adjust based on gameConfig
    [criticalClickChanceLevel]
  );

  // Calculate current floating click value
  const currentFloatingClickValue = useMemo(() => {
    return floatingClickValueMultiplier;
  }, [floatingClickValueMultiplier]);

  // Main floating click function
  const addQuickMoney = useCallback(() => {
    ensureStartTime?.();

    const now = Date.now();
    setClickHistory(prev => [...prev, now]);

    const isCritical = Math.random() < currentCriticalClickChance;
    let moneyToAdd = currentFloatingClickValue;

    if (isCritical) {
      const criticalAmount = (typeof totalMoneyPerSecond === 'number' && !isNaN(totalMoneyPerSecond)) 
        ? totalMoneyPerSecond 
        : 0;
      moneyToAdd = Math.max(currentFloatingClickValue, criticalAmount);
    }

    const finalMoneyToAdd = (typeof moneyToAdd === 'number' && !isNaN(moneyToAdd) && moneyToAdd > 0) 
      ? moneyToAdd 
      : currentFloatingClickValue;
      
    setMoney(prevMoney => {
      const currentPrevMoney = (typeof prevMoney === 'number' && !isNaN(prevMoney)) ? prevMoney : 0;
      return currentPrevMoney + finalMoneyToAdd;
    });
    
    return { isCritical, amount: finalMoneyToAdd };
  }, [
    setMoney,
    ensureStartTime,
    currentCriticalClickChance,
    totalMoneyPerSecond,
    currentFloatingClickValue,
    setClickHistory
  ]);

  // Effect to calculate manual money per second based on click history
  useEffect(() => {
    const windowSizeMs = 5000; // 5 second window
    const updateIntervalMs = 100; // Update every 100ms
    
    const interval = setInterval(() => {
      const now = Date.now();
      
      setClickHistory(prevClickHistory => {
        const newHistory = [...prevClickHistory];
        
        // Remove old clicks outside the window
        while (newHistory.length > 0 && now - newHistory[0] > windowSizeMs) {
          newHistory.shift();
        }
        
        // Calculate clicks per second and money per second
        const clicksPerSecond = newHistory.length / (windowSizeMs / 1000);
        const moneyPerSecond = clicksPerSecond * currentFloatingClickValue;
        setManualMoneyPerSecond(moneyPerSecond);
        
        return newHistory;
      });
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [currentFloatingClickValue, setClickHistory]);

  return {
    // Values
    currentCriticalClickChance,
    currentFloatingClickValue,
    manualMoneyPerSecond,
    
    // Functions
    addQuickMoney,
  };
}