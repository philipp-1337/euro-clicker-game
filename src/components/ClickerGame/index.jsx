import { useState } from 'react';
import GameHeader from './GameHeader';
import ClickerButtons from './ClickerButtons';
import FloatingClickButton from './FloatingClickButton';
import UpgradeTabs from './UpgradeTabs';
import useClickerGame from '@hooks/useClickerGame';
import './ClickerGame.css';

export default function ClickerGame({ easyMode = false, onEasyModeToggle }) {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' oder 'premium'
  
  // Übergebe easyMode als Parameter an den Hook
  const {
    money,
    buttons,
    cooldowns,
    managers,
    handleClick,
    buyManager,
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    buyValueUpgrade,
    buyCooldownUpgrade,
    globalMultiplier,
    globalMultiplierLevel,
    offlineEarningsLevel,
    globalMultiplierCost,
    offlineEarningsCost,
    buyGlobalMultiplier,
    buyOfflineEarnings,
    managerCosts,
    playTime,
    saveGame,
    addQuickMoney
  } = useClickerGame(easyMode);

  return (
    <div className="game-container">
      <GameHeader 
        money={money} 
        easyMode={easyMode} 
        onEasyModeToggle={onEasyModeToggle}
        playTime={playTime}
        onSaveGame={saveGame}
      />
      <ClickerButtons 
        buttons={buttons} 
        cooldowns={cooldowns} 
        handleClick={handleClick} 
      />
      
      <UpgradeTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        money={money}
        buttons={buttons}
        valueUpgradeLevels={valueUpgradeLevels}
        cooldownUpgradeLevels={cooldownUpgradeLevels}
        valueUpgradeCosts={valueUpgradeCosts}
        cooldownUpgradeCosts={cooldownUpgradeCosts}
        buyValueUpgrade={buyValueUpgrade}
        buyCooldownUpgrade={buyCooldownUpgrade}
        globalMultiplier={globalMultiplier}
        globalMultiplierLevel={globalMultiplierLevel}
        offlineEarningsLevel={offlineEarningsLevel}
        globalMultiplierCost={globalMultiplierCost}
        offlineEarningsCost={offlineEarningsCost}
        buyGlobalMultiplier={buyGlobalMultiplier}
        buyOfflineEarnings={buyOfflineEarnings}
        managers={managers}
        buyManager={buyManager}
        managerCosts={managerCosts}
      />

    <FloatingClickButton onClick={addQuickMoney} />

    </div>
  );
}