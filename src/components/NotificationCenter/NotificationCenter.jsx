import React, { useEffect, useState } from 'react';
import Modal from '../StatisticsModal/StatisticsModal'; // Modal-Logik wiederverwenden
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import './NotificationCenter.scss';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const fetchNotifications = async () => {
      setLoading(true);
      const q = query(collection(db, 'notifications'), orderBy('dateTime', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
      setLoading(false);
    };
    fetchNotifications();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Benachrichtigungen">
      {loading ? (
        <div>Lade Benachrichtigungen...</div>
      ) : notifications.length === 0 ? (
        <div>Keine Benachrichtigungen vorhanden.</div>
      ) : (
        <ul className="notification-list">
          {notifications.map(n => (
            <li key={n.id} className="notification-item">
              <div className="notification-date">{new Date(n.dateTime).toLocaleString()}</div>
              <div className="notification-subject"><strong>{n.subject}</strong></div>
              <div className="notification-body">{n.body}</div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default NotificationCenter;
