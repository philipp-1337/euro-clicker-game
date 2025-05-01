import React from 'react';
import { X as CloseIcon, Trophy as TrophyIcon } from 'lucide-react';
// import { formatNumber } from '@utils/calculators';

export default function AchievementsModal({ showAchievements, setShowAchievements, achievements, money, totalClicks, gameTime }) {
  if (!showAchievements) return null;

  // const formatTime = (seconds) => {
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   return `${hours}h ${minutes}m`;
  // };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="settings-modal-header">
          <h3>Achievements</h3>
          <button
            className="settings-button"
            style={{ marginLeft: "auto" }}
            onClick={() => setShowAchievements(false)}
            title="Close"
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="settings-modal-content">
          {/* <div className="achievement-stats">
            <p>Total Money: {formatNumber(money)} €</p>
            <p>Total Clicks: {totalClicks}</p>
            <p>Game Time: {formatTime(gameTime)}</p>
          </div> */}
          {Object.values(achievements).map((achievement) => (
            <div key={achievement.id} className="settings-row">
              <TrophyIcon size={20} className={`settings-icon ${achievement.unlocked ? 'unlocked' : ''}`} />
              <span className="settings-label">{achievement.name}</span>
              <span className={`achievement-status ${achievement.unlocked ? 'unlocked' : ''}`}>
                {achievement.unlocked ? 'Unlocked' : `${Math.floor((achievement.progress / achievement.target) * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}