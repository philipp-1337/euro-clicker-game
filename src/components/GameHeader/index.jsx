import React, { useState } from 'react';
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
  Zap as PrestigeHeaderIcon, // Icon für Prestige
  Layers as LayersIcon,
  Layers2Icon, // Icon for buy quantity 
  BotIcon as AutoBuyerSettingsIcon
} from 'lucide-react';
import SettingsModal from './SettingsModal';
import AchievementsModal from './AchievementsModal';
import LeaderboardModal from './LeaderboardModal';
import MoneyBanner from '@components/MoneyBanner/MoneyBanner';
import PrestigeModal from '@components/PrestigeModal/PrestigeModal'; // Import PrestigeModal
import StatisticsModal from '../StatisticsModal/StatisticsModal';
import { useUiProgress } from '@hooks/useUiProgress';
import SideMenu from '../SideMenu/SideMenu';

export default function GameHeader(props) {
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
    // Prestige related props from ClickerGame
    currentRunShares,
    prestigeShares, // Accumulated from previous prestiges
    prestigeGame,
    prestigeBonusMultiplier, // Wird jetzt vom Hook geliefert
    canPrestige
    // buyQuantity und toggleBuyQuantity werden direkt aus props bezogen
  } = useGameHeaderLogic({ ...props });

  // Greife direkt auf buyQuantity und toggleBuyQuantity aus den GameHeader-Props zu
  const { buyQuantity, toggleBuyQuantity } = props;
  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);

  // UI-Toggles (Playtime, ClickStats, Leaderboard) aus useUiProgress
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
    prestigeButtonEverVisible, // Get the new state
  } = useUiProgress();

  // Click Counter immer beim Spielstart anzeigen
  // (nur falls noch nicht aktiviert)
  React.useEffect(() => {
    if (!showClickStats) setShowClickStats(true);
    // eslint-disable-next-line
  }, []);

  // Cloud Save Confirm Modal State
  const [showCloudSaveConfirm, setShowCloudSaveConfirm] = useState(false);
  const [showCloudSaveDisableConfirm, setShowCloudSaveDisableConfirm] = useState(false);

  const [showAchievements, setShowAchievements] = useState(false);

  // Lokaler State für das Leaderboard-Modal
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // State für das Statistics Modal
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);

  // State für Prestige Modal
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  
  // Logic to show Prestige button: either money threshold is met OR it has been visible before
  const shouldShowPrestigeButtonBasedOnMoney = props.money >= props.gameConfig.prestige.minMoneyForModalButton;
  const showPrestigeButtonInHeader = prestigeButtonEverVisible || shouldShowPrestigeButtonBasedOnMoney;

  // SideMenu State
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  // AutoBuyer toggles (moved from BasicUpgrades)
  const {
    autoBuyerUnlocked,
    cooldownAutoBuyerUnlocked,
    setIsAutoBuyerModalOpen
  } = props;

  const displayTotalMoneyPerSecond = totalMoneyPerSecond + (manualMoneyPerSecond || 0);

  return (
    <>
      {isSaving && (
        <div className="save-feedback-banner">
          {saveMessage || 'Saving...'}
        </div>
      )}
      <div className="game-header-container">
        <h1 className="game-title">
          Euro Clicker Game
          {renderEnvironmentLabel()}
        </h1>
      </div>
      <div id="money-display" className="money-display">
        {formatNumber(money)} €
        {displayTotalMoneyPerSecond > 0 && (
          <span className="per-second">
            +{formatNumber(displayTotalMoneyPerSecond)} €/s
            {prestigeBonusMultiplier > 1 && (
              <>
                {' '}
                <span className="prestige-bonus-display">
                  ({formatNumber((prestigeBonusMultiplier - 1) * 100)}%)
                </span>
              </>
            )}
          </span>
        )}
      </div>
      {/* Der menu-toggle-button ist position:fixed und beeinflusst den Flow hier nicht direkt,
          aber wir brauchen Platz dafür im .header-actions Bereich. */}
      <button
        className="menu-toggle-button"
        onClick={() => setIsSideMenuOpen(true)}
        title="Menu"
        aria-label="Menu"
      >
        <MenuIcon size={22} />
      </button>
      <div className="header-actions"> {/* Äußerer, scrollbarer Container */}
        <div className="header-actions-content"> {/* Innerer Container für die Icons */}
          {/* Settings Button */}
          <button
            className="settings-button header-icon"
            onClick={() => setShowSettings(true)}
            title="Settings"
            aria-label="Settings"
          >
            <SettingsIcon size={20} />
          </button>
          {/* Cloud / Save Button */}
          <button
            className="settings-button header-icon"
            onClick={handleSave}
            title="Save"
            aria-label="Save"
          >
            {cloudSaveMode
              ? <CloudUploadIcon size={20} />
              : <SaveIcon size={20} />
            }
          </button>
          {/* Statistics Button */}
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
          {/* Achievements Button */}
          {uiProgress.showAchievementsHeaderButton && props.hasAnyAchievement && (
          <button
            className="settings-button header-icon"
            onClick={() => setShowAchievements(true)}
            title="Achievements"
            aria-label="Achievements"
          >
            <AwardIcon size={20} />
          </button>
          )}
          {/* Crown Icon für Leaderboard-Mode */}
          {uiProgress.showLeaderboard && (
            <button
              className="settings-button header-icon"
              onClick={() => setShowLeaderboardModal(true)}
              title="Show Leaderboard"
            >
              <CrownIcon size={22} />
            </button>
          )}
          {/* Prestige Button */}
          {showPrestigeButtonInHeader && (
            <button
              className="settings-button header-icon prestige-header-button"
              onClick={() => setShowPrestigeModal(true)}
              title="Prestige"
            >
              <span className="prestige-pulse">
                <PrestigeHeaderIcon size={20} fill='gold' stroke='gold'/>
              </span>
            </button>
          )}
          {(autoBuyerUnlocked || cooldownAutoBuyerUnlocked) && (
            <button
              className="settings-button header-icon"
              onClick={() => setIsAutoBuyerModalOpen(true)}
              title="AutoBuyer Settings"
              aria-label="AutoBuyer Settings"
            >
              <AutoBuyerSettingsIcon size={20} />
            </button>
          )}
          {/* Upgrade Quantity Toggle Button */}
          <button
            className="settings-button header-icon buy-quantity-toggle-button"
            onClick={toggleBuyQuantity}
            title={`Toggle Upgrade Quantity (Currently: x${buyQuantity})`}
            aria-label={`Toggle Upgrade Quantity, current is x${buyQuantity}`}
          >
            {buyQuantity === 1 ? (
              <Layers2Icon size={20} />
            ) : (
              <LayersIcon size={20} />
            )}
            <span className="buy-quantity-label">x{buyQuantity}</span>
          </button>
          {/* Click-Counter */}
          {showClickStats && (
            <span className="header-clickstats">
              <MousePointerClickIcon size={20} />
              {String(floatingClicks ?? 0).padStart(5, '0')}
            </span>
          )}
          {/* Playtime */}
          {showPlaytime && (
            <span className="header-playtime">
              <ClockIcon size={20} />
              {formatPlaytime(playTime, false)}</span>
          )}
        </div>
      </div>
      {/* Settings Modal */}
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
        hasAnyAchievement={props.hasAnyAchievement} // Prop hier weitergeben
        showAchievementsHeaderButton={showAchievementsHeaderButton}
        setShowAchievementsHeaderButton={setShowAchievementsHeaderButton}
        showStatisticsHeaderButton={showStatisticsHeaderButton}
        setShowStatisticsHeaderButton={setShowStatisticsHeaderButton}
        musicEnabled={props.musicEnabled} // Pass down
        setMusicEnabled={props.setMusicEnabled} // Pass down
        soundEffectsEnabled={props.soundEffectsEnabled} // Pass down
        setSoundEffectsEnabled={props.setSoundEffectsEnabled} // Pass down
      />
      <AchievementsModal
        showAchievements={showAchievements}
        setShowAchievements={setShowAchievements}
        achievements={props.achievements}
        money={props.money}
        totalClicks={props.floatingClicks}
        gameTime={props.playTime}
      />
      {/* Prestige Modal */}
      {showPrestigeModal && (
        <PrestigeModal
          show={showPrestigeModal}
          onClose={() => setShowPrestigeModal(false)}
          currentRunShares={currentRunShares}
          accumulatedPrestigeShares={prestigeShares}
          onPrestige={() => {
            prestigeGame();
            setShowPrestigeModal(false); // Close modal after prestiging
          }}
          canPrestige={canPrestige}
        />
      )}
      <MoneyBanner money={formatNumber(money)} />
      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <LeaderboardModal show={showLeaderboardModal} onClose={() => setShowLeaderboardModal(false)} />
      )}
      {/* Statistics Modal */}

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
        showPrestigeOption={showPrestigeButtonInHeader} // Pass visibility to SideMenu
        onOpenPrestige={() => setShowPrestigeModal(true)} // Handler to open PrestigeModal
      />
    </>
  );
}