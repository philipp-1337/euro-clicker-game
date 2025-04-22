import React, { useState } from 'react';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

export default function StateInfrastructure({
  money,
  satisfaction,
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
    .filter(b => b.satisfactionValue < 0);

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
          Kosten: {formatNumber(building.costPerSecond)} €/s &nbsp; | &nbsp;
          Zufriedenheit: {formatNumber(building.satisfactionValue)} (einmalig)
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Aktiv: {stateBuildings[building.idx] ? 'Ja' : 'Nein'}
          </div>
          <button
            onClick={() => buyStateBuilding(building.idx)}
            disabled={!canAfford}
            className={`premium-upgrade-button ${!canAfford ? 'disabled' : ''}`}
          >
            {stateBuildings[building.idx] === 1 ? 'Aktiviert' : 'Aktivieren'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">
        Staat & Infrastruktur
        <span style={{ fontSize: '1rem', marginLeft: 12, color: '#3498db' }}>
          Zufriedenheit: {formatNumber(satisfaction)}
        </span>
      </h2>

      <div className="segmented-btn-group">
        <button
          className={`segmented-btn${activeSection === 'positive' ? ' active' : ''}`}
          onClick={() => setActiveSection('positive')}
        >
          Sozial & Infrastruktur
        </button>
        <button
          className={`segmented-btn${activeSection === 'negative' ? ' active' : ''}`}
          onClick={() => setActiveSection('negative')}
        >
          Profit & Kontrolle
        </button>
      </div>

      {activeSection === 'positive' && (
        <>
          <h3 className="section-title">Sozial & Infrastruktur</h3>
          {positiveBuildings.map(renderBuilding)}
        </>
      )}
      {activeSection === 'negative' && (
        <>
          <h3 className="section-title">Profit & Kontrolle</h3>
          {negativeBuildings.map(renderBuilding)}
        </>
      )}
    </div>
  );
}