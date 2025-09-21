import React from "react";
import { toast } from 'sonner';

import {
  X as CloseIcon,
  Cloud as CloudIcon,
  CloudDownload as CloudDownloadIcon,
  CloudOff as CloudOffIcon,
  Trash2 as TrashIcon,
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
  MousePointerClickIcon,
  Music2 as MusicIcon,
  Volume2 as SoundEffectsIcon,
  BarChart2 as BarChart2Icon,
  AwardIcon,
  ChevronRightIcon,
} from "lucide-react";
import useCloudSave from '@hooks/useCloudSave';
import { useModal } from '@hooks/useModal';

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
  showDarkModeButton,
  setShowDarkModeButton,
}) {
  const modalRef = useModal(showSettings, () => setShowSettings(false));
  const showReloadButton = isStandaloneMobile();
  const [showReloadConfirm, setShowReloadConfirm] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const { deleteFromCloud } = useCloudSave();

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
          {/* Dark Mode Button Toggle */}
          <div className="settings-row">
            <div className="settings-row-left">
              <SunMoonIcon size={20} className="settings-icon" />
              <span className="switch-text">Dark Mode Button</span>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                className="switch"
                checked={showDarkModeButton}
                onChange={() => setShowDarkModeButton((v) => !v)}
                aria-label="Show Dark Mode Button"
              />
              <span className="switch-slider" />
            </label>
          </div>
          {/* Statistics Button Toggle */}
          <div className="settings-row">
            <div className="settings-row-left">
              <BarChart2Icon size={20} className="settings-icon" />
              <span className="switch-text">Statistics Button</span>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                className="switch"
                checked={showStatisticsHeaderButton}
                onChange={() => setShowStatisticsHeaderButton((v) => !v)}
                aria-label="Show Statistics Button"
              />
              <span className="switch-slider" />
            </label>
          </div>
          {/* Achievements Button Toggle (nur anzeigen, wenn Achievements vorhanden sind) */}
          {hasAnyAchievement && (
            <div className="settings-row">
              <div className="settings-row-left">
                <AwardIcon size={20} className="settings-icon" />
                <span className="switch-text">Achievements Button</span>
              </div>
              <label className="switch-label">
                <input
                  type="checkbox"
                  className="switch"
                  checked={showAchievementsHeaderButton}
                  onChange={() => setShowAchievementsHeaderButton((v) => !v)}
                  aria-label="Show Achievements Button"
                />
                <span className="switch-slider" />
              </label>
            </div>
          )}
          {/* Leaderboard Toggle (blendet NUR den Button ein/aus, öffnet NICHT das Modal) */}
          <div className="settings-row">
            <div className="settings-row-left">
              <CrownIcon size={20} className="settings-icon" />
              <span className="switch-text">Leaderboard Button</span>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                className="switch"
                checked={showLeaderboard}
                onChange={() => setShowLeaderboard((v) => !v)}
                aria-label="Show Leaderboard Button"
              />
              <span className="switch-slider" />
            </label>
          </div>
          {/* Clicker Counter Toggle */}
          <div className="settings-row">
            <div className="settings-row-left">
              <MousePointerClickIcon size={20} className="settings-icon" />
              <span className="switch-text">Click Counter</span>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                className="switch"
                checked={showClickStats}
                onChange={() => setShowClickStats((v) => !v)}
                aria-label="Show Click Counter"
              />
              <span className="switch-slider" />
            </label>
          </div>
          {/* Spielzeit Toggle */}
          <div className="settings-row">
            <div className="settings-row-left">
              <ClockIcon size={20} className="settings-icon" />
              <span className="switch-text">Playtime Counter</span>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                className="switch"
                checked={showPlaytime}
                onChange={() => setShowPlaytime((v) => !v)}
                aria-label="Show Playtime"
              />
              <span className="switch-slider" />
            </label>
          </div>
          {/* Audio Settings */}
          <h4 className="settings-section-title">Audio Settings</h4>
          {/* Background Music Toggle */}
          <div className="settings-row">
            <div className="settings-row-left">
              <MusicIcon size={20} className="settings-icon" />
              <span className="switch-text">Enable Background Music</span>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                className="switch"
                checked={musicEnabled}
                onChange={() => setMusicEnabled((v) => !v)}
                aria-label="Enable Background Music"
              />
              <span className="switch-slider" />
            </label>
          </div>
          {/* Sound Effects Toggle */}
          <div className="settings-row">
            <div className="settings-row-left">
              <SoundEffectsIcon size={20} className="settings-icon" />
              <span className="switch-text">Enable Sound Effects</span>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                className="switch"
                checked={soundEffectsEnabled}
                onChange={() => setSoundEffectsEnabled((v) => !v)}
                aria-label="Enable Sound Effects"
              />
              <span className="switch-slider" />
            </label>
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
              title={cloudSaveMode ? "Deactivate Cloud Save" : "Activate Cloud Save"}
            >
              {cloudSaveMode ? "Cloud Save" : "Cloud Save"}
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
              title={cloudSaveMode ? "Deactivate cloud save" : "Activate cloud save"}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '4px' }}>{cloudSaveMode ? 'On' : 'Off'}</span>
                <ChevronRightIcon size={18} />
              </div>
            </button>
          </div>
          {/* Cloud UUID Anzeige */}
          {cloudSaveMode && cloudUuid && (
            <div className="settings-row">
              <IdCardIcon size={20} className="settings-icon" />
                <span
                  className="settings-uuid"
                  title="Your cloud save UUID (copy & use on other device)"
                  onClick={() => {
                    navigator.clipboard?.writeText(cloudUuid);
                    toast.success("UUID copied");
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigator.clipboard?.writeText(cloudUuid); triggerSaveFeedback("UUID copied"); } }}
                  role="button"
                  tabIndex={0}
                  aria-label="Copy cloud save UUID"
                >
                  {cloudUuid}
                </span> 
                <button
                  className="settings-button"
                  onClick={() => {
                    navigator.clipboard?.writeText(cloudUuid);
                    toast.success("UUID copied");
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
                      toast.success('Cloud save disabled');
                    } catch (error) {
                      console.error('Error disabling cloud save:', error);
                      toast.error('Error disabling cloud save');
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
