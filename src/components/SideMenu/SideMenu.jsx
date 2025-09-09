import { useState } from 'react';
import {
  X as CloseIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  BarChart2 as StatsIcon,
  Award as AchievementsIcon,  
  Info as InfoIcon,
  Bell as NotificationIcon,
  Crown as CrownIcon,
  Zap as PrestigeSideMenuIcon, // Icon für Prestige
} from 'lucide-react';
import AboutModal from '../AboutModal/AboutModal';
import MenuItem from '../NotificationCenter/MenuItem';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import { useModal } from '../../hooks/useModal';
import VersionDisplay from '../VersionDisplay/VersionDisplay';

export default function SideMenu({ 
  isOpen,
  setIsOpen,
  onOpenSettings,
  onToggleLeaderboard,
  onOpenAchievements,
  onOpenStatistics,
  showPrestigeOption, // Neue Prop für Sichtbarkeit
  onOpenPrestige      // Neue Prop zum Öffnen des Prestige-Modals
}) {
  const [showAbout, setShowAbout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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
      <div
        className={`sidemenu-backdrop ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(false); }}
        role="button"
        tabIndex={0}
        aria-label="Close side menu"
      />

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
          <MenuItem
            icon={HomeIcon}
            label="Home"
            onClick={() => setIsOpen(false)}
          />
          <MenuItem
            icon={SettingsIcon}
            label="Settings"
            onClick={() => handleMenuItemClick(onOpenSettings)}
          />
          <MenuItem
            icon={StatsIcon}
            label="Statistics"
            onClick={() => handleMenuItemClick(onOpenStatistics)}
          />
          <MenuItem
            icon={CrownIcon}
            label="Leaderboard"
            onClick={() => handleMenuItemClick(onToggleLeaderboard)}
          />
          <MenuItem
            icon={AchievementsIcon}
            label="Achievements"
            onClick={() => handleMenuItemClick(onOpenAchievements)}
          />
          {showPrestigeOption && (
            <MenuItem
              icon={PrestigeSideMenuIcon}
              label="Prestige"
              onClick={() => handleMenuItemClick(onOpenPrestige)}
            />
          )}
          <MenuItem
            icon={InfoIcon}
            label="About"
            onClick={() => handleMenuItemClick(() => setShowAbout(true))}
          />
          <MenuItem
            icon={NotificationIcon}
            label="Benachrichtigungen"
            onClick={() => handleMenuItemClick(() => setShowNotifications(true))}
          />
        </div>

        <div className="sidemenu-footer">
          Euro Clicker Game <VersionDisplay />
        </div>
      </div>
      {/* About Modal */}
      <AboutModal show={showAbout} onClose={() => setShowAbout(false)} />
  <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}