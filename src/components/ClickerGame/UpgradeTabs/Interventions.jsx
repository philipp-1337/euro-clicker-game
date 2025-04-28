import React, { useState } from 'react';

const techTree = [
  {
    id: 'root',
    label: 'Choose your path',
    children: ['autocracy', 'democracy'],
  },
  {
    id: 'autocracy',
    label: 'Autocracy',
    perk: 'Placeholder: Autocratic Perk 1',
    children: ['auto2'],
  },
  {
    id: 'auto2',
    label: 'Autocracy II',
    perk: 'Placeholder: Autocratic Perk 2',
    children: ['auto3'],
  },
  {
    id: 'auto3',
    label: 'Autocracy III',
    perk: 'Placeholder: Autocratic Perk 3',
    children: ['auto4'],
  },
  {
    id: 'auto4',
    label: 'Autocracy IV',
    perk: 'Placeholder: Autocratic Perk 4',
    children: [],
  },
  {
    id: 'democracy',
    label: 'Democracy',
    perk: 'Placeholder: Democratic Perk 1',
    children: ['demo2'],
  },
  {
    id: 'demo2',
    label: 'Democracy II',
    perk: 'Placeholder: Democratic Perk 2',
    children: ['demo3'],
  },
  {
    id: 'demo3',
    label: 'Democracy III',
    perk: 'Placeholder: Democratic Perk 3',
    children: ['demo4'],
  },
  {
    id: 'demo4',
    label: 'Democracy IV',
    perk: 'Placeholder: Democratic Perk 4',
    children: [],
  },
];

function renderPath(pathNodes, unlocked, onUnlock, selectedPath, satisfaction, dissatisfaction) {
  // Render a vertical column for a path (autocracy or democracy)
  return (
    <div className="techtree-path-column">
      {pathNodes.map((node, idx) => {
        const isUnlocked = unlocked.includes(node.id);
        const isSelectable = !isUnlocked && (idx === 0 ? unlocked.includes('root') : unlocked.includes(pathNodes[idx - 1].id));
        let unlockDisabled = false;
        let unlockTooltip = '';
        if (node.id === 'autocracy') {
          unlockDisabled = dissatisfaction < 10;
          unlockTooltip = 'Requires Dissatisfaction ≥ 10';
        }
        if (node.id === 'democracy') {
          unlockDisabled = satisfaction < 10;
          unlockTooltip = 'Requires Satisfaction ≥ 10';
        }
        return (
          <div key={node.id} className={`techtree-node${isUnlocked ? ' unlocked' : ''}${isSelectable ? ' selectable' : ''}`}>
            <div className="techtree-label">{node.label}</div>
            {node.perk && <div className="techtree-perk">{node.perk}</div>}
            {isSelectable && !isUnlocked && (
              <button
                className="techtree-unlock-btn"
                onClick={() => onUnlock(node.id)}
                disabled={unlockDisabled}
                title={unlockDisabled ? unlockTooltip : ''}
              >
                Unlock
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Interventions({ satisfaction = 0, dissatisfaction = 0 }) {
  const [unlocked, setUnlocked] = useState(['root']);
  const [selectedPath, setSelectedPath] = useState(null);

  const handleUnlock = (id) => {
    if (id === 'autocracy' && dissatisfaction >= 10) {
      setSelectedPath(id);
      setUnlocked(prev => [...prev, id]);
    } else if (id === 'democracy' && satisfaction >= 10) {
      setSelectedPath(id);
      setUnlocked(prev => [...prev, id]);
    } else if (selectedPath && id.startsWith(selectedPath)) {
      setUnlocked(prev => [...prev, id]);
    }
  };

  // Prepare columns for each path
  const autocracyPath = [
    techTree.find(n => n.id === 'autocracy'),
    techTree.find(n => n.id === 'auto2'),
    techTree.find(n => n.id === 'auto3'),
    techTree.find(n => n.id === 'auto4'),
  ];
  const democracyPath = [
    techTree.find(n => n.id === 'democracy'),
    techTree.find(n => n.id === 'demo2'),
    techTree.find(n => n.id === 'demo3'),
    techTree.find(n => n.id === 'demo4'),
  ];

  // Only show the chosen path after selection
  let showAutocracy = !selectedPath || selectedPath === 'autocracy';
  let showDemocracy = !selectedPath || selectedPath === 'democracy';

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Interventions Tech Tree</h2>
      <div className="techtree-horizontal-container">
        <div className="techtree-root-label">Choose your path</div>
        <div className="techtree-paths-row">
          {showAutocracy && renderPath(autocracyPath, unlocked, handleUnlock, selectedPath, satisfaction, dissatisfaction)}
          {showDemocracy && renderPath(democracyPath, unlocked, handleUnlock, selectedPath, satisfaction, dissatisfaction)}
        </div>
      </div>
      <style>{`
        .techtree-horizontal-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .techtree-root-label {
          font-weight: bold;
          margin-bottom: 16px;
          font-size: 1.1em;
        }
        .techtree-paths-row {
          display: flex;
          flex-direction: row;
          gap: 40px;
          justify-content: center;
          align-items: flex-start;
        }
        .techtree-path-column {
          display: flex;
          flex-direction: column;
          gap: 18px;
          align-items: center;
        }
        .techtree-node {
          border: 1px solid #bbb;
          border-radius: 8px;
          padding: 12px 18px;
          min-width: 220px;
          background: #f9f9f9;
          position: relative;
          margin: 0;
        }
        .techtree-node.unlocked {
          border-color: #4caf50;
          background: #e8f5e9;
        }
        .techtree-node.selectable {
          border-style: dashed;
        }
        .techtree-label {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .techtree-perk {
          font-size: 0.95em;
          color: #666;
          margin-bottom: 6px;
        }
        .techtree-unlock-btn {
          padding: 4px 12px;
          font-size: 0.95em;
          margin-bottom: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
