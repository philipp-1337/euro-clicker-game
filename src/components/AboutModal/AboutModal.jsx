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
            Euro Clicker Game is a modern idle/incremental game with a European money theme, inspired by classics like "Cookie Clicker" and "Adventure Capitalist." Build your fortune by clicking, investing, and strategizing across a growing set of features and upgrades.
          </p>

          <h4>How to Play</h4>
          <h5>Earning Money</h5>
          <p>
            Click the floating Euro button to start earning money. As your fortune grows, you'll unlock additional colored buttons, each offering unique values and cooldowns.
          </p>
          <h5>Automation & Upgrades</h5>
          <p>
            Hire managers to automate button clicks, allowing you to earn passively even when you're not actively clicking. Invest in upgrades to boost button values and reduce cooldowns, and take advantage of premium upgrades such as global multipliers, price decreases, and offline earnings to accelerate your progress.
          </p>
          <h5>Investments & Strategy</h5>
          <p>
            Once you've advanced, unlock the Investments tab to invest in companies for long-term, passive income. Expand further by investing in state buildings and infrastructure, which influence costs and income and add new layers of strategy. Unlock and deploy interventions for powerful, game-changing effects that can shift your approach.
          </p>
          <h5>Progression & Achievements</h5>
          <p>
            Even when you're away, your empire keeps growing—upgrade your offline earnings to maximize gains during inactivity. Unlock achievements by reaching milestones such as total clicks, fast money, and long playtime, and track your progress in the Achievements section. Dive into detailed statistics about your playtime, click counts, and more in the Statistics modal.
          </p>
          <h5>Competition & Experience</h5>
          <p>
            Compete on the global leaderboard for high scores and milestones, and submit your best results to see how you stack up against other players. Securely save and load your progress via the cloud, powered by Firebase. Enjoy toggleable sound effects and background music, full dark mode support, and a responsive interface for seamless play on any device.
          </p>

          <h4>Technologies Used</h4>
          <ul>
            <li>React.js & React Hooks</li>
            <li>CSS/SCSS</li>
            <li>Lucide React (for icons)</li>
            <li>Firebase (leaderboard & cloud saves)</li>
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