import React from 'react';
import { gameConfig } from '@constants/gameConfig';
import { formatNumber } from '@utils/calculators';

export default function Interventions({
  satisfaction,
  dissatisfaction,
  interventionsState,
  interventionStrategy,
  applyIntervention
}) {
  // Filter basierend auf der gewählten Strategie
  const availableInterventions = gameConfig.interventions
    .map((intervention, idx) => ({ ...intervention, originalIdx: idx }))
    .filter(intervention => {
      if (!interventionStrategy) {
        // Wenn noch keine Strategie gewählt wurde, zeige alle
        return true;
      }
      // Bei gewählter Strategie nur passende oder 'mixed' Interventionen zeigen
      return intervention.unlockCondition === 'mixed' || 
             intervention.unlockCondition === interventionStrategy;
    });

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">
        Interventions
        {interventionStrategy && (
          <span className="section-label" style={{
            fontSize: '0.9rem',
            marginLeft: 12,
            color: interventionStrategy === 'satisfaction' ? '#2ecc71' : '#e74c3c'
          }}>
            {interventionStrategy === 'satisfaction' ? 'Social Strategy' : 'Control Strategy'}
          </span>
        )}
      </h2>
      {availableInterventions.length === 0 && (
        <p>No interventions available for your current strategy.</p>
      )}
      {availableInterventions.map((intervention) => {
        const canBuy =
          satisfaction >= (intervention.requiredSatisfaction || 0) &&
          dissatisfaction >= (intervention.requiredDissatisfaction || 0) &&
          !interventionsState[intervention.originalIdx];

        return (
          <div key={intervention.name} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <h3>{intervention.name}</h3>
            </div>
            <p className="premium-upgrade-description">{intervention.description}</p>
            <div className="premium-upgrade-info">
              <div>
                Kosten:
                {intervention.requiredSatisfaction > 0 && (
                  <> {formatNumber(intervention.requiredSatisfaction)} Zufriedenheit </>
                )}
                {intervention.requiredDissatisfaction > 0 && (
                  <> {formatNumber(intervention.requiredDissatisfaction)} Unzufriedenheit </>
                )}
              </div>
              <button
                onClick={() => applyIntervention(intervention.originalIdx)}
                disabled={!canBuy}
                className={`premium-upgrade-button ${!canBuy ? 'disabled' : ''}`}
              >
                {interventionsState[intervention.originalIdx] ? 'Aktiviert' : 'Aktivieren'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}