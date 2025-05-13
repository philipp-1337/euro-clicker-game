import { useCallback } from 'react';

// Load sound effect
const clickSound = new Audio('/sounds/manager-sound.mp3');

export default function useManagers(money, setMoney, managers, setManagers, ensureStartTime) {
  const buyManager = useCallback((index, cost) => {
    if (money >= cost && !managers[index]) {
      clickSound.play(); // Play sound effect when a manager is purchased
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