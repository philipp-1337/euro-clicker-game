import React from "react";
import {
  X as CloseIcon,
  Cloud as CloudIcon,
  CloudDownload as CloudDownloadIcon,
  CloudOff as CloudOffIcon,
  Trash2 as TrashIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Clock as ClockIcon,
  RefreshCw as RefreshIcon,
  CloudAlert,
  ClipboardCopyIcon,
  IdCardIcon,
  FolderOpen,
  RotateCwIcon,
  TabletSmartphoneIcon,
  SunMoon as SunMoonIcon,
  CrownIcon,
  MoonIcon,
  SunIcon,
  MousePointerClickIcon,
  Music2 as MusicIcon,
  Volume2 as SoundEffectsIcon,
  VolumeX as MuteIcon,
  BarChart2 as BarChart2Icon,
  AwardIcon,
} from "lucide-react";
import useCloudSave from '@hooks/useCloudSave';
import { useModal } from '../../hooks/useModal';

// Hilfsfunktion für Standalone-Detection
function isStandaloneMobile() {
  // iOS
  if (window.navigator.standalone) return true;
  // Android/Chrome
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return false;
}

export default function SettingsModal({
  showSettings,
  setShowSettings,
  showPlaytime,
  setShowPlaytime,
  showClickStats,
  setShowClickStats,
  showLeaderboard,
  setShowLeaderboard,
  cloudSaveMode,
  setCloudSaveMode,
  showCloudSaveConfirm,
  setShowCloudSaveConfirm,
  showCloudSaveDisableConfirm,
  setShowCloudSaveDisableConfirm,
  cloudUuid,
  triggerSaveFeedback,
  showImportDialog,
  setShowImportDialog,
  importUuid,
  setImportUuid,
  importError,
  handleImportCloud,
  handleSave,
  hasAnyAchievement, // Neue Prop
  showAchievementsHeaderButton,
  setShowAchievementsHeaderButton,
  musicEnabled, // New
  setMusicEnabled, // New
  soundEffectsEnabled, // New
  setSoundEffectsEnabled, // New
  showStatisticsHeaderButton,
  setShowStatisticsHeaderButton,
}) {
  const modalRef = useModal(showSettings, () => setShowSettings(false));
  const showReloadButton = isStandaloneMobile();
  const [showReloadConfirm, setShowReloadConfirm] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  // Dark Mode State (global und persistiert im Savegame)
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Zuerst aus clickerSave laden, dann localStorage fallback
    try {
      const saveRaw = localStorage.getItem('clickerSave');
      if (saveRaw) {
        const save = JSON.parse(saveRaw);
        if (typeof save.darkMode === 'boolean') return save.darkMode;
      }
    } catch {}
    return localStorage.getItem('darkMode') === 'true';
  });
  const { deleteFromCloud } = useCloudSave();

  // Dark Mode Änderung: Body, LocalStorage und clickerSave (für Cloud)
  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
    // clickerSave aktualisieren
    try {
      const saveRaw = localStorage.getItem('clickerSave');
      if (saveRaw) {
        const save = JSON.parse(saveRaw);
        if (save.darkMode !== isDarkMode) {
          localStorage.setItem('clickerSave', JSON.stringify({ ...save, darkMode: isDarkMode }));
        }
      }
    } catch {}
  }, [isDarkMode]);

  // Dark Mode nach Cloud Import anwenden (Listener)
  React.useEffect(() => {
    const handler = (e) => {
      try {
        // Nach Cloud Import: clickerSave prüfen
        const saveRaw = localStorage.getItem('clickerSave');
        if (saveRaw) {
          const save = JSON.parse(saveRaw);
          if (typeof save.darkMode === 'boolean') {
            setIsDarkMode(save.darkMode);
          }
        }
      } catch {}
    };
    window.addEventListener('game:cloudimported', handler);
    return () => window.removeEventListener('game:cloudimported', handler);
  }, []);

  if (!showSettings) return null;

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal-content">
        <div className="settings-modal-header">
          <h3>Settings</h3>
          <button
            className="settings-button"
            onClick={() => setShowSettings(false)}
            title="Close"
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="settings-modal-content">
          {/* Display options */}
          <h4 className="settings-section-title">Display options</h4>
          {/* Statistics Button Toggle */}
          <div className="settings-row">
            <BarChart2Icon size={20} className="settings-icon" />
            <button
              className="settings-label btn"
              onClick={() => setShowStatisticsHeaderButton((v) => !v)}
              title={showStatisticsHeaderButton ? "Hide Statistics button" : "Show Statistics button"}
              type="button"
            >
              {showStatisticsHeaderButton ? "Hide Statistics button" : "Show Statistics button"}
            </button>
            <button
              className={`settings-button${showStatisticsHeaderButton ? " active" : ""}`}
              onClick={() => setShowStatisticsHeaderButton((v) => !v)}
              title={showStatisticsHeaderButton ? "Hide Statistics button" : "Show Statistics button"}
              type="button"
            >
              {showStatisticsHeaderButton ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
            </button>
          </div>
          {/* Achievements Button Toggle (nur anzeigen, wenn Achievements vorhanden sind) */}
          {hasAnyAchievement && (
            <div className="settings-row">
              <AwardIcon size={20} className="settings-icon" />
              <button
                className="settings-label btn"
                onClick={() => setShowAchievementsHeaderButton((v) => !v)}
                title={showAchievementsHeaderButton ? "Hide Achievements button" : "Show Achievements button"}
                type="button"
              >
                {showAchievementsHeaderButton ? "Hide Achievements button" : "Show Achievements button"}
              </button>
              <button
                className={`settings-button${showAchievementsHeaderButton ? " active" : ""}`}
                onClick={() => setShowAchievementsHeaderButton((v) => !v)}
                title={showAchievementsHeaderButton ? "Hide Achievements button" : "Show Achievements button"}
                type="button"
              >
                {showAchievementsHeaderButton ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
              </button>
            </div>
          )}
          {/* Leaderboard Toggle (blendet NUR den Button ein/aus, öffnet NICHT das Modal) */}
          <div className="settings-row">
            <CrownIcon size={20} className="settings-icon" />
            <button
              className="settings-label btn"
              onClick={() => setShowLeaderboard((v) => !v)}
              title={showLeaderboard ? "Leaderboard-Button ausblenden" : "Leaderboard-Button einblenden"}
              type="button"
            >
              {showLeaderboard ? "Hide Leaderboard button" : "Show Leaderboard button"}
            </button>
            <button
              className={`settings-button${showLeaderboard ? " active" : ""}`}
              onClick={() => setShowLeaderboard((v) => !v)}
              title={showLeaderboard ? "Leaderboard-Button ausblenden" : "Leaderboard-Button einblenden"}
              type="button"
            >
              {showLeaderboard ? (
                <EyeIcon size={18} />
              ) : (
                <EyeOffIcon size={18} />
              )}
            </button>
          </div>
          {/* Clicker Counter Toggle */}
          <div className="settings-row">
            <MousePointerClickIcon size={20} className="settings-icon" />
            <button
              className="settings-label btn"
              onClick={() => setShowClickStats((v) => !v)}
              title={showClickStats ? "Hide Click Counter" : "Show Click Counter"}
            >
              {showClickStats ? "Hide Click Counter" : "Show Click Counter"}
            </button>
            <button
              className="settings-button"
              onClick={() => setShowClickStats((v) => !v)}
              title={showClickStats ? "Hide Click Counter" : "Show Click Counter"}
            >
              {showClickStats ? (
                <EyeIcon size={18} />
              ) : (
                <EyeOffIcon size={18} />
              )}
            </button>
          </div>
          {/* Spielzeit Toggle */}
          <div className="settings-row">
            <ClockIcon size={20} className="settings-icon" />
            <button
              className="settings-label btn"
              onClick={() => setShowPlaytime((v) => !v)}
              title={showPlaytime ? "Hide Playtime" : "Show Playtime"}
            >
              {showPlaytime ? "Hide Playtime" : "Show Playtime"}
            </button>
            <button
              className="settings-button"
              onClick={() => setShowPlaytime((v) => !v)}
              title={showPlaytime ? "Hide Playtime" : "Show Playtime"}
            >
              {showPlaytime ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
            </button>
          </div>
          {/* Dark Mode Toggle */}
          <div className="settings-row">
            <SunMoonIcon size={20} className="settings-icon" />
            <button
              className="settings-label btn"
              onClick={() => setIsDarkMode((v) => !v)}
              title={isDarkMode ? "Dark Mode deaktivieren" : "Dark Mode aktivieren"}
            >
              {isDarkMode ? "Disable Dark Mode" : "Enable Dark Mode"} 
              {/* <span className="settings-uuid">alpha</span> */}
            </button>
            <button
              className="settings-button"
              onClick={() => setIsDarkMode((v) => !v)}
              title={isDarkMode ? "Dark Mode deaktivieren" : "Dark Mode aktivieren"}
              aria-label="Dark Mode Toggle"
            >
              {isDarkMode ? (
                <SunIcon size={18} />
              ) : (
                <MoonIcon size={18} />
              )}
            </button>
          </div>
          {/* Audio Settings */}
          <h4 className="settings-section-title">Audio Settings</h4>
          {/* Background Music Toggle */}
          <div className="settings-row">
            <MusicIcon size={20} className="settings-icon" />
            <button
              className="settings-label btn"
              onClick={() => setMusicEnabled(v => !v)}
              title={musicEnabled ? "Disable Background Music" : "Enable Background Music"}
            >
              {musicEnabled ? "Disable Background Music" : "Enable Background Music"}
            </button>
            <button
              className="settings-button"
              onClick={() => setMusicEnabled(v => !v)}
              title={musicEnabled ? "Disable Background Music" : "Enable Background Music"}
              aria-label="Background Music Toggle"
            >
              {musicEnabled ? <MusicIcon size={18} /> : <MuteIcon size={18} />}
            </button>
          </div>
          {/* Sound Effects Toggle */}
          <div className="settings-row">
            <SoundEffectsIcon size={20} className="settings-icon" />
            <button
              className="settings-label btn"
              onClick={() => setSoundEffectsEnabled(v => !v)}
              title={soundEffectsEnabled ? "Disable Sound Effects" : "Enable Sound Effects"}
            >
              {soundEffectsEnabled ? "Disable Sound Effects" : "Enable Sound Effects"}
            </button>
            <button
              className="settings-button"
              onClick={() => setSoundEffectsEnabled(v => !v)}
              title={soundEffectsEnabled ? "Disable Sound Effects" : "Enable Sound Effects"}
              aria-label="Sound Effects Toggle"
            >
              {soundEffectsEnabled ? <SoundEffectsIcon size={18} /> : <MuteIcon size={18} />}
            </button>
          </div>
          {/* Save options */}
          <h4 className="settings-section-title">Save game options</h4>
          {/* Cloud Save Toggle */}
          <div className="settings-row">
            <CloudIcon size={20} className="settings-icon" />
            <button
              className="settings-label btn"
              onClick={() => {
                const next = !cloudSaveMode;
                if (!cloudSaveMode && next) {
                  setShowCloudSaveConfirm(true);
                } else if (cloudSaveMode && !next) {
                  setShowCloudSaveDisableConfirm(true);
                } else {
                  setCloudSaveMode(next);
                  window.dispatchEvent(
                    new CustomEvent("game:cloudsavemode", {
                      detail: { cloudSaveMode: next },
                    })
                  );
                }
              }}
              title={cloudSaveMode ? "Deactivate Cloud-Save" : "Activate Cloud-Save"}
            >
              {cloudSaveMode ? "Disable Cloud Save" : "Enable Cloud Save"}
            </button>
            <button
              className={`settings-button${cloudSaveMode ? " active" : ""}`}
              onClick={() => {
                const next = !cloudSaveMode;
                if (!cloudSaveMode && next) {
                  setShowCloudSaveConfirm(true);
                } else if (cloudSaveMode && !next) {
                  setShowCloudSaveDisableConfirm(true);
                } else {
                  setCloudSaveMode(next);
                  window.dispatchEvent(
                    new CustomEvent("game:cloudsavemode", {
                      detail: { cloudSaveMode: next },
                    })
                  );
                }
              }}
              title={cloudSaveMode ? "Deactivate Cloud-Save" : "Activate Cloud-Save"}
            >
              {cloudSaveMode ? (
                <CloudOffIcon size={18} />
              ) : (
                <CloudAlert size={18} />
              )}
            </button>
          </div>
          {/* Cloud UUID Anzeige */}
          {cloudSaveMode && cloudUuid && (
            <div className="settings-row">
              <IdCardIcon size={20} className="settings-icon" />
                <span
                  className="settings-uuid"
                  title="Your Cloud Save UUID (copy & use on other device)"
                  onClick={() => {
                    navigator.clipboard?.writeText(cloudUuid);
                    triggerSaveFeedback("UUID copied");
                  }}
                >
                  {cloudUuid}
                </span> 
                <button
                  className="settings-button"
                  onClick={() => {
                    navigator.clipboard?.writeText(cloudUuid);
                    triggerSaveFeedback("UUID copied");
                  }}
                  title="Click to copy UUID"
                >
                  <ClipboardCopyIcon size={18} />
                </button>
            </div>
          )}
          {/* Import from Cloud */}
          <div className="settings-row">
            <CloudDownloadIcon size={20} className="settings-icon" />
            <button
              className="settings-label btn"
              onClick={() => setShowImportDialog(true)}
              title="Import from Cloud"
            >
              Import from Cloud
            </button>
            <button
              className="settings-button"
              onClick={() => setShowImportDialog(true)}
              title="Import from Cloud"
            >
              <FolderOpen size={18} />
            </button>
          </div>
          {/* Danger Zone */}
          <h4 className="settings-section-title danger">Danger Zone</h4>
          {/* App Reload Button für Standalone Mobile */}
          {showReloadButton && (
            <div className="settings-row">
              <TabletSmartphoneIcon size={20} className="settings-icon" />
              <button
                className="settings-label btn"
                onClick={() => setShowReloadConfirm(true)}
                title="Reload App"
              >
                Reload App
              </button>
              <button
                className="settings-button"
                onClick={() => setShowReloadConfirm(true)}
                title="Reload App"
              >
                <RotateCwIcon size={18} />
              </button>
            </div>
          )}
          {/* Reset Button */}
          <div className="settings-row">
            <TrashIcon size={20} className="settings-icon" />
            <button
              className="settings-label btn"
              onClick={() => setShowResetConfirm(true)}
              title="Reset Game"
            >
              Reset Game
            </button>
            <button
              className="settings-button"
              onClick={() => setShowResetConfirm(true)}
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
              <div className="settings-modal-header">
                <h3>Import Cloud Save</h3>
              </div>
              <input
                type="text"
                className="modal-input"
                placeholder="Enter UUID"
                value={importUuid}
                onChange={(e) => setImportUuid(e.target.value)}
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
              <div className="settings-modal-header">
              <h3>Enable Cloud Save</h3>
              </div>
              <p>
                Your game progress will be saved anonymously in the cloud. You
                will receive a unique ID (UUID) that you can use to restore your
                progress on any device.
                <br />
                <br />
                Do you want to enable Cloud Save now?
              </p>
              <div className="modal-actions">
                <button
                  className="modal-btn"
                  onClick={() => {
                    setCloudSaveMode(true);
                    window.dispatchEvent(
                      new CustomEvent("game:cloudsavemode", {
                        detail: { cloudSaveMode: true },
                      })
                    );
                    setShowCloudSaveConfirm(false);
                    if (typeof handleSave === "function") {
                      setTimeout(() => handleSave(), 0);
                    }
                  }}
                >
                  Okay
                </button>
                <button
                  className="modal-btn"
                  onClick={() => {
                    setShowCloudSaveConfirm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Cloud Save Disable Confirm Modal */}
        {showCloudSaveDisableConfirm && (
          <div className="modal-backdrop" style={{ zIndex: 10001 }}>
            <div className="modal-content" style={{ maxWidth: 420 }}>
              <div className="settings-modal-header">
              <h3>Disable Cloud Save</h3>
              </div>
              <p>
                Your game progress will be removed from the cloud. You will no longer be able to restore your progress on other devices.
                <br />
                <br />
                Do you want to disable Cloud Save and remove your data from the cloud?
              </p>
              <div className="modal-actions">
                <button
                  className="modal-btn"
                  onClick={async () => {
                    try {
                      await deleteFromCloud(cloudUuid);
                      setCloudSaveMode(false);
                      window.dispatchEvent(
                        new CustomEvent("game:cloudsavemode", {
                          detail: { cloudSaveMode: false },
                        })
                      );
                      setShowCloudSaveDisableConfirm(false);
                      triggerSaveFeedback('Cloud save disabled');
                    } catch (error) {
                      console.error('Error disabling cloud save:', error);
                      triggerSaveFeedback('Error disabling cloud save');
                    }
                  }}
                >
                  Yes, Disable
                </button>
                <button
                  className="modal-btn"
                  onClick={() => {
                    setShowCloudSaveDisableConfirm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Custom Confirm Modal: Reload App */}
        {showReloadConfirm && (
          <div className="modal-backdrop" style={{ zIndex: 10002 }}>
            <div className="modal-content" style={{ maxWidth: 400 }}>
              <div className="settings-modal-header">
              <h3>Reload App</h3>
              </div>
              <p>
                Reload now?<br />
                Your saved progress is kept.
              </p>
              <div className="modal-actions">
                <button
                  className="modal-btn"
                  onClick={() => {
                    if (typeof handleSave === "function") {
                      setTimeout(() => handleSave(), 0);
                    }
                    window.location.reload();
                  }}
                >
                  Reload
                </button>
                <button
                  className="modal-btn"
                  onClick={() => setShowReloadConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Custom Confirm Modal: Reset Game */}
        {showResetConfirm && (
          <div className="modal-backdrop" style={{ zIndex: 10002 }}>
            <div className="modal-content" style={{ maxWidth: 400 }}>
              <div className="settings-modal-header">
              <h3>Reset Game</h3>
              </div>
              <p>
                Are you sure you want to reset your game progress?<br />
              </p>
              <p>
                <b>This cannot be undone.</b>
              </p>
              <div className="modal-actions">
                <button
                  className="modal-btn danger"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Reset
                </button>
                <button
                  className="modal-btn"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
