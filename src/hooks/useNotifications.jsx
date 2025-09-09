import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
      const q = query(collection(db, 'notifications'), orderBy('dateTime', 'desc'));
      const querySnapshot = await getDocs(q);
      const newData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setNotifications(prevNotifications => {
        if (JSON.stringify(prevNotifications) !== JSON.stringify(newData)) {
          console.log('[useNotifications] New or updated notifications found.');
          return newData;
        }
        return prevNotifications;
      });
    } catch (error) {
      console.error('[useNotifications] Error fetching notifications:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications(true); // Initial fetch
    const intervalId = setInterval(() => fetchNotifications(false), 300000); // Poll every 5 minutes
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  return { notifications, loading };
}
