import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { gameConfig } from '@constants/gameConfig';

/**
 * Manages offline earnings system including:
 * - Tracking active/inactive play time
 * - Calculating offline earnings based on upgrades
 * - Managing "Welcome Back" modal logic
 * - Visibility change handling for tab switching
 */
export default function useOfflineEarnings({
  isGameStarted,
  totalMoneyPerSecond,
  offlineEarningsLevel,
  initialOfflineDuration,
  activePlayTime,
  setActivePlayTime,
  inactivePlayTime,
  setInactivePlayTime,
  setMoney
}) {
  
  // State for offline earnings modal
  const [lastInactiveDuration, setLastInactiveDuration] = useState(0);
  const [calculatedOfflineEarnings, setCalculatedOfflineEarnings] = useState(0);
  
  // Ref to track when inactivity period started
  const inactiveStartTimeRef = useRef(null);

  // Calculate current offline earnings factor
  const currentOfflineEarningsFactor = useMemo(() =>
    offlineEarningsLevel * gameConfig.premiumUpgrades.offlineEarnings.effectPerLevel,
    [offlineEarningsLevel]
  );

  // Effect to set lastInactiveDuration based on initialOfflineDuration after load
  useEffect(() => {
    console.log('[useOfflineEarnings] Effect for initialOfflineDuration. Value:', initialOfflineDuration);
    if (initialOfflineDuration > 0) {
      setLastInactiveDuration(initialOfflineDuration);
    }
  }, [initialOfflineDuration]);

  // Effect to calculate offline earnings when lastInactiveDuration changes
  useEffect(() => {
    if (offlineEarningsLevel > 0 && lastInactiveDuration > 0 && totalMoneyPerSecond > 0) {
      const earnings = Math.floor(lastInactiveDuration * totalMoneyPerSecond * currentOfflineEarningsFactor);
      setCalculatedOfflineEarnings(earnings);
      console.log(`[useOfflineEarnings] Calculated offline earnings: ${earnings} for duration ${lastInactiveDuration}s`);
    } else {
      setCalculatedOfflineEarnings(0);
    }
  }, [lastInactiveDuration, offlineEarningsLevel, totalMoneyPerSecond, currentOfflineEarningsFactor]);

  // Functions to handle offline earnings
  const claimOfflineEarnings = useCallback(() => {
    if (calculatedOfflineEarnings > 0) {
      setMoney(prev => prev + calculatedOfflineEarnings);
      console.log(`[useOfflineEarnings] Claimed offline earnings: ${calculatedOfflineEarnings}`);
      setCalculatedOfflineEarnings(0);
    }
  }, [calculatedOfflineEarnings, setMoney]);

  const clearLastInactiveDuration = useCallback(() => {
    setLastInactiveDuration(0);
    setCalculatedOfflineEarnings(0);
  }, []);

  // Effect to track active/inactive play time and handle visibility changes
  useEffect(() => {
    let activeIntervalId;

    const clearActiveTimer = () => {
      clearInterval(activeIntervalId);
      activeIntervalId = null;
    };

    const startActiveTimer = () => {
      clearActiveTimer();
      activeIntervalId = setInterval(() => {
        setActivePlayTime(prev => prev + 1);
      }, 1000);
    };

    const handleVisibilityChange = () => {
      if (!isGameStarted) {
        clearActiveTimer();
        inactiveStartTimeRef.current = null;
        return;
      }

      if (document.visibilityState === 'visible') {
        startActiveTimer();
        
        if (inactiveStartTimeRef.current) {
          const inactiveMs = Date.now() - inactiveStartTimeRef.current;
          const currentInactiveSeconds = Math.floor(inactiveMs / 1000);
          
          if (currentInactiveSeconds > 0) {
            setInactivePlayTime(prev => prev + currentInactiveSeconds);
          }
          
          inactiveStartTimeRef.current = null;
          const inactiveSeconds = Math.floor(inactiveMs / 1000);
          
          // Show modal if inactive for more than 5 seconds
          if (inactiveSeconds > 5) {
            setLastInactiveDuration(inactiveSeconds);
          }
        }
      } else {
        clearActiveTimer();
        inactiveStartTimeRef.current = Date.now();
      }
    };

    if (!isGameStarted) {
      clearActiveTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      return;
    }

    // Initial setup when game starts
    if (document.visibilityState === 'visible') {
      startActiveTimer();
      inactiveStartTimeRef.current = null;
    } else {
      inactiveStartTimeRef.current = Date.now();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearActiveTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setActivePlayTime, setInactivePlayTime, isGameStarted]);

  return {
    // Offline earnings state
    currentOfflineEarningsFactor,
    lastInactiveDuration,
    calculatedOfflineEarnings,
    
    // Functions
    claimOfflineEarnings,
    clearLastInactiveDuration,
  };
}