import { useState } from 'react';
import GameHeader from '@components/GameHeader';
import ClickerButtons from './ClickerButtons';
import FloatingClickButton from './FloatingClickButton';
import UpgradeTabs from './UpgradeTabs';
import useClickerGame from '@hooks/useClickerGame';
import 'App.scss';

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
    investments,
    buyInvestment,
    valueUpgradeLevels,
    cooldownUpgradeLevels,
    valueUpgradeCosts,
    cooldownUpgradeCosts,
    buyValueUpgrade,
    buyCooldownUpgrade,
    globalMultiplier,
    globalMultiplierLevel,
    globalMultiplierCost,
    globalPriceDecrease,
    globalPriceDecreaseLevel,
    globalPriceDecreaseCost,
    buyGlobalPriceDecrease,
    buyGlobalMultiplier,
    managerCosts,
    playTime,
    saveGame,
    addQuickMoney,
    valueMultipliers,
    cooldownReductions,
    isInvestmentUnlocked,
    unlockInvestments,
    totalIncomePerSecond,
    totalMoneyPerSecond,
    satisfaction,
    dissatisfaction,
    stateBuildings,
    buyStateBuilding,
    unlockInvestmentCost,
    isStateUnlocked,
    unlockState,
    unlockStateCost
    } = useClickerGame(easyMode);

  return (
    <div className="game-container">
      <GameHeader 
        money={money} 
        easyMode={easyMode} 
        onEasyModeToggle={onEasyModeToggle}
        playTime={playTime}
        onSaveGame={saveGame}
        totalMoneyPerSecond={totalMoneyPerSecond}
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
        investments={investments}
        buyInvestment={buyInvestment}
        valueUpgradeLevels={valueUpgradeLevels}
        cooldownUpgradeLevels={cooldownUpgradeLevels}
        valueUpgradeCosts={valueUpgradeCosts}
        cooldownUpgradeCosts={cooldownUpgradeCosts}
        buyValueUpgrade={buyValueUpgrade}
        buyCooldownUpgrade={buyCooldownUpgrade}
        globalMultiplier={globalMultiplier}
        globalMultiplierLevel={globalMultiplierLevel}
        globalMultiplierCost={globalMultiplierCost}
        buyGlobalMultiplier={buyGlobalMultiplier}
        managers={managers}
        buyManager={buyManager}
        managerCosts={managerCosts}
        valueMultipliers={valueMultipliers}
        cooldownReductions={cooldownReductions}
        isInvestmentUnlocked={isInvestmentUnlocked}
        unlockInvestments={unlockInvestments}
        totalIncomePerSecond={totalIncomePerSecond}
        globalPriceDecrease={globalPriceDecrease}
        globalPriceDecreaseLevel={globalPriceDecreaseLevel}
        globalPriceDecreaseCost={globalPriceDecreaseCost}
        buyGlobalPriceDecrease={buyGlobalPriceDecrease}
        satisfaction={satisfaction}
        dissatisfaction={dissatisfaction}
        stateBuildings={stateBuildings}
        buyStateBuilding={buyStateBuilding}
        totalMoneyPerSecond={totalMoneyPerSecond}
        unlockInvestmentCost={unlockInvestmentCost}
        isStateUnlocked={isStateUnlocked}
        unlockState={unlockState}
        unlockStateCost={unlockStateCost}
      />

    <FloatingClickButton onClick={addQuickMoney} />

    </div>
  );
}