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

function renderNode(node, unlocked, onUnlock, selectedPath, satisfaction, dissatisfaction) {
  const isRoot = node.id === 'root';
  const isUnlocked = unlocked.includes(node.id);
  const isSelectable = !isUnlocked && (isRoot || unlocked.includes(node.parent));
  const isSelectedPath = selectedPath && node.id.startsWith(selectedPath);

  // Requirements for first choice
  let unlockDisabled = false;
  let unlockTooltip = '';
  if (node.id === 'autocracy') {
    unlockDisabled = dissatisfaction < 10; // Example threshold
    unlockTooltip = 'Requires Dissatisfaction ≥ 10';
  }
  if (node.id === 'democracy') {
    unlockDisabled = satisfaction < 10; // Example threshold
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
      <div className="techtree-children">
        {node.children.map(childId =>
          renderNode(
            { ...techTree.find(n => n.id === childId), parent: node.id },
            unlocked,
            onUnlock,
            selectedPath,
            satisfaction,
            dissatisfaction
          )
        )}
      </div>
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

  // Only show the chosen path after selection
  const root = techTree.find(n => n.id === 'root');
  let childrenToShow = root.children;
  if (selectedPath) {
    childrenToShow = [selectedPath];
  }

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Interventions Tech Tree</h2>
      <div className="techtree-container">
        {renderNode(
          { ...root, children: childrenToShow },
          unlocked,
          handleUnlock,
          selectedPath,
          satisfaction,
          dissatisfaction
        )}
      </div>
      {/* Simple styles for demonstration */}
      <style>{`
        .techtree-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .techtree-node {
          border: 1px solid #bbb;
          border-radius: 8px;
          padding: 12px 18px;
          margin: 8px 0;
          min-width: 220px;
          background: #f9f9f9;
          position: relative;
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
        .techtree-children {
          margin-left: 32px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
