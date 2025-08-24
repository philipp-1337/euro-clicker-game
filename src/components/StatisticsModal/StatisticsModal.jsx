import React from 'react';
import { X as CloseIcon, ClockIcon, Activity as ActivityIcon, MousePointerClick as MousePointerClickIcon, ClockFadingIcon } from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { formatPlaytime, formatNumber } from '../../utils/calculators';

export default function StatisticsModal({
  show,
  onClose,
  playTime,
  activePlayTime,
  totalClicks,
  prestigeCount, // NEU: Prestige-Counter
  prestigeShares // NEU: Prestige-Shares
}) {
  const modalRef = useModal(show, onClose);

  // Berechne die gesamte Abwesenheitszeit
  const absenceTime = Math.max(0, playTime - activePlayTime);
  
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal-content statistics-modal-content">
        <div className="settings-modal-header">
          <h3>Game Statistics</h3>
          <button
            className="settings-button"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="settings-modal-content">
          <h4 className="settings-section-title">Playtime</h4>
          <ul className="statistics-list">
            <li>
              <ActivityIcon size={20} className="stats-icon" />
              <span className="stats-label">Active Playtime:</span>
              <span className="stats-value">{formatPlaytime(activePlayTime, false)}</span>
            </li>
            <li>
              <ClockFadingIcon size={20} className="stats-icon" />
              <span className="stats-label">Absence Time:</span>
              <span className="stats-value">{formatPlaytime(absenceTime, false)}</span>
            </li>
            <li>
              <ClockIcon size={20} className="stats-icon" />
              <span className="stats-label">Total Playtime:</span>
              <span className="stats-value">{formatPlaytime(playTime, false)}</span>
            </li>
          </ul>
          <ul className="statistics-list">
            <h4 className="settings-section-title">Clicks</h4>
            <li>
              <MousePointerClickIcon size={20} className="stats-icon" />
              <span className="stats-label">Total Clicks:</span>
              <span className="stats-value">{totalClicks}</span>
            </li>
          </ul>
          {/* NEU: Prestige-Abschnitt */}
          {prestigeCount > 0 && (
            <ul className="statistics-list">
              <h4 className="settings-section-title">Prestige</h4>
              <li>
                <span className="stats-label">Prestige Count:</span>
                <span className="stats-value">{prestigeCount}</span>
              </li>
              <li>
                <span className="stats-label">Prestige Shares:</span>
                <span className="stats-value">{formatNumber(prestigeShares)}</span>
              </li>
              <li>
                <span className="stats-label">Prestige Multiplier:</span>
                <span className="stats-value">{prestigeCount !== undefined && prestigeShares !== undefined && prestigeShares > 0 ? `${formatNumber(1 + prestigeShares * 0.01)}x` : '1.00x'}</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
