const NotificationBadge = ({ count }) => {
  if (!count || count < 1) return null;
  return <span className="notification-badge">{count}</span>;
};

export default NotificationBadge;
