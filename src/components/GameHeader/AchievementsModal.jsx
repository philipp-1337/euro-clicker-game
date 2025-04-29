import React from 'react';
import { PartyPopper, Trophy, MousePointerClick, FileQuestion, Rocket, Timer } from 'lucide-react';

const ACHIEVEMENTS = [
  {
    id: 'clicks1000',
    label: '1000 Clicks!',
    description: 'Reach 1000 total clicks.',
    icon: <MousePointerClick size={32} color="#4caf50" />,
  },
  {
    id: 'faststart',
    label: 'Speedy Start',
    description: 'Reach 100€ in under 60 seconds.',
    icon: <Rocket size={32} color="#2196f3" />,
  },
  {
    id: 'playhour',
    label: 'One Hour Played',
    description: 'Play for 1 hour total.',
    icon: <Timer size={32} color="#ff9800" />,
  },
  // Add more achievements here
];

export default function AchievementsModal({ show, onClose, achievements = {} }) {
  if (!show) return null;
  return (
    <div className="modal-backdrop" style={{ zIndex: 10001 }}>
      <div className="modal-content" style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <Trophy size={28} style={{ marginRight: 8 }} />
          <h3 style={{ margin: 0 }}>Achievements</h3>
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
