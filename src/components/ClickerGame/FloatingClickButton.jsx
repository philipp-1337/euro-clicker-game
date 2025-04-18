import React from 'react';

export default function FloatingClickButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="floating-click-button"
      aria-label="Quick Euro Button"
    >
      +1 €
    </button>
  );
}