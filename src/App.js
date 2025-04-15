import React, { useState } from 'react';
import ClickerGame from '@components/ClickerGame';
import InvestmentGame from '@components/InvestmentGame'; // Vorausgesetzt, du erstellst das
import './App.css';

function App() {
  const [easyMode, setEasyMode] = useState(localStorage.getItem('easyMode') === 'true');
  const [activeGame, setActiveGame] = useState('clicker'); // 'clicker' | 'investment'

  const handleEasyModeToggle = (isEasyMode) => {
    setEasyMode(isEasyMode);
    localStorage.setItem('easyMode', isEasyMode.toString());
  };

  return (
    <div className="App">
      <div className="game-selector">
        <button onClick={() => setActiveGame('clicker')}>💶 Clicker</button>
        <button onClick={() => setActiveGame('investment')}>📈 Investment</button>
      </div>
      
      {activeGame === 'clicker' && (
        <ClickerGame easyMode={easyMode} onEasyModeToggle={handleEasyModeToggle} />
      )}
      {activeGame === 'investment' && (
        <InvestmentGame easyMode={easyMode} onEasyModeToggle={handleEasyModeToggle} />
      )}
    </div>
  );
}

export default App;