import React, { useState } from 'react';
import useNotifications from '@hooks/useNotifications';
import useNotificationReads from '@hooks/useNotificationReads';
import PropTypes from 'prop-types';
import { formatNumber } from '@utils/calculators';
import useGameHeaderLogic from '@hooks/useGameHeaderLogic';
import {
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  MousePointerClick as MousePointerClickIcon,
  ClockIcon,
  Crown as CrownIcon,
  Menu as MenuIcon,
  BarChart2 as BarChart2Icon,
  AwardIcon,
  Zap as PrestigeHeaderIcon,
  Layers as LayersIcon,
  Layers2Icon,
  BotIcon,
  BotOffIcon,
  MailIcon,
  MailOpenIcon
} from 'lucide-react';
import SettingsModal from './SettingsModal';
import AchievementsModal from './AchievementsModal';
import LeaderboardModal from './LeaderboardModal';
import MoneyBanner from '@components/MoneyBanner/MoneyBanner';
import PrestigeModal from '@components/PrestigeModal/PrestigeModal';
import StatisticsModal from '../StatisticsModal/StatisticsModal';
import { useUiProgress } from '@hooks/useUiProgress';
import SideMenu from '../SideMenu/SideMenu';

export default function GameHeader(props) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  // Notification Badge Logik
  const { notifications, loading: loadingNotifications } = useNotifications();
  const {
    seenIds,
    loading: loadingSeen,
    reloadSeenIds,
  } = useNotificationReads();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // notificationCount nur berechnen, wenn Daten geladen sind und SideMenu geschlossen ist
  React.useEffect(() => {
    if (!isSideMenuOpen && !loadingNotifications && !loadingSeen) {
      const allIds = notifications.map((n) => n.id);
      const newCount = allIds.filter((id) => !seenIds.includes(id)).length;
      setNotificationCount(newCount);
    }
  }, [
    isSideMenuOpen,
    notifications,
    seenIds,
    loadingNotifications,
    loadingSeen,
  ]);
  const {
    renderEnvironmentLabel,
    formatPlaytime,
    isSaving,
    saveMessage,
    showImportDialog,
    setShowImportDialog,
    importUuid,
    setImportUuid,
    importError,
    handleImportCloud,
    cloudSaveMode,
    setCloudSaveMode,
    handleSave,
    cloudUuid,
    floatingClicks,
    triggerSaveFeedback,
    money,
    playTime,
    totalMoneyPerSecond,
    manualMoneyPerSecond,
    currentRunShares,
    prestigeShares,
    prestigeGame,
    canPrestige,
  } = useGameHeaderLogic({ ...props });

  const { buyQuantity, toggleBuyQuantity } = props;
  const [showSettings, setShowSettings] = useState(false);

  const {
    uiProgress,
    showPlaytime,
    setShowPlaytime,
    showClickStats,
    setShowClickStats,
    showLeaderboard,
    setShowLeaderboard,
    showAchievementsHeaderButton,
    setShowAchievementsHeaderButton,
    showStatisticsHeaderButton,
    setShowStatisticsHeaderButton,
    prestigeButtonEverVisible,
    setPrestigeButtonEverVisible,
  } = useUiProgress();

  React.useEffect(() => {
    if (!showClickStats) setShowClickStats(true);
  }, [showClickStats, setShowClickStats]);

  const [showCloudSaveConfirm, setShowCloudSaveConfirm] = useState(false);
  const [showCloudSaveDisableConfirm, setShowCloudSaveDisableConfirm] =
    useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);

  const shouldShowPrestigeButtonBasedOnMoney =
    props.money >= props.gameConfig.prestige.minMoneyForModalButton;
  const showPrestigeButtonInHeader =
    prestigeButtonEverVisible || shouldShowPrestigeButtonBasedOnMoney;

  React.useEffect(() => {
    if (shouldShowPrestigeButtonBasedOnMoney && !prestigeButtonEverVisible) {
      setPrestigeButtonEverVisible(true);
    }
  }, [
    shouldShowPrestigeButtonBasedOnMoney,
    prestigeButtonEverVisible,
    setPrestigeButtonEverVisible,
  ]);

  const {
    autoBuyerUnlocked,
    cooldownAutoBuyerUnlocked,
    globalMultiplierAutoBuyerUnlocked,
    globalPriceDecreaseAutoBuyerUnlocked,
    setIsAutoBuyerModalOpen,
    autoBuyValueUpgradeEnabled,
    autoBuyCooldownUpgradeEnabled,
    autoBuyGlobalMultiplierEnabled,
    autoBuyGlobalPriceDecreaseEnabled,
  } = props;

  const isAutoBuyerActive =
    autoBuyValueUpgradeEnabled ||
    autoBuyCooldownUpgradeEnabled ||
    autoBuyGlobalMultiplierEnabled ||
    autoBuyGlobalPriceDecreaseEnabled;

  const anyAutoBuyerUnlocked =
    autoBuyerUnlocked ||
    cooldownAutoBuyerUnlocked ||
    globalMultiplierAutoBuyerUnlocked ||
    globalPriceDecreaseAutoBuyerUnlocked;

  const displayTotalMoneyPerSecond =
    totalMoneyPerSecond + (manualMoneyPerSecond || 0);

  return (
    <>
      {isSaving && (
        <div className="save-feedback-banner">{saveMessage || "Saving..."}</div>
      )}
      <div className="game-header-container">
        <h1 className="game-title">
          Euro Clicker Game
          {renderEnvironmentLabel()}
        </h1>
      </div>
      <div id="money-display" className="money-display">
        {formatNumber(money)} €
        {displayTotalMoneyPerSecond > -1 && (
          <span className="per-second">
            +{formatNumber(displayTotalMoneyPerSecond)} €/s
          </span>
        )}
      </div>
      <button
        className="menu-toggle-button"
        onClick={() => setIsSideMenuOpen(true)}
        title="Menu"
        aria-label="Menu"
      >
        <MenuIcon size={22} />
      </button>
      <div className="header-actions">
        <div className="header-actions-content">
          <button
            className="settings-button header-icon"
            onClick={() => setShowSettings(true)}
            title="Settings"
            aria-label="Settings"
          >
            <SettingsIcon size={20} />
          </button>
          <button
            className="settings-button header-icon"
            onClick={handleSave}
            title="Save"
            aria-label="Save"
          >
            {cloudSaveMode ? (
              <CloudUploadIcon size={20} />
            ) : (
              <SaveIcon size={20} />
            )}
          </button>
          <button
            className="settings-button header-icon"
            onClick={() => setShowNotifications(true)}
            title="Notifications"
            aria-label="Notifications"
          >
            {notificationCount === 0 ? <MailOpenIcon size={20}/> : <MailIcon size={20}/>}
            {notificationCount > 0 && (
              <span className="notification-badge">
                {/* {notificationCount} */}
              </span>
            )}
          </button>
          {uiProgress.showStatisticsHeaderButton && (
            <button
              className="settings-button header-icon"
              onClick={() => setShowStatisticsModal(true)}
              title="Statistics"
              aria-label="Statistics"
            >
              <BarChart2Icon size={20} />
            </button>
          )}
          {uiProgress.showAchievementsHeaderButton &&
            props.hasAnyAchievement && (
              <button
                className="settings-button header-icon"
                onClick={() => setShowAchievements(true)}
                title="Achievements"
                aria-label="Achievements"
              >
                <AwardIcon size={20} />
              </button>
            )}
          {uiProgress.showLeaderboard && (
            <button
              className="settings-button header-icon"
              onClick={() => setShowLeaderboardModal(true)}
              title="Show Leaderboard"
            >
              <CrownIcon size={22} />
            </button>
          )}
          {showPrestigeButtonInHeader && (
            <button
              className="settings-button header-icon prestige-header-button"
              onClick={() => setShowPrestigeModal(true)}
              title="Prestige"
            >
              {props.prestigeCount === 0 ? (
                <span className="prestige-pulse">
                  <PrestigeHeaderIcon size={20} fill="gold" stroke="gold" />
                </span>
              ) : (
                <PrestigeHeaderIcon size={20} />
              )}
            </button>
          )}
          {anyAutoBuyerUnlocked && (
            <button
              className="settings-button header-icon"
              onClick={() => setIsAutoBuyerModalOpen(true)}
              title="AutoBuyer Settings"
              aria-label="AutoBuyer Settings"
            >
              {isAutoBuyerActive ? (
                <BotIcon size={24} />
              ) : (
                <BotOffIcon size={24} />
              )}
              {isAutoBuyerActive && <span className="active-badge"></span>}
            </button>
          )}
          <button
            className="settings-button header-icon buy-quantity-toggle-button"
            onClick={toggleBuyQuantity}
            title={`Toggle Buy Quantity (Currently: x${buyQuantity})`}
            aria-label={`Toggle Buy Quantity, current is x${buyQuantity}`}
          >
            {buyQuantity === 1 ? (
              <Layers2Icon size={20} />
            ) : (
              <LayersIcon size={20} />
            )}
            <span className="buy-quantity-label">x{buyQuantity}</span>
          </button>
          {showClickStats && (
            <span className="header-clickstats">
              <MousePointerClickIcon size={20} />
              {String(floatingClicks ?? 0).padStart(5, "0")}
            </span>
          )}
          {showPlaytime && (
            <span className="header-playtime">
              <ClockIcon size={20} />
              {formatPlaytime(playTime, false)}
            </span>
          )}
        </div>
      </div>
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showPlaytime={showPlaytime}
        setShowPlaytime={setShowPlaytime}
        showClickStats={showClickStats}
        setShowClickStats={setShowClickStats}
        showLeaderboard={showLeaderboard}
        setShowLeaderboard={setShowLeaderboard}
        cloudSaveMode={cloudSaveMode}
        setCloudSaveMode={setCloudSaveMode}
        showCloudSaveConfirm={showCloudSaveConfirm}
        setShowCloudSaveConfirm={setShowCloudSaveConfirm}
        showCloudSaveDisableConfirm={showCloudSaveDisableConfirm}
        setShowCloudSaveDisableConfirm={setShowCloudSaveDisableConfirm}
        cloudUuid={cloudUuid}
        triggerSaveFeedback={triggerSaveFeedback}
        showImportDialog={showImportDialog}
        setShowImportDialog={setShowImportDialog}
        importUuid={importUuid}
        setImportUuid={setImportUuid}
        importError={importError}
        handleImportCloud={handleImportCloud}
        handleSave={handleSave}
        hasAnyAchievement={props.hasAnyAchievement}
        showAchievementsHeaderButton={showAchievementsHeaderButton}
        setShowAchievementsHeaderButton={setShowAchievementsHeaderButton}
        showStatisticsHeaderButton={showStatisticsHeaderButton}
        setShowStatisticsHeaderButton={setShowStatisticsHeaderButton}
        musicEnabled={props.musicEnabled}
        setMusicEnabled={props.setMusicEnabled}
        soundEffectsEnabled={props.soundEffectsEnabled}
        setSoundEffectsEnabled={props.setSoundEffectsEnabled}
      />
      <AchievementsModal
        showAchievements={showAchievements}
        setShowAchievements={setShowAchievements}
        achievements={props.achievements}
        money={props.money}
        totalClicks={props.floatingClicks}
        gameTime={props.playTime}
      />
      {showPrestigeModal && (
        <PrestigeModal
          show={showPrestigeModal}
          onClose={() => setShowPrestigeModal(false)}
          currentRunShares={currentRunShares}
          accumulatedPrestigeShares={prestigeShares}
          onPrestige={() => {
            prestigeGame();
            setShowPrestigeModal(false);
          }}
          canPrestige={canPrestige}
        />
      )}
      <MoneyBanner money={formatNumber(money)} />
      {showLeaderboardModal && (
        <LeaderboardModal
          show={showLeaderboardModal}
          onClose={() => setShowLeaderboardModal(false)}
        />
      )}

      <StatisticsModal
        show={showStatisticsModal}
        onClose={() => setShowStatisticsModal(false)}
        playTime={props.playTime}
        activePlayTime={props.activePlayTime}
        inactivePlayTime={props.inactivePlayTime}
        totalClicks={floatingClicks}
        prestigeCount={props.prestigeCount}
        prestigeShares={props.prestigeShares}
      />
      <SideMenu
        isOpen={isSideMenuOpen}
        setIsOpen={setIsSideMenuOpen}
        onOpenSettings={() => setShowSettings(true)}
        onToggleLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenAchievements={() => setShowAchievements(true)}
        onOpenStatistics={() => setShowStatisticsModal(true)}
        showPrestigeOption={showPrestigeButtonInHeader}
        onOpenPrestige={() => setShowPrestigeModal(true)}
        reloadSeenIds={reloadSeenIds}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
    </>
  );
}

