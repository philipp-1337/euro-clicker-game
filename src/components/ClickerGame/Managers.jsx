import { Check } from 'lucide-react';

export default function Managers({ buttons, managers, money, buyManager }) {
  return (
    <>
      <h2 className="section-title">Buy Managers</h2>
      <div className="manager-buttons">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => buyManager(index, button.managerCost)}
            disabled={money < button.managerCost || managers[index]}
            className={`manager-button ${button.colorClass} ${(money < button.managerCost || managers[index]) ? 'disabled' : ''}`}
          >
            {managers[index] ? (
              <div className="manager-content">
                <Check className="check-icon" />
                <span>Bought</span>
              </div>
            ) : (
              <div className="manager-content">
                <span>{button.managerCost.toLocaleString("en-GB")} €</span>
                <span>Manager</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </>
  );
}