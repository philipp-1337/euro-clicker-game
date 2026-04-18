import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';
import InvestmentBoostMeter from './InvestmentBoostMeter';
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
  const getChallengeText = (investment, cost) => {
    const boostRule = investment.boostRule ?? {};

    switch (boostRule.type) {
      case 'timed_actions':
        return `Build ${boostRule.target} rush points in ${boostRule.windowSeconds}s through upgrades, managers, investments, or materials.`;
      case 'reserve_challenge':
        return `Make valid purchases while holding at least ${formatNumber(cost * (boostRule.reserveMultiplier ?? 1))} € in reserve.`;
      case 'manual_actions':
      default:
        return `Use the boost action or make ${boostRule.target} valid purchases to secure the permanent income upgrade.`;
    }
  };

  const getSynergySummary = (investment) => {
    return `${investment.roleDescription} ${investment.boostTarget}.`;
  };

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Investments</h2>
      {!isInvestmentUnlocked ? (
        <div className="premium-upgrade-card">
          <div className="premium-upgrade-header">
            <Unlock className='premium-icon' /><h3>Unlock Investments</h3>
          </div>
          <p className="premium-upgrade-description">
            Unlock the investment tab to start backing businesses.
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
          const boostState = getInvestmentBoostState(investment.id);
          const isCompleted = isInvestmentBoostCompleted(investment.id);
          const displayedIncome = isCompleted ? investment.income * 2 : investment.income;
          const progressLabel = getInvestmentBoostProgressLabel(investment.id);

          return (
            <div key={investment.id} className="premium-upgrade-card">
              <div className="premium-upgrade-header">
                <InvestmentIcon iconName={investment.icon} />
                <div className="investment-card__title-group">
                  <h3>
                    {investment.name}
                  </h3>
                  <span className="investment-card__role-badge">{investment.roleLabel}</span>
                </div>
              </div>
              <p className="premium-upgrade-description">
                Invest {formatNumber(cost)} € to earn {formatNumber(displayedIncome)} €/s.
              </p>
              <p className="premium-upgrade-description investment-card__synergy-copy">
                {getSynergySummary(investment)}
              </p>
              <div className="investment-card__meta-row">
                <span className="investment-card__meta-label">Synergy</span>
                <span className="investment-card__meta-value">{investment.synergyTag}</span>
              </div>
              <p className="premium-upgrade-description investment-card__hint-copy">
                {investment.boostHint}
              </p>
              <InvestmentBoostMeter
                investmentId={investment.id}
                boostState={boostState}
                progressLabel={progressLabel}
                challengeText={getChallengeText(investment, cost)}
                getBoostState={getInvestmentBoostState}
                getBoostProgressLabel={getInvestmentBoostProgressLabel}
              />
              <div className="premium-upgrade-info">
                <div className="investment-card__status-list">
                  <div className="premium-upgrade-level">
                    Purchased: {purchased ? 'Yes' : 'No'}
                  </div>
                  <div className="premium-upgrade-level">
                    Boost: {boostState?.boosted ? 'Completed' : 'In Progress'}
                  </div>
                </div>
                <div className="investment-buttons-group">
                  <button
                    onClick={() => buyInvestment(index)}
                    disabled={money < cost || purchased}
                    className={`premium-upgrade-button ${money < cost || purchased ? 'disabled' : ''}`}
                  >
                    {purchased ? 'Purchased' : `${formatNumber(cost)} €`}
                  </button>
                  {investment.boostRule?.type === 'manual_actions' ? (
                    <button
                      onClick={() => advanceInvestmentBoost(investment.id, {
                        trigger: 'manual',
                        amount: 1,
                        availableMoney: money
                      })}
                      disabled={!purchased || isCompleted}
                      className={`premium-upgrade-button ${(!purchased || isCompleted) ? 'disabled' : ''}`}
                    >
                      {isCompleted ? 'Income Boosted' : 'Boost Action'}
                    </button>
                  ) : (
                    <div className="investment-card__auto-rule-note">
                      Tracks from live gameplay
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
