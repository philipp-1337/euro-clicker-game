import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function Investments({ money, investments, buyInvestment }) {
  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Investments</h2>
      {gameConfig.investments.map((investment, index) => (
        <div key={index} className="premium-upgrade-card">
          <div className="premium-upgrade-header">
            <h3>{investment.name}</h3>
          </div>
          <p className="premium-upgrade-description">
            Investiere {formatNumber(investment.cost)} €, um {formatNumber(investment.income)} €/s zu verdienen.
          </p>
          <div className="premium-upgrade-info">
            <div className="premium-upgrade-level">
              Gekauft: {investments[index]}
            </div>
            <button
              onClick={() => buyInvestment(index)}
              disabled={money < investment.cost}
              className={`premium-upgrade-button ${money < investment.cost ? 'disabled' : ''}`}
            >
              {formatNumber(investment.cost)} €
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}