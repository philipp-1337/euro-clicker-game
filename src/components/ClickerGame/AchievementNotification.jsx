import React, { useEffect, useState } from 'react';
import { Trophy as TrophyIcon } from 'lucide-react';
import 'App.scss';

export default function AchievementNotification({ achievement, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Nach 3 Sekunden ausblenden
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 300);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible || !achievement) return null;

  return (
    <div className="achievement-notification">
      <TrophyIcon size={22} className="achievement-icon" />
      <span className="achievement-message">
        {achievement.name}
      </span>
    </div>
  );
}
