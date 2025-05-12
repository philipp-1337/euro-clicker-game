import React, { useState } from 'react';
import { formatNumber } from '@utils/calculators';

const interventions = [
  { id: 'intervention1', label: 'Intervention blue', perk: 'Increase manual click value to 100€', cost: 100},
  { id: 'intervention2', label: 'Intervention green', perk: 'Effect of Intervention 2', cost: 200 },
  { id: 'intervention3', label: 'Intervention yellow', perk: 'Effect of Intervention 3', cost: 300 },
  { id: 'intervention4', label: 'Intervention red', perk: 'Effect of Intervention 4', cost: 400 },
  { id: 'intervention5', label: 'Intervention purple', perk: 'Effect of Intervention 5', cost: 500 },
  { id: 'intervention6', label: 'Intervention petrol', perk: 'Effect of Intervention 6', cost: 600 },
  { id: 'intervention7', label: 'Intervention orange', perk: 'infrastructure doesn´t cost money anymore', cost: 700 },
  { id: 'intervention8', label: 'special sintervention', perk: 'make investements upgradable', cost: 800 },
];

export default function Interventions({ money = 0, setMoney = () => {}, satisfaction = 0 }) {
  const [unlocked, setUnlocked] = useState([]);

  const handleUnlock = (id, cost) => {
    if (money >= cost && !unlocked.includes(id)) {
      setMoney(prev => prev - cost);
      setUnlocked(prev => [...prev, id]);
    }
  };

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Interventions</h2>
      {interventions.map(intervention => {
        const isReadyToBuy = !unlocked.includes(intervention.id) && 
          (!intervention.requiresSatisfaction || satisfaction >= intervention.requiresSatisfaction);

        return (
          <div key={intervention.id} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <h3>{intervention.label}</h3>
            </div>
            <p className="premium-upgrade-description">{intervention.perk}</p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Status: {unlocked.includes(intervention.id) ? 'Activated' : 'Not Activated'}
              </div>
              <button
                onClick={() => handleUnlock(intervention.id, intervention.cost)}
                disabled={!isReadyToBuy || money < intervention.cost}
                className={`premium-upgrade-button ${!isReadyToBuy || money < intervention.cost ? 'disabled' : ''}`}
              >
                {unlocked.includes(intervention.id) ? 'Activated' : `${formatNumber(intervention.cost)} €`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
