import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

function getOrCreateInstanceUuid() {
  let uuid = localStorage.getItem('notificationInstanceUuid');
  if (!uuid) {
    uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
    localStorage.setItem('notificationInstanceUuid', uuid);
  }
  return uuid;
}

export default function useNotificationReads() {
  const instanceUuid = getOrCreateInstanceUuid();
  const [seenIds, setSeenIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSeen = useCallback(async () => {
    if (!instanceUuid) {
      setSeenIds([]);
      return;
    }
    try {
      const docRef = doc(db, 'notificationReads', instanceUuid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setSeenIds(snap.data().seen || []);
      } else {
        setSeenIds([]);
      }
    } catch (error) {
      console.error('[useNotificationReads] Error fetching seen notifications:', error);
      setSeenIds([]);
    }
  }, [instanceUuid]);

  // Lade die gesehenen Notification-IDs aus Firestore
  useEffect(() => {
    setLoading(true);
    fetchSeen().finally(() => setLoading(false));
  }, [fetchSeen]);

  // Schreibe die gesehenen IDs in Firestore
  const markAllAsSeen = useCallback(async (ids) => {
    if (!instanceUuid) return;
    try {
      await setDoc(doc(db, 'notificationReads', instanceUuid), {
        seen: ids,
        lastSeenAt: Date.now(), // Timestamp für Cleanup
      });
      setSeenIds(ids);
    } catch (e) {
      console.error('[NotificationReads] Fehler beim Schreiben:', e);
    }
  }, [instanceUuid]);

    return { seenIds, markAllAsSeen, loading, setSeenIds, reloadSeenIds: fetchSeen };
}
