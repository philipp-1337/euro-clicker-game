import { X as CloseIcon, Trophy as TrophyIcon, Lock as LockIcon, PartyPopperIcon } from 'lucide-react';
import { useModal } from '@hooks/useModal';

export default function AchievementsModal({ showAchievements, setShowAchievements, achievements }) {
  const modalRef = useModal(showAchievements, () => setShowAchievements(false));

  if (!showAchievements) return null;

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal-content achievement">
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
          {Object.values(achievements)
            .filter(achievement => !achievement.hidden || achievement.unlocked) // Versteckte nur anzeigen, wenn freigeschaltet
            .map((achievement) => {
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
                        ? 'Failed'
                        : `${Math.floor((achievement.progress / achievement.target) * 100)}%`}
                  </span>
                </span>
                {achievement.unlocked && <PartyPopperIcon size={20} color="#f50057" style={{ marginLeft: 8 }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}