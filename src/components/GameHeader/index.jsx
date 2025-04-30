import { formatNumber } from '@utils/calculators';
import useGameHeaderLogic from '@hooks/useGameHeaderLogic';
import { useState } from 'react';
import {
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  MousePointerClick as MousePointerClickIcon,
  HourglassIcon,
  Trophy,
} from 'lucide-react';
import GameSettingsModal from './GameSettingsModal';
import AchievementsModal from './AchievementsModal';
import { useAchievements } from '@hooks/useAchievements';
import { useUiProgress } from '@hooks/useUiProgress';
import { gameConfig } from '@constants/gameConfig';

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
  const [showAchievements, setShowAchievements] = useState(false);

  // Achievement-Banner Hook verwenden
  const { achievementBanner } = useAchievements(gameConfig);

  // UI-Progress für Playtime/ClickStats persistente Anzeige
  const {
    showPlaytime,
    setShowPlaytime,
    showClickStats,
    setShowClickStats,
  } = useUiProgress();

  // Cloud Save Confirm Modal State
  const [showCloudSaveConfirm, setShowCloudSaveConfirm] = useState(false);

  return (
    <>
      {isSaving && (
        <div className="save-feedback-banner">
          {saveMessage}
        </div>
      )}
      {achievementBanner && (
        <div className="save-feedback-banner achievement-banner">
          <Trophy size={20} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          <span style={{ verticalAlign: 'middle' }}>{achievementBanner}</span>
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
        {/* Trophy icon for achievements */}
        {Object.values(props.achievements || {}).some(Boolean) && (
          <button
            className="settings-button"
            onClick={() => setShowAchievements(true)}
            title="Achievements"
            aria-label="Achievements"
          >
            <Trophy size={20} />
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
        show={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={props.achievements}
      />
    </>
  );
}