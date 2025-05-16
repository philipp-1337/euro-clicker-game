import { useCallback } from 'react';
import useSoundEffects from './useSoundEffects'; // Import the new hook

// Load sound effect
export default function useManagers(money, setMoney, managers, setManagers, ensureStartTime) {
  const { playSound } = useSoundEffects(); // Use the sound effects hook
  const buyManager = useCallback((index, cost) => {
    if (money >= cost && !managers[index]) {
      playSound('manager'); // Play sound effect when a manager is purchased
      ensureStartTime?.();
      setMoney(prevMoney => prevMoney - cost);
      setManagers(prevManagers => {
        const newManagers = [...prevManagers];
        newManagers[index] = true;
        return newManagers;
      });
    }
  }, [money, managers, setMoney, setManagers, ensureStartTime]);

  return { buyManager };
}