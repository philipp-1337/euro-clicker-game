import { formatNumber } from '@utils/calculators';
import useGameHeaderLogic from '@hooks/useGameHeaderLogic';

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
        ⏱ {formatPlayTime(playTime)}

        {/* Cloud-Save Toggle */}
        <button
          className={`header-button${cloudSaveMode ? ' active' : ''}`}
          onClick={() => {
            const next = !cloudSaveMode;
            setCloudSaveMode(next);
            // Persist Cloud-Save-Mode in clickerUiProgress
            window.dispatchEvent(new CustomEvent('game:cloudsavemode', { detail: { cloudSaveMode: next } }));
          }}
          title={cloudSaveMode ? "Cloud-Save: ON" : "Cloud-Save: OFF"}
          style={{ marginRight: 8 }}
        >
          {cloudSaveMode ? '☁️💾' : '💾'}
        </button>

        <button
          className="header-button"
          onClick={handleSave}
          title={cloudSaveMode ? "Save to Cloud" : "Save"}
        >
          {isSaving ? '✅' : (cloudSaveMode ? '☁️⬆️' : '💾')}
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
          🗑️
        </button>

        <button
          className="header-button"
          onClick={() => setShowStats(s => !s)}
          title="Show Click Stats"
          style={{ marginLeft: 8 }}
        >
          {showStats ? '📊' : '📈'}
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
          ☁️⬇️
        </button>
        {cloudUuid && (
          <button
            className="header-button"
            onClick={() => setShowUuid(v => !v)}
            title="Show/Hide Cloud Save UUID"
            style={{ marginLeft: 8 }}
          >
            {showUuid ? '🔑' : '🆔'}
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
    </>
  );
}