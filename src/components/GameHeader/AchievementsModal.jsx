import React from 'react';
import { PartyPopper, Trophy, FileQuestion } from 'lucide-react';
import { useAchievements } from '@hooks/useAchievements';
import { gameConfig } from '@constants/gameConfig';

export default function AchievementsModal({ show, onClose, achievements = {} }) {
  const ACHIEVEMENTS = useAchievements(gameConfig);

  if (!show) return null;
  return (
    <div className="modal-backdrop" style={{ zIndex: 10001 }}>
      <div className="modal-content" style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <Trophy size={28} style={{ marginRight: 8 }} />
          <h3 style={{ margin: '0 0 0 14px' }}>Achievements</h3>
        </div>
        <div className="achievements-list">
          {ACHIEVEMENTS.map(a => {
            const unlocked = achievements[a.id];
            return (
              <div key={a.id} className="achievement-row" style={{ opacity: unlocked ? 1 : 0.5 }}>
                <span className="achievement-icon">
                  {unlocked ? a.icon : <FileQuestion size={32} color="#bbb" />}
                </span>
                <span className="achievement-info">
                  <span className="achievement-label">
                    {unlocked ? a.label : '???'}
                  </span>
                  <span className="achievement-desc">
                    {unlocked ? a.description : '???'}
                  </span>
                </span>
                {unlocked && <PartyPopper size={20} color="#f50057" style={{ marginLeft: 8 }} />}
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'right', marginTop: 18 }}>
          <button className="modal-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
