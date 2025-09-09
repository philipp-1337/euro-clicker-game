import React from "react";
import Modal from "./Modal";

const NotificationCenter = ({
  show,
  onClose,
  notifications,
  seenIds,
  loading,
}) => {

  return (
    <Modal show={show} onClose={onClose} title="Notification">
      {loading ? (
        <div>Load Notification...</div>
      ) : notifications.length === 0 ? (
        <div>No (new) notification available.</div>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => {
            const isUnread = !seenIds?.includes(n.id);
            return (
              <li
                key={n.id}
                className={`notification-item${isUnread ? " unread" : ""}`}
              >
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
            );
          })}
        </ul>
      )}
    </Modal>
  );
};

export default NotificationCenter;
