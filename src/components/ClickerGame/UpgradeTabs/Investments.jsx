import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function Investments({ money, investments, buyInvestment, totalIncomePerSecond }) {
  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">
        Investments
        <span className="section-label" style={{ fontSize: '1rem', marginLeft: 12, color: '#2ecc71' }}>
          {/* Einkommen pro Sekunde anzeigen */}
          {formatNumber(totalIncomePerSecond)} €/s
        </span>
      </h2>
      {gameConfig.investments.map((investment, index) => (
        <div key={index} className="premium-upgrade-card">
          <div className="premium-upgrade-header">
            <h3>{investment.name}</h3>
          </div>
          <p className="premium-upgrade-description">
            Invest {formatNumber(investment.cost)} € to earn {formatNumber(investment.income)} €/s.
          </p>
          <div className="premium-upgrade-info">
            <div className="premium-upgrade-level">
              Purchased: {investments[index] ? 'Yes' : 'No'}
            </div>
            <button
              onClick={() => buyInvestment(index)}
              disabled={money < investment.cost || investments[index] === 1}
              className={`premium-upgrade-button ${money < investment.cost || investments[index] === 1 ? 'disabled' : ''}`}
            >
              {investments[index] === 1 ? 'Purchased' : `${formatNumber(investment.cost)} €`}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}