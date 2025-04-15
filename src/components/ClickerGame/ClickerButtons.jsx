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
              {typeof button.label === 'string' && button.label.startsWith('+') && button.label.includes('€')
                ? `+${formatNumber(parseFloat(button.label.replace(/[^\d.-]/g, '')))} €`
                : typeof button.label === 'number'
                ? formatNumber(button.label)
                : button.label}
            </span>
            {cooldowns[index] > 0 && (
              <div className="cooldown-progress-bar">
                <div
                  className="cooldown-progress-fill"
                  style={{ width: `${(1 - cooldowns[index] / button.cooldownTime) * 100}%` }}
                />
                <span className="cooldown-text">{formatNumber(cooldowns[index])}s</span>
              </div>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}