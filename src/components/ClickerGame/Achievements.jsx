import React from 'react';
import { useAchievements } from '@hooks/useAchievements';

const Achievements = ({ money, totalClicks, gameTime }) => {
  const { achievements, unlockedAchievements, clearUnlockedAchievements } = useAchievements(
    money,
    totalClicks,
    gameTime
  );

  // Clear unlocked achievements after they've been displayed
  React.useEffect(() => {
    if (unlockedAchievements.length > 0) {
      const timer = setTimeout(clearUnlockedAchievements, 3000);
      return () => clearTimeout(timer);
    }
  }, [unlockedAchievements, clearUnlockedAchievements]);

  return (
    <div className="achievements-container">
      {unlockedAchievements.map((achievement) => (
        <div key={achievement.id} className="achievement unlocked">
          <div className="achievement-icon">{achievement.icon}</div>
          <div className="achievement-info">
            <div className="achievement-name">{achievement.name}</div>
            <div className="achievement-description">{achievement.description}</div>
          </div>
        </div>
      ))}
      {Object.values(achievements).map((achievement) => (
        <div key={achievement.id} className="achievement">
          <div className="achievement-icon">{achievement.icon}</div>
          <div className="achievement-info">
            <div className="achievement-name">{achievement.name}</div>
            <div className="achievement-description">{achievement.description}</div>
            <div className="achievement-progress">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(
                    (achievement.progress / achievement.target) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Achievements; 