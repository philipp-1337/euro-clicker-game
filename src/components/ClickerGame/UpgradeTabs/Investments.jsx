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
        return `Baue ${boostRule.target} Rush-Punkte in ${boostRule.windowSeconds}s durch Upgrades, Manager, Investitionen oder Materialien auf.`;
      case 'reserve_challenge':
        return `Führe gültige Käufe aus, während du mindestens ${formatNumber(cost * (boostRule.reserveMultiplier ?? 1))} € Rücklage hältst.`;
      case 'manual_actions':
      default:
        return `Nutze die Boost-Aktion oder führe ${boostRule.target} gültige Käufe aus, um das permanente Einkommens-Upgrade zu sichern.`;
    }
  };

  const getSynergySummary = (investment) => {
    return `${investment.roleDescription} ${investment.boostTarget}.`;
  };

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Investitionen</h2>
      {!isInvestmentUnlocked ? (
        <div className="premium-upgrade-card">
          <div className="premium-upgrade-header">
            <Unlock className='premium-icon' /><h3>Investitionen freischalten</h3>
          </div>
          <p className="premium-upgrade-description">
            Schalte den Investitions-Tab frei, um in Unternehmen zu investieren.
          </p>
          <div className="premium-upgrade-info">
            <div className="premium-upgrade-level">
              Status: Gesperrt
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
                Investiere {formatNumber(cost)} € und erhalte {formatNumber(displayedIncome)} €/s.
              </p>
              <p className="premium-upgrade-description investment-card__synergy-copy">
                {getSynergySummary(investment)}
              </p>
              <div className="investment-card__meta-row">
                <span className="investment-card__meta-label">Synergie</span>
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
                    Gekauft: {purchased ? 'Ja' : 'Nein'}
                  </div>
                  <div className="premium-upgrade-level">
                    Boost: {boostState?.boosted ? 'Abgeschlossen' : 'Läuft'}
                  </div>
                </div>
                <div className="investment-buttons-group">
                  <button
                    onClick={() => buyInvestment(index)}
                    disabled={money < cost || purchased}
                    className={`premium-upgrade-button ${money < cost || purchased ? 'disabled' : ''}`}
                  >
                    {purchased ? 'Gekauft' : `${formatNumber(cost)} €`}
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
                      {isCompleted ? 'Ertrag geboostet' : 'Boost-Aktion'}
                    </button>
                  ) : (
                    <div className="investment-card__auto-rule-note">
                      Zählt über Live-Spielaktionen
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
