import { useState, useEffect, useCallback } from 'react';
import { gameConfig } from '@constants/gameConfig';

export const useAchievements = (money, totalClicks, gameTime) => {
  const [achievements, setAchievements] = useState(() => {
    const initialAchievements = {};
    Object.values(gameConfig.achievements).forEach(achievement => {
      initialAchievements[achievement.id] = {
        ...achievement,
        unlocked: false,
        progress: 0
      };
    });
    return initialAchievements;
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  // Check for achievement progress
  useEffect(() => {
    // console.log('Current achievements state:', achievements);

    let newUnlocks = [];
    const updatedAchievements = { ...achievements };

    // Iterate over defined, non-hidden achievements for regular checks
    Object.values(gameConfig.achievements).forEach(configAch => {
      if (configAch.hidden) return; // Skip hidden achievements for regular checks

      const currentAch = updatedAchievements[configAch.id];
      if (currentAch && !currentAch.unlocked) {
        let progress = 0;
        let conditionMet = false;
        let isUnattainable = false;

        if (configAch.id === 'totalClicks') {
          progress = totalClicks;
          if (totalClicks >= configAch.target) conditionMet = true;
        } else if (configAch.id === 'fastMoney') {
          progress = money;
          if (money < configAch.target && gameTime > configAch.timeLimit) {
            isUnattainable = true;
          }
          if (money >= configAch.target && gameTime <= configAch.timeLimit) {
            conditionMet = true;
          }
        } else if (configAch.id === 'longPlay') {
          progress = gameTime;
          if (gameTime >= configAch.target) conditionMet = true;
        }
        // Add other non-hidden achievement checks here if any

        currentAch.progress = progress;
        currentAch.unattainable = isUnattainable; // Update anfassbarkeit

        if (conditionMet) {
          currentAch.unlocked = true;
          newUnlocks.push(currentAch);
        }
      }
    });

    if (newUnlocks.length > 0) {
      console.log('New achievements unlocked:', newUnlocks);
      setUnlockedAchievements(prevQueue => {
        const uniqueNewUnlocks = newUnlocks.filter(nu => !prevQueue.find(pq => pq.id === nu.id));
        return [...prevQueue, ...uniqueNewUnlocks];
      });
      // Wichtig: updatedAchievements enthält bereits die Änderungen.
      // Wir müssen sicherstellen, dass setAchievements den korrekten, aktualisierten Zustand setzt.
      // Da updatedAchievements eine lokale Kopie ist, die modifiziert wurde, ist das korrekt.
      setAchievements(prev => ({...prev, ...updatedAchievements}));
    }
  }, [money, totalClicks, gameTime, achievements]); // achievements als Dependency ist wichtig

  const unlockSpecificAchievementById = useCallback((achievementId) => {
    setAchievements(prevAchievements => {
      const achievementToUnlock = prevAchievements[achievementId];
      if (achievementToUnlock && !achievementToUnlock.unlocked) {
        const updatedAchievement = {
          ...achievementToUnlock,
          unlocked: true,
          progress: achievementToUnlock.target, // Ziel als erreicht markieren
          unattainable: false, // Sicherstellen, dass es nicht als "unattainable" markiert ist
        };
        const newAchievementsState = { ...prevAchievements, [achievementId]: updatedAchievement };

        setUnlockedAchievements(prevQueue => {
          if (!prevQueue.find(ach => ach.id === achievementId)) {
            return [...prevQueue, updatedAchievement];
          }
          return prevQueue;
        });
        console.log(`[useAchievements] Specifically unlocked: ${achievementId}`);
        return newAchievementsState;
      }
      return prevAchievements;
    });
  }, [setAchievements, setUnlockedAchievements]);

  return {
    achievements,
    unlockedAchievements,
    clearUnlockedAchievements: () => setUnlockedAchievements([]),
    unlockSpecificAchievementById, // Die neue Funktion exportieren
  };
}; 