import { formatNumber } from '@utils/calculators';
import useGameHeaderLogic from '@hooks/useGameHeaderLogic';
import { useState } from 'react';
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
} from 'lucide-react';
import SettingsModal from './SettingsModal';
import AchievementsModal from './AchievementsModal';
import LeaderboardModal from './LeaderboardModal';
import MoneyBanner from '@components/MoneyBanner/MoneyBanner';
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
  } = useGameHeaderLogic({ ...props });

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
  } = useUiProgress();

  // Cloud Save Confirm Modal State
  const [showCloudSaveConfirm, setShowCloudSaveConfirm] = useState(false);
  const [showCloudSaveDisableConfirm, setShowCloudSaveDisableConfirm] = useState(false);

  const [showAchievements, setShowAchievements] = useState(false);

  // Lokaler State für das Leaderboard-Modal
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // State für das Statistics Modal
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);


  // SideMenu State
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <>
      {isSaving && (
        <div className="save-feedback-banner">
          {saveMessage}
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
        {totalMoneyPerSecond > 0 && (
          <span className="per-second">
            +{formatNumber(totalMoneyPerSecond)} €/s
          </span>
        )}
      </div>
      {/* Der menu-toggle-button ist position:fixed und beeinflusst den Flow hier nicht direkt,
          aber wir brauchen Platz dafür im .header-actions Bereich. */}
      <button
        className="menu-toggle-button"
        onClick={() => setIsSideMenuOpen(true)}
        title="Menü"
        aria-label="Menü"
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
      />
      <AchievementsModal
        showAchievements={showAchievements}
        setShowAchievements={setShowAchievements}
        achievements={props.achievements}
        money={props.money}
        totalClicks={props.floatingClicks}
        gameTime={props.playTime}
      />
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
        totalClicks={floatingClicks} // Klicks hier übergeben
      />
      <SideMenu 
        isOpen={isSideMenuOpen}
        setIsOpen={setIsSideMenuOpen}
        onOpenSettings={() => setShowSettings(true)} 
        onToggleLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenAchievements={() => setShowAchievements(true)}
        onOpenStatistics={() => setShowStatisticsModal(true)}
      />
    </>
  );
}