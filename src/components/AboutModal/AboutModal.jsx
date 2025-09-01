import { X as CloseIcon, Code, Coffee as CoffeeIcon } from 'lucide-react';
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
            Euro Clicker Game is a modern idle/incremental game with a European money theme, inspired by classics like &quot;Cookie Clicker&quot; and &quot;Adventure Capitalist.&quot; Build your fortune by clicking, investing, and strategizing across a growing set of features and upgrades.
          </p>

          <h4>How to Play</h4>
          <h5>Earning Money</h5>
          <p>
            Click the floating Euro button to start earning money. As your fortune grows, you&apos;ll unlock additional colored buttons, each offering unique values and cooldowns.
          </p>
          <h5>Automation & Upgrades</h5>
          <p>
            Hire managers to automate button clicks for passive income. Invest in basic upgrades to boost button values and reduce cooldowns. Unlock powerful premium upgrades like critical clicks, enhanced floating button value, global multipliers, price reductions, and offline earnings. For ultimate efficiency, unlock auto-buyers to purchase upgrades for you automatically.
          </p>
          <h5>Investments & Strategy</h5>
          <p>
            Once you&apos;ve advanced, unlock the Investments tab to invest in companies for long-term, passive income.
          </p>
          <h5>Wealth Production</h5>
          <p>
            After your first prestige, you can unlock &quot;Wealth Production.&quot; Purchase raw materials and use them to craft valuable items like Collectible Coins or Gold Reserves for a massive cash injection.
          </p>
          <h5>Progression & Achievements</h5>
          <p>
            Even when you&apos;re away, your empire keeps growing—upgrade your offline earnings to maximize gains during inactivity. Unlock achievements by reaching milestones such as total clicks, fast money, and long playtime, and track your progress in the Achievements section. Dive into detailed statistics about your playtime, click counts, and more in the Statistics modal.
          </p>
          <h5>Prestige System</h5>
          <p>
            Once you&apos;ve amassed a significant fortune (starting from 1 Billion €), you can choose to &quot;Prestige.&quot; This will reset your current game progress (money, upgrades, investments, etc., except for permanent UI unlocks and play statistics) but grants you Prestige Shares. Each share provides a permanent percentage bonus to your income per second, allowing you to progress faster in subsequent playthroughs. The more money you have when you prestige, the more shares you earn. You can trigger Prestige via a button in the game header once you&apos;ve earned at least one full share in your current run.
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
            <Code size={20} />
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