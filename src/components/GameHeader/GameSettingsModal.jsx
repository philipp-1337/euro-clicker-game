import {
  X as CloseIcon,
  Cloud as CloudIcon,
  CloudDownload as CloudDownloadIcon,
  CloudOff as CloudOffIcon,
  Trash2 as TrashIcon,
  BarChart2 as BarChartIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Clock as ClockIcon,
  RefreshCw as RefreshIcon,
  CloudAlert,
  ClipboardCopyIcon,
  IdCardIcon,
} from "lucide-react";

export default function GameSettingsModal({
  showSettings,
  setShowSettings,
  showPlaytime,
  setShowPlaytime,
  showClickStats,
  setShowClickStats,
  cloudSaveMode,
  setCloudSaveMode,
  showCloudSaveConfirm,
  setShowCloudSaveConfirm,
  cloudUuid,
  triggerSaveFeedback,
  showImportDialog,
  setShowImportDialog,
  importUuid,
  setImportUuid,
  importError,
  handleImportCloud,
  handleSave,
}) {
  if (!showSettings) return null;

  return (
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
              onClick={() => setShowPlaytime((v) => !v)}
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
              onClick={() => setShowClickStats((v) => !v)}
              title={showClickStats ? "Hide Click Stats" : "Show Click Stats"}
            >
              {showClickStats ? (
                <EyeIcon size={18} />
              ) : (
                <EyeOffIcon size={18} />
              )}
            </button>
          </div>
          {/* Cloud Save Toggle */}
          <div className="settings-row">
            <CloudIcon size={20} className="settings-icon" />
            <span className="settings-label">Enable Cloud Save</span>
            <button
              className={`header-button${cloudSaveMode ? " active" : ""}`}
              onClick={() => {
                const next = !cloudSaveMode;
                if (!cloudSaveMode && next) {
                  setShowCloudSaveConfirm(true);
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
                  className="header-button"
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
                const confirmReset = window.confirm(
                  "Are you sure you want to reset your game progress?"
                );
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
                  style={{ background: "#eee", color: "#333" }}
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
                  style={{ background: "#eee", color: "#333" }}
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
      </div>
    </div>
  );
}
