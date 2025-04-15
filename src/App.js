import React, { useState } from 'react';
import ClickerGame from '@components/ClickerGame';

function App() {
  // Initialisiere easyMode basierend auf localStorage
  const [easyMode, setEasyMode] = useState(localStorage.getItem('easyMode') === 'true');

  // Handler für Easy-Mode-Toggle
  const handleEasyModeToggle = (isEasyMode) => {
    setEasyMode(isEasyMode);
    localStorage.setItem('easyMode', isEasyMode.toString());
  };

  return (
    <div className="App">
      <ClickerGame easyMode={easyMode} onEasyModeToggle={handleEasyModeToggle} />
    </div>
  );
}

export default App; 