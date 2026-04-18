import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';
import { Landmark, Unlock, Car, Zap, Sunset, Sandwich, Shirt, CarFront, Cigarette, Pill, Plane, Rocket } from 'lucide-react';

const InvestmentIcon = ({ iconName }) => {
  const icons = {
    Car,
    Zap,
    Sunset,
    Sandwich,
    Shirt,
    CarFront,
    Cigarette,
    Pill,
    Plane,
    Rocket,
    Landmark, // fallback
  };

  const IconComponent = icons[iconName] || icons.Landmark;
  return <IconComponent className="premium-icon" />;
};

export default function Investments({
  money,
  investments,
  buyInvestment,
  investmentCostMultiplier,
  advanceInvestmentBoost,
  getInvestmentBoostProgressLabel,
  getInvestmentBoostState,
  isInvestmentBoostCompleted,
  isInvestmentUnlocked,
  unlockInvestments,
  unlockInvestmentCost
}) {
  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Investments</h2>
      {!isInvestmentUnlocked ? (
        <div className="premium-upgrade-card">
          <div className="premium-upgrade-header">
            <Unlock className='premium-icon' /><h3>Unlock Investments</h3>
          </div>
          <p className="premium-upgrade-description">
            Unlock the Investments tab to invest in companies.
          </p>
          <div className="premium-upgrade-info">
            <div className="premium-upgrade-level">
              Status: Locked
            </div>
            {/* You may need to pass unlockInvestments and unlockInvestmentCost as props from parent */}
            {typeof unlockInvestments === 'function' && typeof unlockInvestmentCost === 'number' && (
              <button
                onClick={unlockInvestments}
                disabled={money < unlockInvestmentCost}
                className={`premium-upgrade-button ${money < unlockInvestmentCost ? 'disabled' : ''}`}
              >
                {`${formatNumber(unlockInvestmentCost)} €`}
              </button>
            )}
          </div>
        </div>
      ) : (
        gameConfig.investments.map((investment, index) => {
          const cost = investment.cost * (investmentCostMultiplier ?? 1);
          const purchased = investments[index] ? true : false;
          const boostState = getInvestmentBoostState(index);
          const isCompleted = isInvestmentBoostCompleted(index);
          const displayedIncome = isCompleted ? investment.income * 2 : investment.income;
          const progressLabel = getInvestmentBoostProgressLabel(index);

          return (
            <div key={index} className="premium-upgrade-card">
              <div className="premium-upgrade-header">
                <InvestmentIcon iconName={investment.icon} />
                <h3>
                  {investment.name}
                </h3>
              </div>
              <p className="premium-upgrade-description">
                Invest {formatNumber(cost)} € to earn {formatNumber(displayedIncome)} €/s.
              </p>
              <p className="premium-upgrade-description" style={{ fontSize: '0.9em', marginTop: '5px' }}>
                {investment.boostHint}
              </p>
              <p className="premium-upgrade-description" style={{ fontSize: '0.9em', marginTop: '5px' }}>
                {progressLabel}
              </p>
              <div className="premium-upgrade-info">
                <div className="premium-upgrade-level">
                  Purchased: {purchased ? 'Yes' : 'No'}
                </div>
                <div className="premium-upgrade-level">
                  Boost: {boostState?.boosted ? 'Completed' : 'In Progress'}
                </div>
                <div className="investment-buttons-group">
                  <button
                    onClick={() => buyInvestment(index)}
                    disabled={money < cost || purchased}
                    className={`premium-upgrade-button ${money < cost || purchased ? 'disabled' : ''}`}
                  >
                    {purchased ? 'Purchased' : `${formatNumber(cost)} €`}
                  </button>
                  <button
                    onClick={() => advanceInvestmentBoost(index, { amount: 1, money })}
                    disabled={!purchased || isCompleted}
                    className={`premium-upgrade-button ${(!purchased || isCompleted) ? 'disabled' : ''}`}
                  >
                    {isCompleted ? "Earnings Boosted" : "Boost"}
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
