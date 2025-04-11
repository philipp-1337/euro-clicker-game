import { RefreshCw } from 'lucide-react';
import { formatNumber } from '@utils/calculators';  // Import von formatNumber

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
            <span>
              {typeof button.label === 'number' ? formatNumber(button.label) : button.label}  {/* Hier wird das Label immer formatiert */}
            </span>
            {cooldowns[index] > 0 && (
              <div className="cooldown-indicator">
                <RefreshCw className="spinning-icon" />
                <span>{formatNumber(cooldowns[index])}s</span>  {/* Rundung für Cooldown */}
              </div>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}