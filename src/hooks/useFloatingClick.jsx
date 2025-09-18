import { useCallback, useMemo, useEffect, useState } from 'react';

/**
 * Manages floating click button functionality including:
 * - Quick money generation via floating click button
 * - Critical click chances and bonuses
 * - Click history tracking for manual money per second calculation
 * - Click-based income statistics
 */
export default function useFloatingClick({
  setMoney,
  setClickHistory,
  criticalClickChanceLevel,
  floatingClickValueMultiplier,
  criticalHitMultiplier = 1.0,
  ensureStartTime
}) {
  
  // State for manual money per second calculation
  const [manualMoneyPerSecond, setManualMoneyPerSecond] = useState(0);

  // Calculate current critical click chance
  const currentCriticalClickChance = useMemo(() =>
    criticalClickChanceLevel * 0.01,
    [criticalClickChanceLevel]
  );

  // Calculate current floating click value
  const currentFloatingClickValue = useMemo(() => floatingClickValueMultiplier, [floatingClickValueMultiplier]);

  // Calculate current critical hit multiplier
  const currentCriticalHitMultiplier = useMemo(() => criticalHitMultiplier, [criticalHitMultiplier]);


  // Main floating click function
  const addQuickMoney = useCallback(() => {
    ensureStartTime?.();

    const now = Date.now();
    const isCritical = Math.random() < currentCriticalClickChance;
    let moneyToAdd = currentFloatingClickValue;
    if (isCritical) {
      moneyToAdd = currentFloatingClickValue * currentCriticalHitMultiplier;
    }
    const finalMoneyToAdd = (typeof moneyToAdd === 'number' && !isNaN(moneyToAdd) && moneyToAdd > 0)
      ? moneyToAdd
      : currentFloatingClickValue;

    // Speichere Klick als Objekt mit Timestamp und Amount
    setClickHistory(prev => [...prev, { timestamp: now, amount: finalMoneyToAdd }]);

    setMoney(prevMoney => {
      const currentPrevMoney = (typeof prevMoney === 'number' && !isNaN(prevMoney)) ? prevMoney : 0;
      return currentPrevMoney + finalMoneyToAdd;
    });

    return { isCritical, amount: finalMoneyToAdd, multiplier: isCritical ? currentCriticalHitMultiplier : 1 };
  }, [
    setMoney,
    ensureStartTime,
    currentCriticalClickChance,
    currentFloatingClickValue,
    currentCriticalHitMultiplier,
    setClickHistory
  ]);


  // Effect to calculate manual money per second based on click history (jetzt mit amount)
  useEffect(() => {
    const windowSizeMs = 5000; // 5 second window
    const updateIntervalMs = 100; // Update every 100ms

    const interval = setInterval(() => {
      const now = Date.now();

      setClickHistory(prevClickHistory => {
        // Entferne alte Klicks außerhalb des Fensters
        const newHistory = Array.isArray(prevClickHistory)
          ? prevClickHistory.filter(entry => (now - (entry.timestamp ?? entry)) <= windowSizeMs)
          : [];

        // Berechne moneyPerSecond als Summe der amounts im Fenster
        const totalAmount = newHistory.reduce((sum, entry) => {
          if (typeof entry === 'object' && entry !== null && 'amount' in entry) {
            return sum + entry.amount;
          } else {
            // Fallback für alte Einträge (nur Timestamp): zähle als currentFloatingClickValue
            return sum + currentFloatingClickValue;
          }
        }, 0);
        const moneyPerSecond = totalAmount / (windowSizeMs / 1000);
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
    currentCriticalHitMultiplier,
    manualMoneyPerSecond,
    // Functions
    addQuickMoney,
  };
}