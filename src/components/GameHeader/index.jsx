import { formatNumber } from '@utils/calculators';
import useGameHeaderLogic from '@hooks/useGameHeaderLogic';
import { useState } from 'react';
import {
  Settings as SettingsIcon,
  X as CloseIcon,
  Cloud as CloudIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Save as SaveIcon,
  Trash2 as TrashIcon,
  BarChart2 as BarChartIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Clock as ClockIcon,
  RefreshCw as RefreshIcon,
} from 'lucide-react';

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
  const [showPlaytime, setShowPlaytime] = useState(true);
  const [showClickStats, setShowClickStats] = useState(false);

  // Cloud Save Confirm Modal State
  const [showCloudSaveConfirm, setShowCloudSaveConfirm] = useState(false);
  const [pendingCloudSaveValue, setPendingCloudSaveValue] = useState(null);

  // Remove cloudUuid/showUuid from header if cloudSaveMode is now only in settings

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
          className="header-button"
          onClick={() => setShowSettings(true)}
          title="Settings"
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
        </button>
        <button
          className="header-button"
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
            Clicks: {String(floatingClicks ?? 0).padStart(5, '0')}
          </span>
        )}
        {showPlaytime && (
          <span className="header-playtime">{formatPlayTime(playTime)}</span>
        )}
      </div>
      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="settings-modal-header">
              <h3>Settings</h3>
              <button
                className="modal-btn settings-modal-close"
                onClick={() => setShowSettings(false)}
                title="Close"
                aria-label="Close"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="settings-modal-content">
              {/* Spielzeit Toggle */}
              <div className="settings-row">
                <ClockIcon size={20} className="settings-icon" />
                <span className="settings-label">Show Playtime</span>
                <button
                  className="header-button"
                  onClick={() => setShowPlaytime(v => !v)}
                  title={showPlaytime ? "Hide Playtime" : "Show Playtime"}
                >
                  {showPlaytime ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
                </button>
              </div>
              {/* Clicker Statistik Toggle */}
              <div className="settings-row">
                <BarChartIcon size={20} className="settings-icon" />
                <span className="settings-label">Show Click Stats</span>
                <button
                  className="header-button"
                  onClick={() => setShowClickStats(v => !v)}
                  title={showClickStats ? "Hide Click Stats" : "Show Click Stats"}
                >
                  {showClickStats ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
                </button>
              </div>
              {/* Cloud Save Toggle */}
              <div className="settings-row">
                <CloudIcon size={20} className="settings-icon" />
                <span className="settings-label">Enable Cloud Save</span>
                <button
                  className={`header-button${cloudSaveMode ? ' active' : ''}`}
                  onClick={() => {
                    const next = !cloudSaveMode;
                    if (!cloudSaveMode && next) {
                      // Cloud Save wird aktiviert: Bestätigungsmodal anzeigen
                      setPendingCloudSaveValue(true);
                      setShowCloudSaveConfirm(true);
                    } else {
                      // Direkt deaktivieren ohne Modal
                      setCloudSaveMode(next);
                      window.dispatchEvent(new CustomEvent('game:cloudsavemode', { detail: { cloudSaveMode: next } }));
                    }
                  }}
                  title={cloudSaveMode ? "Cloud-Save: ON" : "Cloud-Save: OFF"}
                >
                  {cloudSaveMode ? <CloudIcon size={18} /> : <SaveIcon size={18} />}
                </button>
              </div>
              {/* Cloud UUID Anzeige */}
              {cloudSaveMode && cloudUuid && (
                <div className="settings-row settings-row-uuid">
                  <span
                    className="settings-uuid"
                    title="Your Cloud Save UUID (copy & use on other device)"
                    onClick={() => {
                      navigator.clipboard?.writeText(cloudUuid);
                      triggerSaveFeedback('UUID copied');
                    }}
                  >
                    {cloudUuid}
                  </span>
                </div>
              )}
              {/* Import from Cloud */}
              <div className="settings-row">
                <CloudDownloadIcon size={20} className="settings-icon" />
                <span className="settings-label">Import from Cloud</span>
                <button
                  className="header-button"
                  onClick={() => setShowImportDialog(true)}
                  title="Import from Cloud"
                >
                  <CloudDownloadIcon size={18} />
                </button>
              </div>
              {/* Reset Button */}
              <div className="settings-row">
                <TrashIcon size={20} className="settings-icon" />
                <span className="settings-label">Reset Game</span>
                <button
                  className="header-button"
                  onClick={() => {
                    const confirmReset = window.confirm('Are you sure you want to reset your game progress?');
                    if (confirmReset) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  title="Reset Game"
                >
                  <RefreshIcon size={18} />
                </button>
              </div>
            </div>
            {/* Import Modal im Modal */}
            {showImportDialog && (
              <div className="modal-backdrop" style={{ zIndex: 10000 }}>
                <div className="modal-content" style={{ maxWidth: 400 }}>
                  <h3>Import Cloud Save</h3>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Enter UUID"
                    value={importUuid}
                    onChange={e => setImportUuid(e.target.value)}
                    autoFocus
                  />
                  {importError && <div className="modal-error">{importError}</div>}
                  <div className="modal-actions">
                    <button
                      className="modal-btn"
                      onClick={handleImportCloud}
                      style={{ marginRight: 0 }}
                    >
                      Import
                    </button>
                    <button
                      className="modal-btn"
                      onClick={() => setShowImportDialog(false)}
                      style={{ background: '#eee', color: '#333' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Cloud Save Confirm Modal */}
            {showCloudSaveConfirm && (
              <div className="modal-backdrop" style={{ zIndex: 10001 }}>
                <div className="modal-content" style={{ maxWidth: 420 }}>
                  <h3>Enable Cloud Save</h3>
                  <p style={{ marginBottom: 18 }}>
                    Your game progress will be saved anonymously in the cloud. You will receive a unique ID (UUID) that you can use to restore your progress on any device.<br /><br />
                    Do you want to enable Cloud Save now?
                  </p>
                  <div className="modal-actions">
                    <button
                      className="modal-btn"
                      onClick={() => {
                        setCloudSaveMode(true);
                        window.dispatchEvent(new CustomEvent('game:cloudsavemode', { detail: { cloudSaveMode: true } }));
                        setShowCloudSaveConfirm(false);
                        setPendingCloudSaveValue(null);
                      }}
                    >
                      Okay
                    </button>
                    <button
                      className="modal-btn"
                      style={{ background: '#eee', color: '#333' }}
                      onClick={() => {
                        setShowCloudSaveConfirm(false);
                        setPendingCloudSaveValue(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}