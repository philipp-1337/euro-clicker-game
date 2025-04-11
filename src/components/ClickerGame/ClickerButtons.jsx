import { RefreshCw } from 'lucide-react';

export default function ClickerButtons({ buttons, cooldowns, handleClick }) {
  return (
    <div className="clicker-buttons">
      {buttons.map((button, index) => (
        <div key={index} className="button-container">
          <button
            onClick={() => handleClick(index)}
            disabled={cooldowns[index] > 0}
            className={`clicker-button ${button.colorClass} ${cooldowns[index] > 0 ? 'disabled' : ''}`}
          >
            <span>{button.label}</span>
            {cooldowns[index] > 0 && (
              <div className="cooldown-indicator">
                <RefreshCw className="spinning-icon" />
                <span>{cooldowns[index].toLocaleString("en-GB", { minimumFractionDigits: 1 })}s</span>
              </div>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}