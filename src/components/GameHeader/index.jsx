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
} from 'lucide-react';
import GameSettingsModal from './GameSettingsModal';
import AchievementsModal from './AchievementsModal';
import { useUiProgress } from '@hooks/useUiProgress';

export default function GameHeader(props) {
  const {
    renderEnvironmentLabel,
    formatPlayTime,
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
  } = useGameHeaderLogic(props);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  // Local UI state for toggles

  // UI-Progress für Playtime/ClickStats persistente Anzeige
  const {
    showPlaytime,
    setShowPlaytime,
    showClickStats,
    setShowClickStats,
  } = useUiProgress();

  // Cloud Save Confirm Modal State
  const [showCloudSaveConfirm, setShowCloudSaveConfirm] = useState(false);
  const [showCloudSaveDisableConfirm, setShowCloudSaveDisableConfirm] = useState(false);

  const [showAchievements, setShowAchievements] = useState(false);

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
      <div className="money-display">
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
          onClick={() => setShowAchievements(true)}
          title="Achievements"
          aria-label="Achievements"
        >
          <TrophyIcon size={20} />
        </button>
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
        {showClickStats && (
          <span className="header-clickstats">
            <MousePointerClickIcon size={20} />
            {String(floatingClicks ?? 0).padStart(5, '0')}
          </span>
        )}
        {showPlaytime && (
          <span className="header-playtime">
            <HourglassIcon size={20} />
            {formatPlayTime(playTime)}</span>
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
    </>
  );
}