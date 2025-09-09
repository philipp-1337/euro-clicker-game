import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const q = query(collection(db, 'notifications'), orderBy('dateTime', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('[useNotifications] Notifications geladen:', data);
      setNotifications(data);
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  return { notifications, loading };
}
