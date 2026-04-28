import { useCallback } from 'react';
import useSoundEffects from './useSoundEffects'; // Import the new hook

// Load sound effect
export default function useManagers(money, setMoney, managers, setManagers, ensureStartTime, soundEffectsEnabled, spendMoney) {
  const { playSound } = useSoundEffects(soundEffectsEnabled); // Use the sound effects hook
  const buyManager = useCallback((index, cost) => {
    if (managers[index]) {
      return false;
    }

    const wasSpent = typeof spendMoney === 'function'
      ? spendMoney(cost)
      : (money >= cost);

    if (!wasSpent) {
      return false;
    }

    playSound('manager');
    ensureStartTime?.();

    if (typeof spendMoney !== 'function') {
      setMoney(prevMoney => prevMoney - cost);
    }

    setManagers(prevManagers => {
      const newManagers = [...prevManagers];
      newManagers[index] = true;
      return newManagers;
    });

    return true;
  }, [ensureStartTime, managers, money, playSound, setManagers, setMoney, spendMoney]);

  return { buyManager };
}
