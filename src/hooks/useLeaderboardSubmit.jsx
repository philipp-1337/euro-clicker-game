import { useState, useEffect, useRef } from 'react';

/**
 * Custom Hook für Leaderboard-Submission.
 *
 * @param {Object} params
 * @param {boolean} params.leaderboardMode
 * @param {number} params.money
 * @param {string} params.leaderboardName
 * @param {number} params.floatingClicks
 * @param {number} params.playTime
 * @returns {Object} { showLeaderboard, setShowLeaderboard, leaderboardSubmitted }
 */
export default function useLeaderboardSubmit({
  leaderboardMode,
  money,
  leaderboardName,
  floatingClicks,
  playTime,
  prestigeCount
}) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardSubmitted, setLeaderboardSubmitted] = useState(false);
  const leaderboardSubmittedRef = useRef(false);

  // Persistenter Key für diesen User
  const localKey = leaderboardName ? `leaderboardSubmitted_${leaderboardName}` : null;
  const alreadySubmitted = localKey ? localStorage.getItem(localKey) === 'true' : false;

  useEffect(() => {
    if (
      leaderboardMode &&
      !leaderboardSubmittedRef.current &&
      !alreadySubmitted &&
      money >= 100000 &&
      leaderboardName &&
      typeof floatingClicks === 'number' &&
      typeof playTime === 'number'
    ) {
      leaderboardSubmittedRef.current = true;
      import('../firebase').then(({ db }) => {
        import('firebase/firestore').then(({ collection, addDoc }) => {
          addDoc(collection(db, 'leaderboard'), {
            name: leaderboardName,
            playtime: playTime,
            clicks: floatingClicks,
            prestigeCount: prestigeCount,
            timestamp: Date.now(),
          }).finally(() => {
            setLeaderboardSubmitted(true);
            setShowLeaderboard(true);
            if (localKey) localStorage.setItem(localKey, 'true');
          });
        });
      });
    }
  }, [leaderboardMode, money, leaderboardName, floatingClicks, playTime, alreadySubmitted, localKey, prestigeCount]);

  return {
    showLeaderboard,
    setShowLeaderboard,
    leaderboardSubmitted
  };
}