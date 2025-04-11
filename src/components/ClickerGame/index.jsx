import { useState } from 'react';
import GameHeader from './GameHeader';
import ClickerButtons from './ClickerButtons';
import Managers from './Managers';
import UpgradeTabs from './UpgradeTabs';
import useClickerGame from '@hooks/useClickerGame';
import './ClickerGame.css';

export default function ClickerGame() {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' oder 'premium'
  
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
    buyOfflineEarnings
  } = useClickerGame();

  return (
    <div className="game-container">
      <GameHeader money={money} />
      
      <ClickerButtons 
        buttons={buttons} 
        cooldowns={cooldowns} 
        handleClick={handleClick} 
      />
      
      <Managers 
        buttons={buttons} 
        managers={managers} 
        money={money} 
        buyManager={buyManager} 
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
      />
    </div>
  );
}