import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useCloudSave from './useCloudSave';

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
  const reloadSeenIds = async () => {
    const docRef = doc(db, 'notificationReads', instanceUuid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setSeenIds(snap.data().seen || []);
    } else {
      setSeenIds([]);
    }
  };
  const instanceUuid = getOrCreateInstanceUuid();
  const [seenIds, setSeenIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lade die gesehenen Notification-IDs aus Firestore
  useEffect(() => {
    if (!instanceUuid) return;
    setLoading(true);
    const fetchSeen = async () => {
      try {
        const docRef = doc(db, 'notificationReads', instanceUuid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setSeenIds(snap.data().seen || []);
        } else {
          setSeenIds([]);
        }
      } catch (e) {
        setSeenIds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSeen();
  }, [instanceUuid]);

  // Schreibe die gesehenen IDs in Firestore
  const markAllAsSeen = useCallback(async (ids) => {
    if (!instanceUuid) return;
    try {
      console.log('[NotificationReads] Schreibe gesehen:', ids, 'für', instanceUuid);
      await setDoc(doc(db, 'notificationReads', instanceUuid), { seen: ids });
      setSeenIds(ids);
    } catch (e) {
      console.error('[NotificationReads] Fehler beim Schreiben:', e);
    }
  }, [instanceUuid]);

    return { seenIds, markAllAsSeen, loading, setSeenIds, reloadSeenIds };
}
