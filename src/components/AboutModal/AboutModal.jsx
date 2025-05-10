import React from 'react';
import { X as CloseIcon, Github as GithubIcon, Coffee as CoffeeIcon } from 'lucide-react';
import { useModal } from '../../hooks/useModal';

export default function AboutModal({ show, onClose }) {
  const modalRef = useModal(show, onClose);

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal-content" style={{ maxWidth: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="settings-modal-header">
          <h3>About Euro Clicker Game</h3>
          <button
            className="settings-button"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="settings-modal-content" style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
          <h4>What is Euro Clicker Game?</h4>
          <p>
            Euro Clicker Game is an idle game inspired by popular titles like "Cookie Clicker" and "Adventure Capitalist," 
            featuring a European money theme. The game includes different colored click buttons with varying values, 
            cooldown timers for each button, managers to automate clicks, two types of upgrades (value and time), 
            and a simple user interface.
          </p>

          <h4>How to Play</h4>
          <p>
            <strong>Basic Principles:</strong> Click on the floating Euro button to earn money. As you earn more, 
            you'll unlock colored buttons with different values and cooldowns.
          </p>
          <p>
            <strong>Managers:</strong> Purchase managers to automate clicking for specific buttons, allowing you to 
            earn money passively.
          </p>
          <p>
            <strong>Upgrades:</strong> Invest in upgrades to increase button values or reduce cooldown times, 
            optimizing your earnings.
          </p>
          <p>
            <strong>Strategy:</strong> Balance your investments between different buttons, managers, and upgrades 
            to maximize your income per second.
          </p>

          <h4>Technologies Used</h4>
          <ul>
            <li>React.js</li>
            <li>React Hooks</li>
            <li>CSS/SCSS</li>
            <li>Lucide React (for icons)</li>
            <li>Firebase (for leaderboard and cloud saves)</li>
          </ul>

          <h4>Credits</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <GithubIcon size={20} />
            <a 
              href="https://github.com/philipp-1337/euro-clicker-game" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'var(--color-primary)' }}
            >
              View on GitHub
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <CoffeeIcon size={20} />
            <span>Created by fabiokay & philipp-1337</span>
          </div>

          <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
            Licensed under the MIT License
          </div>
        </div>
      </div>
    </div>
  );
}