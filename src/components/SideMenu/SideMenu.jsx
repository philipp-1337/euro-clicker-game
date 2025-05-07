import React, { useState, useEffect } from 'react';
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  BarChart2 as StatsIcon,
  Award as AchievementsIcon,  
  Info as InfoIcon,
  CrownIcon
} from 'lucide-react';
import AboutModal from '../AboutModal/AboutModal';

export default function SideMenu({ 
  onOpenSettings, 
  showLeaderboard, 
  onToggleLeaderboard,
  onOpenAchievements
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.sidemenu') && !event.target.closest('.menu-toggle-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleMenuItemClick = (action) => {
    if (action) {
      action();
    }
    setIsOpen(false);
  };

  return (
    <>
      <button 
        className="menu-toggle-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <MenuIcon size={24} />
      </button>

      <div className={`sidemenu-backdrop ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

      <div className={`sidemenu ${isOpen ? 'open' : ''}`}>
        <div className="sidemenu-header">
          <h3>Euro Clicker</h3>
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

          {/* <div 
            className="sidemenu-item" 
            onClick={() => handleMenuItemClick()}
          >
            <StatsIcon size={20} className="sidemenu-icon" />
            <span>Statistics</span>
          </div> */}

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