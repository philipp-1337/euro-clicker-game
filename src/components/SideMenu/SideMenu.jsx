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
import AboutModal from '../AboutModal/AboutModal';
import MenuItem from '../NotificationCenter/MenuItem';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import { useModal } from '../../hooks/useModal';
import VersionDisplay from '../VersionDisplay/VersionDisplay';
import useNotifications from '../../hooks/useNotifications';
import useNotificationReads from '../../hooks/useNotificationReads';
import NotificationBadge from '../NotificationCenter/NotificationBadge';

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
  const { notifications, loading: loadingNotifications } = useNotifications();
  const { seenIds, markAllAsSeen, loading: loadingSeen, setSeenIds, reloadSeenIds } = useNotificationReads();
  const [notificationCount, setNotificationCount] = useState(0);

  // notificationCount nur beim Öffnen des Sidemenu berechnen
  useEffect(() => {
    if (isOpen && !loadingNotifications && !loadingSeen) {
      const allIds = notifications.map(n => n.id);
      const newCount = allIds.filter(id => !seenIds.includes(id)).length;
      console.log('[SideMenu] notificationCount:', newCount, 'allIds:', allIds, 'seenIds:', seenIds);
      setNotificationCount(newCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Lade die gesehenen IDs nur nach Schließen des NotificationCenters neu
  useEffect(() => {
    if (!showNotifications) {
      setTimeout(() => {
        reloadSeenIds(); // Firestore braucht etwas Zeit, dann neu laden
      }, 350);
    }
  }, [showNotifications, reloadSeenIds]);

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
            ariaLabel="Benachrichtigungen"
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <NotificationIcon size={20} className="sidemenu-icon" />
              {notificationCount > 0 && <NotificationBadge count={notificationCount} />}
            </div>
          </MenuItem>
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
          setTimeout(() => reloadSeenIds(), 350); // Firestore braucht etwas Zeit
        }}
        notifications={notifications}
        seenIds={seenIds}
        setSeenIds={setSeenIds}
        markAllAsSeen={markAllAsSeen}
      />
    </>
  );
}