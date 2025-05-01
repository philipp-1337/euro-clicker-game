import { useState, useEffect } from 'react';
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

    // Check total clicks achievement
    const clicksAchievement = updatedAchievements.totalClicks;
    if (clicksAchievement && !clicksAchievement.unlocked) {
      clicksAchievement.progress = totalClicks;
      // console.log('Clicks achievement progress:', clicksAchievement.progress, 'target:', clicksAchievement.target);
      if (totalClicks >= clicksAchievement.target) {
        console.log('Clicks achievement condition met!');
        clicksAchievement.unlocked = true;
        newUnlocks.push(clicksAchievement);
        console.log('Clicks achievement unlocked!');
      }
    }

    // Check fast money achievement
    const moneyAchievement = updatedAchievements.fastMoney;
    if (moneyAchievement && !moneyAchievement.unlocked) {
      moneyAchievement.progress = money;
      // Kennzeichnung, wenn nicht mehr erreichbar
      if (
        money < moneyAchievement.target &&
        gameTime > moneyAchievement.timeLimit
      ) {
        moneyAchievement.unattainable = true;
      } else {
        moneyAchievement.unattainable = false;
      }
      if (money >= moneyAchievement.target && gameTime <= moneyAchievement.timeLimit) {
        console.log('Money achievement condition met!');
        moneyAchievement.unlocked = true;
        newUnlocks.push(moneyAchievement);
      }
    }

    // Check long play achievement
    const timeAchievement = updatedAchievements.longPlay;
    if (timeAchievement && !timeAchievement.unlocked) {
      timeAchievement.progress = gameTime;
      // console.log('Time achievement progress:', timeAchievement.progress, 'target:', timeAchievement.target);
      if (gameTime >= timeAchievement.target) {
        console.log('Time achievement condition met!');
        timeAchievement.unlocked = true;
        newUnlocks.push(timeAchievement);
      }
    }

    if (newUnlocks.length > 0) {
      console.log('New achievements unlocked:', newUnlocks);
      setUnlockedAchievements(prev => [...prev, ...newUnlocks]);
      setAchievements(updatedAchievements);
    }
  }, [money, totalClicks, gameTime, achievements]);

  return {
    achievements,
    unlockedAchievements,
    clearUnlockedAchievements: () => setUnlockedAchievements([])
  };
}; 