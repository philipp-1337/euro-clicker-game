import React, { useState } from 'react';
import {
  X as CloseIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  BarChart2 as StatsIcon,
  Award as AchievementsIcon,  
  Info as InfoIcon,
  CrownIcon
} from 'lucide-react';
import AboutModal from '../AboutModal/AboutModal';
import { useModal } from '../../hooks/useModal';

export default function SideMenu({ 
  isOpen,
  setIsOpen,
  onOpenSettings, 
  showLeaderboard, 
  onToggleLeaderboard,
  onOpenAchievements,
  onOpenStatistics // Neue Prop
}) {
  const [showAbout, setShowAbout] = useState(false);
  const menuRef = useModal(isOpen, () => setIsOpen(false), {
    excludeElements: ['.menu-toggle-button']
  });

  const handleMenuItemClick = (action) => {
    if (action) {
      action();
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className={`sidemenu-backdrop ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

      <div ref={menuRef} className={`sidemenu ${isOpen ? 'open' : ''}`}>
        <div className="sidemenu-header">
          <h3>Euro Clicker Game</h3>
          <button 
            className="settings-button" 
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="sidemenu-content">
          <div 
            className="sidemenu-item" 
            onClick={() => setIsOpen(false)}
          >
            <HomeIcon size={20} className="sidemenu-icon" />
            <span>Home</span>
          </div>

          <div 
            className="sidemenu-item" 
            onClick={() => handleMenuItemClick(onOpenSettings)}
          >
            <SettingsIcon size={20} className="sidemenu-icon" />
            <span>Settings</span>
          </div>

          <div 
            className="sidemenu-item" 
            onClick={() => handleMenuItemClick(onOpenStatistics)}
          >
            <StatsIcon size={20} className="sidemenu-icon" />
            <span>Statistics</span>
          </div>

          {showLeaderboard !== undefined && (
            <div 
              className="sidemenu-item" 
              onClick={() => handleMenuItemClick(onToggleLeaderboard)}
            >
              <CrownIcon size={20} className="sidemenu-icon" />
              <span>Leaderboard</span>
            </div>
          )}

          <div 
            className="sidemenu-item" 
            onClick={() => handleMenuItemClick(onOpenAchievements)}
          >
            <AchievementsIcon size={20} className="sidemenu-icon" />
            <span>Achievements</span>
          </div>

          <div 
            className="sidemenu-item" 
            onClick={() => handleMenuItemClick(() => setShowAbout(true))}
          >
            <InfoIcon size={20} className="sidemenu-icon" />
            <span>About</span>
          </div>
        </div>

        <div className="sidemenu-footer">
          Euro Clicker Game v1.0
        </div>
      </div>
      {/* About Modal */}
      <AboutModal show={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}