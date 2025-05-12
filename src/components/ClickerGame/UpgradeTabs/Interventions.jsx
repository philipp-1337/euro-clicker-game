import React from 'react';
import { formatNumber } from '@utils/calculators';

const interventions = [
  { id: 'intervention1', label: 'Intervention blue', perk: 'Increase manual click value to 100€', cost: 100000 },
  { id: 'intervention2', label: 'Intervention green', perk: 'Effect of Intervention 2', cost: 200000 },
  { id: 'intervention3', label: 'Intervention yellow', perk: 'Effect of Intervention 3', cost: 300000 },
  { id: 'intervention4', label: 'Intervention red', perk: 'Effect of Intervention 4', cost: 400000 },
  { id: 'intervention5', label: 'Intervention purple', perk: 'Effect of Intervention 5', cost: 500000 },
  { id: 'intervention6', label: 'Intervention petrol', perk: 'Effect of Intervention 6', cost: 600000 },
  { id: 'intervention7', label: 'Intervention orange', perk: 'infrastructure doesn´t cost money anymore', cost: 700000 },
  { id: 'intervention8', label: 'special sintervention', perk: 'make investements upgradable', cost: 800000 },
];

export default function Interventions({ money = 0, setMoney = () => {}, unlocked = [], setUnlocked = () => {} }) {
  const handleUnlock = (id, cost) => {
    if (money >= cost && !unlocked.includes(id)) {
      setMoney(prev => {
        const updatedMoney = prev - cost;
        return updatedMoney >= 0 ? updatedMoney : prev; // Ensure money doesn't go negative
      });
      setUnlocked(prev => [...prev, id]);
    }
  };

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Interventions</h2>
      {interventions.map(intervention => {
        const isReadyToBuy = !unlocked.includes(intervention.id);

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
