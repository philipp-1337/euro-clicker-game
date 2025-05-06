import React, { useState } from 'react';

const interventions = [
  { id: 'intervention1', label: 'Intervention 1', perk: 'Effect of Intervention 1', cost: 100, requiresSatisfaction: 10 },
  { id: 'intervention2', label: 'Intervention 2', perk: 'Effect of Intervention 2', cost: 200 },
  { id: 'intervention3', label: 'Intervention 3', perk: 'Effect of Intervention 3', cost: 300 },
  { id: 'intervention4', label: 'Intervention 4', perk: 'Effect of Intervention 4', cost: 400 },
  { id: 'intervention5', label: 'Intervention 5', perk: 'Effect of Intervention 5', cost: 500 },
  { id: 'intervention6', label: 'Intervention 6', perk: 'Effect of Intervention 6', cost: 600 },
  { id: 'intervention7', label: 'Intervention 7', perk: 'Effect of Intervention 7', cost: 700 },
  { id: 'intervention8', label: 'Intervention 8', perk: 'Effect of Intervention 8', cost: 800 },
];

export default function Interventions({ money = 0, setMoney = () => {}, satisfaction = 0 }) {
  const [unlocked, setUnlocked] = useState([]);

  const handleUnlock = (id, cost) => {
    console.log('Attempting to unlock:', { id, cost, money, unlocked });
    if (money >= cost && !unlocked.includes(id)) {
      setMoney(prev => {
        if (typeof prev !== 'number') {
          console.error('Invalid money state:', prev);
          return prev;
        }
        return prev - cost;
      });
      setUnlocked(prev => [...prev, id]);
    } else {
      console.warn('Cannot unlock:', { id, cost, money, unlocked });
    }
  };

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Interventions</h2>
      <div className="interventions-grid">
        {interventions.map(intervention => {
          const isReadyToBuy = !unlocked.includes(intervention.id) && 
            (!intervention.requiresSatisfaction || satisfaction >= intervention.requiresSatisfaction);

          return (
            <div key={intervention.id} className="intervention-card">
              <h3>{intervention.label}</h3>
              <p>{intervention.perk}</p>
              <button
                onClick={() => handleUnlock(intervention.id, intervention.cost)}
                disabled={!isReadyToBuy || money < intervention.cost}
                className={`premium-upgrade-button ${!isReadyToBuy || money < intervention.cost ? 'disabled' : ''}`}
              >
                {unlocked.includes(intervention.id) ? 'Activated' : `${intervention.cost} €`}
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        .interventions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .intervention-card {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .premium-upgrade-button {
          margin-top: 10px;
          padding: 10px 20px;
          font-size: 1em;
          font-weight: bold;
          color: #fff;
          background-color: #007bff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .premium-upgrade-button:hover:not(.disabled) {
          background-color: #0056b3;
        }
        .premium-upgrade-button.disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
