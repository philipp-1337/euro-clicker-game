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

export default function Interventions({ money, setMoney, satisfaction }) {
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
                className={`intervention-button ${unlocked.includes(intervention.id) ? 'unlocked' : ''}`}
              >
                {unlocked.includes(intervention.id) ? 'Unlocked' : `${intervention.cost} €`}
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
        .intervention-button {
          margin-top: 10px;
          padding: 8px 16px;
          font-size: 0.95em;
          cursor: pointer;
        }
        .intervention-button.unlocked {
          background: #4caf50;
          color: white;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
