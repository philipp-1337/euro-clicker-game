import { useState } from 'react';
import {
  X as CloseIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  BarChart2 as StatsIcon,
  Award as AchievementsIcon,  
  Info as InfoIcon,
  Bell as NotificationIcon,
  CrownIcon,
  Zap as PrestigeSideMenuIcon, // Icon für Prestige
} from 'lucide-react';
import AboutModal from '../AboutModal/AboutModal';
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
          <div
            className="sidemenu-item"
            role="button"
            tabIndex={0}
            onClick={() => setIsOpen(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') setIsOpen(false);
            }}
            aria-label="Home"
          >
            <HomeIcon size={20} className="sidemenu-icon" />
            <span>Home</span>
          </div>

          <div
            className="sidemenu-item"
            role="button"
            tabIndex={0}
            onClick={() => handleMenuItemClick(onOpenSettings)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleMenuItemClick(onOpenSettings);
            }}
            aria-label="Settings"
          >
            <SettingsIcon size={20} className="sidemenu-icon" />
            <span>Settings</span>
          </div>

          <div
            className="sidemenu-item"
            role="button"
            tabIndex={0}
            onClick={() => handleMenuItemClick(onOpenStatistics)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleMenuItemClick(onOpenStatistics);
            }}
            aria-label="Statistics"
          >
            <StatsIcon size={20} className="sidemenu-icon" />
            <span>Statistics</span>
          </div>

          <div
            className="sidemenu-item"
            role="button"
            tabIndex={0}
            onClick={() => handleMenuItemClick(onToggleLeaderboard)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleMenuItemClick(onToggleLeaderboard);
            }}
            aria-label="Leaderboard"
          >
            <CrownIcon size={20} className="sidemenu-icon" />
            <span>Leaderboard</span>
          </div>

          <div
            className="sidemenu-item"
            role="button"
            tabIndex={0}
            onClick={() => handleMenuItemClick(onOpenAchievements)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleMenuItemClick(onOpenAchievements);
            }}
            aria-label="Achievements"
          >
            <AchievementsIcon size={20} className="sidemenu-icon" />
            <span>Achievements</span>
          </div>

          {showPrestigeOption && (
            <div
              className="sidemenu-item"
              role="button"
              tabIndex={0}
              onClick={() => handleMenuItemClick(onOpenPrestige)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') handleMenuItemClick(onOpenPrestige);
              }}
              aria-label="Prestige"
            >
              <PrestigeSideMenuIcon size={20} className="sidemenu-icon" />
              <span>Prestige</span>
            </div>
          )}
          <div
            className="sidemenu-item"
            role="button"
            tabIndex={0}
            onClick={() => handleMenuItemClick(() => setShowAbout(true))}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleMenuItemClick(() => setShowAbout(true));
            }}
            aria-label="About"
          >
            <InfoIcon size={20} className="sidemenu-icon" />
            <span>About</span>
          </div>
          <div
            className="sidemenu-item"
            tabIndex={0}
            onClick={() => handleMenuItemClick(() => setShowNotifications(true))}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleMenuItemClick(() => setShowNotifications(true));
            }}
            aria-label="Benachrichtigungen"
          >
            <NotificationIcon size={20} className="sidemenu-icon" />
            <span>Benachrichtigungen</span>
          </div>
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