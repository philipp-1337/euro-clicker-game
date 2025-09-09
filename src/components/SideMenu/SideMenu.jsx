import { useState, useEffect } from 'react';
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
import AboutModal from '@components/AboutModal/AboutModal';
import MenuItem from '@components/SideMenu/MenuItem';
import NotificationCenter from '@components/NotificationCenter/NotificationCenter';
import { useModal } from '@hooks/useModal';
import VersionDisplay from '@components/VersionDisplay/VersionDisplay';

export default function SideMenu({ 
  isOpen,
  setIsOpen,
  onOpenSettings,
  onToggleLeaderboard,
  onOpenAchievements,
  onOpenStatistics,
  showPrestigeOption, // Neue Prop für Sichtbarkeit
  onOpenPrestige, // Neue Prop zum Öffnen des Prestige-Modals
  showNotifications,  // Neu: zentraler State aus GameHeader
  setShowNotifications, // Neu: Setter aus GameHeader
  notifications,
  loadingNotifications,
  seenIds,
  loadingSeen,
  markAllAsSeen
}) {
  const [showAbout, setShowAbout] = useState(false);
  const menuRef = useModal(isOpen, () => setIsOpen(false), {
    excludeElements: ['.menu-toggle-button']
  });

  // Lade die gesehenen IDs nur nach Schließen des NotificationCenters neu
  useEffect(() => {
    // Entferne das automatische Neuladen beim Schließen des NotificationCenters hier
  }, [showNotifications]);

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
            icon={NotificationIcon}
            label="Notification"
            onClick={() => {
              setShowNotifications(true);
              handleMenuItemClick();
            }}
            ariaLabel="Notification"
          >
            {/* Badge kann bei Bedarf wieder angezeigt werden */}
          </MenuItem>
          <MenuItem
            icon={InfoIcon}
            label="About"
            onClick={() => handleMenuItemClick(() => setShowAbout(true))}
          />
        </div>

        <div className="sidemenu-footer">
          Euro Clicker Game <VersionDisplay />
        </div>
      </div>
      {/* About Modal */}
      <AboutModal show={showAbout} onClose={() => setShowAbout(false)} />
      <NotificationCenter
        show={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          const allIds = notifications.map((n) => n.id);
          if (allIds.length > 0) {
            markAllAsSeen(allIds);
          }
        }}
        notifications={notifications}
        seenIds={seenIds}
        loading={loadingNotifications || loadingSeen}
      />
    </>
  );
}