GameHeader.propTypes = {
  money: PropTypes.number.isRequired,
  totalMoneyPerSecond: PropTypes.number.isRequired,
  manualMoneyPerSecond: PropTypes.number,
  playTime: PropTypes.number.isRequired,
  activePlayTime: PropTypes.number.isRequired,
  inactivePlayTime: PropTypes.number.isRequired,
  floatingClicks: PropTypes.number.isRequired,
  cloudSaveMode: PropTypes.bool.isRequired,
  setCloudSaveMode: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  cloudUuid: PropTypes.string,
  achievements: PropTypes.object.isRequired,
  hasAnyAchievement: PropTypes.bool.isRequired,
  prestigeCount: PropTypes.number.isRequired,
  prestigeShares: PropTypes.number.isRequired,
  currentRunShares: PropTypes.number.isRequired,
  prestigeGame: PropTypes.func.isRequired,
  canPrestige: PropTypes.bool.isRequired,
  gameConfig: PropTypes.object.isRequired,
  buyQuantity: PropTypes.number.isRequired,
  toggleBuyQuantity: PropTypes.func.isRequired,
  autoBuyerUnlocked: PropTypes.bool.isRequired,
  cooldownAutoBuyerUnlocked: PropTypes.bool.isRequired,
  globalMultiplierAutoBuyerUnlocked: PropTypes.bool.isRequired,
  globalPriceDecreaseAutoBuyerUnlocked: PropTypes.bool.isRequired,
  setIsAutoBuyerModalOpen: PropTypes.func.isRequired,
  autoBuyValueUpgradeEnabled: PropTypes.bool.isRequired,
  autoBuyCooldownUpgradeEnabled: PropTypes.bool.isRequired,
  autoBuyGlobalMultiplierEnabled: PropTypes.bool.isRequired,
  autoBuyGlobalPriceDecreaseEnabled: PropTypes.bool.isRequired,
  musicEnabled: PropTypes.bool.isRequired,
  setMusicEnabled: PropTypes.func.isRequired,
  soundEffectsEnabled: PropTypes.bool.isRequired,
  setSoundEffectsEnabled: PropTypes.func.isRequired,
};