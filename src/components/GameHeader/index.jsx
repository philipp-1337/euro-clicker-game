import { formatNumber } from '@utils/calculators';
import useGameHeaderLogic from '@hooks/useGameHeaderLogic';
import { useState } from 'react';
import {
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  MousePointerClick as MousePointerClickIcon,
  HourglassIcon,
  Trophy as TrophyIcon,
  Crown as CrownIcon,
} from 'lucide-react';
import GameSettingsModal from './GameSettingsModal';
import AchievementsModal from './AchievementsModal';
import LeaderboardModal from './LeaderboardModal';
import MoneyBanner from '@components/MoneyBanner';
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
  } = useUiProgress();

  // Cloud Save Confirm Modal State
  const [showCloudSaveConfirm, setShowCloudSaveConfirm] = useState(false);
  const [showCloudSaveDisableConfirm, setShowCloudSaveDisableConfirm] = useState(false);

  const [showAchievements, setShowAchievements] = useState(false);

  // Lokaler State für das Leaderboard-Modal
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

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
      {/* Spielzeit, Clicker-Statistik, Manuelles Speichern und Settings */}
      <div className="header-actions">
        <button
          className="settings-button"
          onClick={() => setShowSettings(true)}
          title="Settings"
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
        </button>
        <button
          className="settings-button"
          onClick={handleSave}
          title="Save"
          aria-label="Save"
        >
          {cloudSaveMode
            ? <CloudUploadIcon size={20} />
            : <SaveIcon size={20} />
          }
        </button>
        {props.hasAnyAchievement && (
        <button
          className="settings-button"
          onClick={() => setShowAchievements(true)}
          title="Achievements"
          aria-label="Achievements"
        >
          <TrophyIcon size={20} />
        </button>
        )}
        {/* Crown Icon für Leaderboard-Mode */}
        {uiProgress.showLeaderboard && (
          <button
            className="settings-button"
            onClick={() => setShowLeaderboardModal(true)}
            title="Show Leaderboard"
          >
            <CrownIcon size={22} />
          </button>
        )}
        {showClickStats && (
          <span className="header-clickstats">
            <MousePointerClickIcon size={20} />
            {String(floatingClicks ?? 0).padStart(5, '0')}
          </span>
        )}
        {showPlaytime && (
          <span className="header-playtime">
            <HourglassIcon size={20} />
            {formatPlaytime(playTime)}</span>
        )}
      </div>
      {/* Settings Modal */}
      <GameSettingsModal
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
      {showLeaderboardModal && uiProgress.showLeaderboard && (
        <LeaderboardModal show={showLeaderboardModal} onClose={() => setShowLeaderboardModal(false)} />
      )}
       <SideMenu 
        onOpenSettings={() => setShowSettings(true)} 
        showLeaderboard={showLeaderboard}
        onToggleLeaderboard={() => {
          // Hier kannst du die Logik zum Öffnen des Leaderboards einfügen
          // z.B. setShowLeaderboardModal(true) oder ähnliches
        }}
      />
    </>
  );
}