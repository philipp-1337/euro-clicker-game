import React from 'react';
import { X as CloseIcon, Trophy as TrophyIcon, Lock as LockIcon, PartyPopperIcon } from 'lucide-react';
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
        <div className="achievements-list">
          {Object.values(achievements).map((achievement) => {
            const isLocked = !achievement.unlocked;
            return (
              <div key={achievement.id} className={`achievement-row${achievement.unattainable ? ' unattainable' : ''}`} style={achievement.unattainable ? {opacity: 0.5} : {}}>
                {isLocked ? (
                  <span className="achievement-icon">
                    <LockIcon size={20} className="settings-icon locked" />
                  </span>
                ) : (
                  <span className="achievement-icon">
                    <TrophyIcon size={20} className={`settings-icon ${achievement.unlocked ? 'unlocked' : ''}`} />
                  </span>
                )}
                <span  className="achievement-info">
                  <span className="achievement-label">
                    {isLocked ? '???' : achievement.name}
                  </span>
                  <span className="achievement-desc">
                    {achievement.unlocked ? achievement.description
                      : achievement.unattainable
                        ? 'Nicht mehr erreichbar'
                        : `${Math.floor((achievement.progress / achievement.target) * 100)}%`}
                  </span>
                </span>
                {achievement.unlocked && <PartyPopperIcon size={20} color="#f50057" style={{ marginLeft: 8 }} />}
                {/* <span className={`achievement-status ${achievement.unlocked ? 'unlocked' : ''}`}>
                  {achievement.unlocked
                    ? 'Unlocked'
                    : achievement.unattainable
                      ? 'Nicht mehr erreichbar'
                      : `${Math.floor((achievement.progress / achievement.target) * 100)}%`}
                </span> */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}