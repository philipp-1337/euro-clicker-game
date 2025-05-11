import React from 'react';
import { X as CloseIcon, Hourglass as HourglassIcon, Activity as ActivityIcon, MousePointerClick as MousePointerClickIcon, ClockFadingIcon, Power as PowerIcon } from 'lucide-react';
import { useModal } from '../../hooks/useModal';
import { formatPlaytime } from '../../utils/calculators';

export default function StatisticsModal({
  show,
  onClose,
  playTime,
  activePlayTime,
  inactivePlayTime,
  totalClicks
}) {
  const modalRef = useModal(show, onClose);

  // Berechne die Zeit, die die App/der Browser geschlossen war
  const timeAppClosed = Math.max(0, playTime - (activePlayTime + inactivePlayTime));

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
              <HourglassIcon size={20} className="stats-icon" />
              <span className="stats-label">Total Playtime:</span>
              <span className="stats-value">{formatPlaytime(playTime, true)}</span>
            </li>
            <li>
              <ActivityIcon size={20} className="stats-icon" />
              <span className="stats-label">Active Playtime:</span>
              <span className="stats-value">{formatPlaytime(activePlayTime, true)}</span>
            </li>
            <li>
              <ClockFadingIcon size={20} className="stats-icon" />
              <span className="stats-label">Inactive Playtime:</span>
              <span className="stats-value">{formatPlaytime(inactivePlayTime, true)}</span>
            </li>
            <li>
              <PowerIcon size={20} className="stats-icon" />
              <span className="stats-label">Time with App Closed:</span>
              <span className="stats-value">{formatPlaytime(timeAppClosed, true)}</span>
            </li>
          </ul>
          <ul className="statistics-list">
            <h4 className="settings-section-title">Clicks</h4>
            <li>
              <MousePointerClickIcon size={20} className="stats-icon" />
              <span className="stats-label">Total Clicks:</span>
              <span className="stats-value">{totalClicks?.toLocaleString('de-DE') ?? 0}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}