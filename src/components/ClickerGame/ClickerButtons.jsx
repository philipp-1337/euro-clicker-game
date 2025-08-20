import { formatNumber } from '@utils/calculators';  // Import von formatNumber
import { PiggyBank, Euro, Gift, Handshake, Sparkles } from 'lucide-react';

export default function ClickerButtons({ buttons, cooldowns, handleClick }) {
  // Map icon string to Lucide component
  const iconMap = {
    PiggyBank,
    Euro,
    Gift,
    Handshake,
    Sparkles,
  };

  const handleButtonClick = (index) => {
    handleClick(index); // Trigger the click logic
  };

  return (
    <div className="clicker-buttons">
      {buttons.map((button, index) => {
        const Icon = iconMap[button.icon];
        return (
          <div key={index} className="button-container">
            <button
              onClick={() => handleButtonClick(index)}
              disabled={cooldowns[index] > 0}
              className={`clicker-button ${button.colorClass} ${
                cooldowns[index] > 0 ? "disabled" : ""
              }`}
            >
              <span
                className="clicker-button-icon-label"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                {Icon && <Icon size={22} />}
                <span style={{ fontWeight: 400, fontSize: "0.9rem", marginTop: "2px" }}>
                  {button.label}
                </span>
              </span>
              {cooldowns[index] > 0 && (
                <div className="cooldown-progress-bar">
                  <div
                    className="cooldown-progress-fill"
                    style={{
                      width: `${
                        (1 - cooldowns[index] / button.cooldownTime) * 100
                      }%`,
                    }}
                  />
                  <span className="cooldown-text">
                    {formatNumber(cooldowns[index])}s
                  </span>
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}