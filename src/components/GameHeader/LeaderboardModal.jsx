import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { X as CloseIcon, Medal as MedalIcon } from "lucide-react";

export default function LeaderboardModal({ show, onClose }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    const fetchLeaderboard = async () => {
      try {
        // Erstmal alle Einträge ohne Sortierung laden, um Fehler mit orderBy zu vermeiden
        const querySnapshot = await getDocs(collection(db, "leaderboard"));
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        // Sortiere im Frontend nach playtime und clicks, falls Felder vorhanden
        data.sort((a, b) => {
          if (typeof a.playtime !== 'number' || typeof b.playtime !== 'number') return 0;
          if (a.playtime !== b.playtime) return a.playtime - b.playtime;
          if (typeof a.clicks !== 'number' || typeof b.clicks !== 'number') return 0;
          return a.clicks - b.clicks;
        });
        setEntries(data);
      } catch (e) {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [show]);

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 480 }}>
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
                  <th>Playtime</th>
                  <th>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const isMe = typeof window !== 'undefined' && entry.name === localStorage.getItem('leaderboardName');
                  const isFirst = idx === 0;
                  return (
                    <tr key={entry.id} className={isMe ? 'me' : ''}>
                      <td>
                        {entry.name}
                        {isFirst && (
                          <MedalIcon
                            size={18}
                            color={isMe ? '#d4a900' : '#f5b400'}
                            style={{ marginLeft: 7, verticalAlign: 'middle' }}
                            title="Platz 1"
                          />
                        )}
                      </td>
                      <td>{formatPlaytime(entry.playtime)}</td>
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

function formatPlaytime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
}
