import React, { useState } from 'react';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function StateInfrastructure({
  money,
  satisfaction,
  dissatisfaction,
  stateBuildings,
  buyStateBuilding,
  totalMoneyPerSecond,
}) {
  const [activeSection, setActiveSection] = useState('positive');

  const positiveBuildings = gameConfig.stateBuildings
    .map((b, idx) => ({ ...b, idx }))
    .filter(b => b.satisfactionValue > 0);
  const negativeBuildings = gameConfig.stateBuildings
    .map((b, idx) => ({ ...b, idx }))
    .filter(b => b.dissatisfactionValue > 0);

  const renderBuilding = (building) => {
    const canAfford =
      stateBuildings[building.idx] === 0 &&
      money >= building.costPerSecond &&
      totalMoneyPerSecond >= building.costPerSecond;

    return (
      <div key={building.idx} className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <h3>{building.name}</h3>
        </div>
        <p className="premium-upgrade-description">
          {building.costPerSecond < 0
            ? <>Earn: {formatNumber(Math.abs(building.costPerSecond))} €/s &nbsp; | &nbsp;</>
            : <>Cost: {formatNumber(building.costPerSecond)} €/s &nbsp; | &nbsp;</>
          }
          {building.satisfactionValue > 0 && (
            <>Satisfaction: {formatNumber(building.satisfactionValue)} (one-time)</>
          )}
          {building.dissatisfactionValue > 0 && (
            <>Dissatisfaction: {formatNumber(building.dissatisfactionValue)} (one-time)</>
          )}
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Active: {stateBuildings[building.idx] ? 'Yes' : 'No'}
          </div>
          <button
            onClick={() => buyStateBuilding(building.idx)}
            disabled={!canAfford}
            className={`premium-upgrade-button ${!canAfford ? 'disabled' : ''}`}
          >
            {stateBuildings[building.idx] === 1 ? 'Activated' : 'Activate'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">
        State & Infrastructure
        <span className="section-label" style={{ fontSize: '1rem', marginLeft: 12, color: '#3498db' }}>
          Satisfaction: {formatNumber(satisfaction)} &nbsp;|&nbsp; Dissatisfaction: {formatNumber(dissatisfaction)}
        </span>
      </h2>

      <div className="segmented-btn-group">
        <button
          className={`segmented-btn${activeSection === 'positive' ? ' active' : ''}`}
          onClick={() => setActiveSection('positive')}
        >
          Social & Infrastructure
        </button>
        <button
          className={`segmented-btn${activeSection === 'negative' ? ' active' : ''}`}
          onClick={() => setActiveSection('negative')}
        >
          Profit & Control
        </button>
      </div>

      {activeSection === 'positive' && (
        <>
          <h3 className="section-title">Social & Infrastructure</h3>
          {positiveBuildings.map(renderBuilding)}
        </>
      )}
      {activeSection === 'negative' && (
        <>
          <h3 className="section-title">Profit & Control</h3>
          {negativeBuildings.map(renderBuilding)}
        </>
      )}
    </div>
  );
}