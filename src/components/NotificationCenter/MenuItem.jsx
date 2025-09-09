import React from 'react';

const MenuItem = ({ icon: Icon, label, onClick, ariaLabel }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  };

  return (
    <div
      className="sidemenu-item"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel || label}
    >
      <Icon size={20} className="sidemenu-icon" />
      <span>{label}</span>
    </div>
  );
};

export default MenuItem;