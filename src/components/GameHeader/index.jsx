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
  LineChart as LineChartIcon,
  Key as KeyIcon,
  BadgeInfo as IdIcon,
  Timer as TimerIcon,
  Check as CheckIcon,
} from 'lucide-react';

export default function GameHeader(props) {
  // ...alle States/Handler aus dem Hook...
  const {
    renderEnvironmentLabel,
    formatPlayTime,
    isSaving,
    saveMessage,
    showStats,
    setShowStats,
    showImportDialog,
    setShowImportDialog,
    importUuid,
    setImportUuid,
    importError,
    handleImportCloud,
    cloudSaveMode,
    setCloudSaveMode,
    handleSave,
    showUuid,
    setShowUuid,
    cloudUuid,
    floatingClicks,
    triggerSaveFeedback,
    money,
    playTime,
    totalMoneyPerSecond,
  } = useGameHeaderLogic(props);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);

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
          <span className="per-second" style={{ fontSize: '1rem', marginLeft: 12, color: '#2ecc71' }}>
            +{formatNumber(totalMoneyPerSecond)} €/s
          </span>
        )}
      </div>
      <div className="playtime-display">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <TimerIcon size={18} style={{ verticalAlign: 'middle', marginRight: 2 }} />
          {formatPlayTime(playTime)}
        </span>

        {/* Cloud-Save Toggle */}
        <button
          className={`header-button${cloudSaveMode ? ' active' : ''}`}
          onClick={() => {
            const next = !cloudSaveMode;
            setCloudSaveMode(next);
            window.dispatchEvent(new CustomEvent('game:cloudsavemode', { detail: { cloudSaveMode: next } }));
          }}
          title={cloudSaveMode ? "Cloud-Save: ON" : "Cloud-Save: OFF"}
          style={{ marginRight: 8 }}
        >
          {cloudSaveMode ? <CloudIcon size={18} style={{ verticalAlign: 'middle' }} /> : <SaveIcon size={18} style={{ verticalAlign: 'middle' }} />}
        </button>

        <button
          className="header-button"
          onClick={handleSave}
          title={cloudSaveMode ? "Save to Cloud" : "Save"}
        >
          {isSaving ? <CheckIcon size={18} style={{ verticalAlign: 'middle' }} /> : (cloudSaveMode
            ? <CloudUploadIcon size={18} style={{ verticalAlign: 'middle' }} />
            : <SaveIcon size={18} style={{ verticalAlign: 'middle' }} />)}
        </button>

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
          <TrashIcon size={18} style={{ verticalAlign: 'middle' }} />
        </button>

        <button
          className="header-button"
          onClick={() => setShowStats(s => !s)}
          title="Show Click Stats"
          style={{ marginLeft: 8 }}
        >
          {showStats
            ? <BarChartIcon size={18} style={{ verticalAlign: 'middle' }} />
            : <LineChartIcon size={18} style={{ verticalAlign: 'middle' }} />}
        </button>
        {showStats && (
          <span style={{ marginLeft: 8, fontWeight: 500 }}>
            Clicks: {String(floatingClicks ?? 0).padStart(5, '0')}
          </span>
        )}
        <button
          className="header-button"
          onClick={() => setShowImportDialog(true)}
          title="Import from Cloud"
        >
          <CloudDownloadIcon size={18} style={{ verticalAlign: 'middle' }} />
        </button>
        {cloudUuid && (
          <button
            className="header-button"
            onClick={() => setShowUuid(v => !v)}
            title="Show/Hide Cloud Save UUID"
            style={{ marginLeft: 8 }}
          >
            {showUuid
              ? <KeyIcon size={18} style={{ verticalAlign: 'middle' }} />
              : <IdIcon size={18} style={{ verticalAlign: 'middle' }} />}
          </button>
        )}
        {cloudUuid && showUuid && (
          <span
            style={{
              marginLeft: 8,
              fontSize: '0.85em',
              background: '#eee',
              borderRadius: 4,
              padding: '2px 6px',
              userSelect: 'all',
              cursor: 'pointer'
            }}
            title="Your Cloud Save UUID (copy & use on other device)"
            onClick={() => {
              navigator.clipboard?.writeText(cloudUuid);
              triggerSaveFeedback('UUID copied');
            }}
          >
            UUID: {cloudUuid}
          </span>
        )}
        {/* Settings Icon in die gleiche Reihe */}
        <button
          className="header-button"
          style={{ marginLeft: 10, verticalAlign: 'middle' }}
          onClick={() => setShowSettings(true)}
          title="Settings"
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
        </button>
      </div>
      {showImportDialog && (
        <div className="import-modal-backdrop">
          <div className="import-modal-content">
            <h3>Import Cloud Save</h3>
            <input
              type="text"
              className="import-modal-input"
              placeholder="Enter UUID"
              value={importUuid}
              onChange={e => setImportUuid(e.target.value)}
              autoFocus
            />
            {importError && <div className="import-modal-error">{importError}</div>}
            <div className="import-modal-actions">
              <button
                className="import-modal-btn"
                onClick={handleImportCloud}
                style={{ marginRight: 0 }}
              >
                Import
              </button>
              <button
                className="import-modal-btn"
                onClick={() => setShowImportDialog(false)}
                style={{ background: '#eee', color: '#333' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Settings Modal */}
      {showSettings && (
        <div className="import-modal-backdrop">
          <div className="import-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ marginBottom: 0 }}>Settings</h3>
              <button
                className="import-modal-btn"
                style={{ background: '#eee', color: '#333', padding: '4px 10px', minWidth: 0 }}
                onClick={() => setShowSettings(false)}
                title="Close"
                aria-label="Close"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            {/* Hier können Settings-Inhalte eingefügt werden */}
            <div style={{ marginTop: 18, minHeight: 40, textAlign: 'center', color: '#888' }}>
              Settings content coming soon...
            </div>
          </div>
        </div>
      )}
    </>
  );
}