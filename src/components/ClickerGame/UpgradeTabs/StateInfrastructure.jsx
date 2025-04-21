import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function StateInfrastructure({
  money,
  satisfaction,
  stateBuildings,
  buyStateBuilding,
  totalMoneyPerSecond,
}) {
  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">
        Staat & Infrastruktur
        <span style={{ fontSize: '1rem', marginLeft: 12, color: '#3498db' }}>
          Zufriedenheit: {formatNumber(satisfaction)}
        </span>
      </h2>
      {gameConfig.stateBuildings.map((building, idx) => {
        const canAfford =
          stateBuildings[idx] === 0 &&
          money >= building.costPerSecond &&
          totalMoneyPerSecond >= building.costPerSecond;

        return (
          <div key={idx} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <h3>{building.name}</h3>
            </div>
            <p className="premium-upgrade-description">
              Kosten: {formatNumber(building.costPerSecond)} €/s &nbsp; | &nbsp;
              Zufriedenheit: {formatNumber(building.satisfactionValue)} (einmalig)
            </p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Aktiv: {stateBuildings[idx] ? 'Ja' : 'Nein'}
              </div>
              <button
                onClick={() => buyStateBuilding(idx)}
                disabled={!canAfford}
                className={`premium-upgrade-button ${!canAfford ? 'disabled' : ''}`}
              >
                {stateBuildings[idx] === 1 ? 'Aktiviert' : 'Aktivieren'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}