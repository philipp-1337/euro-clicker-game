import { formatNumber } from '@utils/calculators';  // Import von formatNumber
import { PiggyBank, Banknote, Gift, Handshake, Sparkles } from 'lucide-react';

export default function ClickerButtons({ buttons, cooldowns, handleClick }) {
  // Map icon string to Lucide component
  const iconMap = {
    PiggyBank,
    Banknote,
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
              style={{ position: "relative", overflow: "hidden" }}
            >
              <span
                className="clicker-button-icon-label"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  minHeight: "40px",
                  justifyContent: "center",
                  height: "48px",
                  transform: "translateZ(0)",
                }}
              >
                {Icon && <Icon size={22} style={{ display: "block" }} />}
                <span style={{ fontWeight: 400, fontSize: "0.9rem", marginTop: "2px", lineHeight: "1rem" }}>
                  {button.value !== undefined
                    ? `+${formatNumber(button.value, { decimals: 1 })} €`
                    : button.label}
                </span>
              </span>
              {cooldowns[index] > 0 && (
                <div
                  className="cooldown-progress-bar"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "4px",
                    width: "100%",
                    display: "flex",
                    // Removed alignItems and justifyContent for overlay
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="cooldown-progress-fill"
                    style={{
                      height: "100%",
                      width: `${
                        (1 - cooldowns[index] / button.cooldownTime) * 100
                      }%`,
                      background: "rgba(255,255,255,1)",
                      borderRadius: "2px",
                      transition: "width 0.2s linear",
                    }}
                  />
                </div>
              )}
              {/* {cooldowns[index] > 0 && (
                <span
                  className="cooldown-text"
                  // Removed position: "relative", zIndex: 1
                >
                  {formatNumber(cooldowns[index])}s
                </span>
              )} */}
            </button>
          </div>
        );
      })}
    </div>
  );
}