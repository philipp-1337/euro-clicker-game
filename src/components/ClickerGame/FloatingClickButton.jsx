import React from 'react';

export default function FloatingClickButton({ onClick, centerMode = false }) {
  return (
    <button
      onClick={onClick}
      className={`floating-click-button${centerMode ? ' center-mode' : ''}`}
      aria-label="Quick Euro Button"
    >
      +1 €
    </button>
  );
}