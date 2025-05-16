import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore"; // Import query and where
import { X as CloseIcon, Medal as MedalIcon } from "lucide-react";
import { formatPlaytime } from '../../utils/calculators';
import { useModal } from '../../hooks/useModal';
import { CHECKPOINTS } from "@constants/gameConfig"; // Import CHECKPOINTS

export default function LeaderboardModal({ show, onClose }) {
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

          // 3. Sort by clicks (ascending)
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

  const goalDescription = activeTab === '100k'
    ? `Goal: The fastest time to reach ${CHECKPOINTS.find(cp => cp.id === '100k')?.label || '100,000 €'}!`
    : `Goal: The fastest time to reach ${CHECKPOINTS.find(cp => cp.id === '1B')?.label || '1 Billion €'}!`;

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal-content" style={{ maxWidth: 480 }}>
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
                  <th>Name</th>
                  <th>Total</th>
                  <th>Active</th>
                  <th>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const isMe = typeof window !== 'undefined' && entry.name === localStorage.getItem('leaderboardName');
                  const isFirst = idx === 0;
                  return (
                    <tr key={entry.id} className={isMe ? 'me' : ''}>
                      <td title={entry.name}> 
                        <div className="leaderboard-name-cell">
                          {entry.name}
                          {isFirst && (
                            <MedalIcon
                              size={18}
                              color={isMe ? '#d4a900' : '#f5b400'}
                              style={{ marginLeft: 4, verticalAlign: 'middle', flexShrink: 0 }}
                              title="Platz 1"
                            />
                          )}
                        </div>
                      </td>
                      <td>{formatPlaytime(entry.playtime, true, true)}</td>
                      <td>
                        {typeof entry.activePlaytime === 'number'
                          ? formatPlaytime(entry.activePlaytime, true, true)
                          : 'N/A'}
                      </td>
                      <td>{entry.clicks}</td>
                    </tr>
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
