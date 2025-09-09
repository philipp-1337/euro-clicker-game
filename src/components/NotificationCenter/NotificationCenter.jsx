import { useEffect, useState } from "react";
import Modal from "./Modal";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import useNotificationReads from "@hooks/useNotificationReads";

const NotificationCenter = ({ show, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { markAllAsSeen, setSeenIds } = useNotificationReads();

  useEffect(() => {
    if (!show) return;
    const fetchNotifications = async () => {
      setLoading(true);
      const q = query(
        collection(db, "notifications"),
        orderBy("dateTime", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
      setLoading(false);
    };
    fetchNotifications();
  }, [show]);

  useEffect(() => {
    if (show && notifications.length > 0) {
      // Markiere alle geladenen Notifications als gesehen
      const allIds = notifications.map((n) => n.id);
      if (allIds.length > 0) {
        markAllAsSeen(allIds);
        setSeenIds(allIds); // Optimistisches Update
      }
    }
  }, [show, notifications, markAllAsSeen, setSeenIds]);

  return (
    <Modal show={show} onClose={onClose} title="Notification">
      {loading ? (
        <div>Load Notification...</div>
      ) : notifications.length === 0 ? (
        <div>No (new) notification available.</div>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n.id} className="notification-item">
              <div className="notification-date">
                {n.dateTime && n.dateTime.seconds
                  ? new Date(n.dateTime.seconds * 1000).toLocaleString()
                  : typeof n.dateTime === "number"
                  ? new Date(n.dateTime).toLocaleString()
                  : ""}
              </div>
              <div className="notification-subject">
                <strong>{n.subject}</strong>
              </div>
              <div className="notification-body">{n.body}</div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default NotificationCenter;
