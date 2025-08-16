import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore"; // Import query and where
import { X as CloseIcon, Medal as MedalIcon, OctagonAlertIcon } from "lucide-react";
import { formatPlaytime } from '../../utils/calculators';
import { useModal } from '../../hooks/useModal';
import { CHECKPOINTS } from "@constants/gameConfig"; // Import CHECKPOINTS

export default function LeaderboardModal({ show, onClose }) {
  const [expandedRows, setExpandedRows] = useState([]); // Für aufklappbare Details
  // Handler für Expand/Collapse
  const handleRowToggle = (rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const modalRef = useModal(show, onClose);
  const [activeTab, setActiveTab] = useState(CHECKPOINTS[0].id); // Default to the first checkpoint's ID

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    const fetchLeaderboard = async () => {
      try {
        // Query for entries matching the activeTab's goal
        const leaderboardQuery = query(
          collection(db, "leaderboard"),
          where("goal", "==", activeTab)
          // Firestore allows orderBy only on the field used in the first where clause if it's an inequality,
          // or on any field if the where clause is an equality.
          // For complex sorting (playtime, then activePlaytime, then clicks), client-side sorting is simpler here.
        );
        const querySnapshot = await getDocs(leaderboardQuery);
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        // Sortiere im Frontend
        data.sort((a, b) => {
          // 1. Sort by total playtime (ascending)
          if (typeof a.playtime === 'number' && typeof b.playtime === 'number') {
            if (a.playtime !== b.playtime) {
              return a.playtime - b.playtime;
            }
          } else if (typeof a.playtime === 'number') {
            return -1; // a has playtime, b doesn't, so a comes first
          } else if (typeof b.playtime === 'number') {
            return 1;  // b has playtime, a doesn't, so b comes first
          }

          // 2. Sort by active playtime (ascending)
          // Treat N/A (non-number) as "later" by assigning Infinity
          const aActive = typeof a.activePlaytime === 'number' ? a.activePlaytime : Infinity;
          const bActive = typeof b.activePlaytime === 'number' ? b.activePlaytime : Infinity;

          if (aActive !== bActive) {
            return aActive - bActive;
          }

          // 3. Sort by clicks (.ascending)
          if (typeof a.clicks === 'number' && typeof b.clicks === 'number') {
            return a.clicks - b.clicks;
          }
          return 0; // Default if all criteria are equal or incomparable
        });
        setEntries(data);
      } catch (e) {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [show, activeTab]); // Re-fetch when activeTab changes

  if (!show) return null;

  const currentCheckpoint = CHECKPOINTS.find(cp => cp.id === activeTab);
  const goalDescription = currentCheckpoint ? `Goal: The fastest time to reach ${currentCheckpoint.label}!` : 'Select a goal.';

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal-content" style={{ maxWidth: 480, position: 'relative' }}>
        <div className="settings-modal-header">
          <h3>Leaderboard</h3>
          <button
            className="settings-button"
            style={{ marginLeft: "auto" }}
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="upgrade-tabs" style={{ borderBottom: 'none', marginTop: '10px', marginBottom: '5px' }}>
          <div className="upgrade-tabs-inner">
            {CHECKPOINTS.map(checkpoint => (
              <button
                key={checkpoint.id}
                className={`tab-button ${activeTab === checkpoint.id ? 'active' : ''}`}
                onClick={() => setActiveTab(checkpoint.id)}
              >
                {checkpoint.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ margin: '8px 0 10px 0', fontSize: 15, textAlign: 'center' }}>
          {goalDescription}
        </p>
        <div className="settings-modal-content">
          {loading ? (
            <div>Loading...</div>
          ) : entries.length === 0 ? (
            <div>No entries yet.</div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Total</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const isMe = typeof window !== 'undefined' && entry.name === localStorage.getItem('leaderboardName');
                  const isFirst = idx === 0;
                  const isFlagged = entry.flagged;
                  // Datum formatieren (ISO-String zu lokalem Datum)
                  let dateString = '';
                  if (entry.checkpointDate) {
                    try {
                      const d = new Date(entry.checkpointDate);
                      dateString = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } catch (e) {
                      dateString = entry.checkpointDate;
                    }
                  } else if (entry.timestamp) {
                    try {
                      const d = new Date(entry.timestamp);
                      dateString = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } catch (e) {
                      dateString = entry.timestamp;
                    }
                  }
                  const expanded = expandedRows.includes(entry.id);
                  return (
                    <React.Fragment key={entry.id}>
                      <tr className={isMe ? 'me' : ''} style={isFlagged ? { opacity: 0.5, background: '#ffeaea' } : {}}>
                        <td style={{ textAlign: 'center', fontWeight: isFirst ? 'bold' : undefined }}>{idx + 1}</td>
                        <td title={entry.name}>
                          <div className="leaderboard-name-cell">
                            {entry.name}
                            {!isFlagged && isFirst && (
                              <MedalIcon
                                size={18}
                                color={isMe ? '#d4a900' : '#f5b400'}
                                style={{ marginLeft: 4, verticalAlign: 'middle', flexShrink: 0 }}
                                title="1st place"
                              />
                            )}
                            {isFlagged && (
                              <OctagonAlertIcon 
                                size={18} 
                                color={'red'}
                                style={{ marginLeft: 4, verticalAlign: 'middle', flexShrink: 0 }}
                                title={`Test/Alpha-Eintrag (${entry.flaggedReason || 'test'})`}
                              />
                            )}
                          </div>
                        </td>
                        <td>{formatPlaytime(entry.playtime, true, true)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="expand-btn"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            onClick={() => handleRowToggle(entry.id)}
                            aria-label={expanded ? 'Details ausblenden' : 'Details anzeigen'}
                          >
                            {expanded ? '▲' : '▼'}
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="leaderboard-details-row">
                          <td colSpan={5} style={{ background: '#f8f8f8', fontSize: 14 }}>
                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', padding: '6px 0' }}>
                              <span><b>Active:</b> {typeof entry.activePlaytime === 'number' ? formatPlaytime(entry.activePlaytime, true, true) : 'N/A'}</span>
                              <span><b>Clicks:</b> {entry.clicks}</span>
                              <span><b>Prestige:</b> {typeof entry.prestigeCount === 'number' ? entry.prestigeCount : 'N/A'}</span>
                              <span><b>Date:</b> {dateString}</span>
                              <span><b>Version:</b> {entry.version || 'N/A'}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
