import { useUiProgress } from '@hooks/useUiProgress';
import { useState } from 'react';
import GameHeader from '@components/GameHeader';
import ClickerButtons from './ClickerButtons';
import FloatingClickButton from './FloatingClickButton';
import UpgradeTabs from './UpgradeTabs';
import useClickerGame from '@hooks/useClickerGame';
import 'App.scss';

export default function ClickerGame({ easyMode = false, onEasyModeToggle }) {
  const [activeTab, setActiveTab] = useState('basic');
  // UI-Progress-Logik in eigenen Hook ausgelagert
  const {
    uiProgress,
    setGameStarted,
    setButtonClicked,
    floatingClicks,
    incrementFloatingClicks,
  } = useUiProgress();

  const { gameStarted, clickedButtons } = uiProgress;

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
    unlockStateCost,
    investmentCostMultiplier,
    isInterventionsUnlocked,
    unlockInterventions,
    interventionsUnlockCost,
    } = useClickerGame(easyMode);

  // Handler für FloatingClickButton
  const handleFloatingClick = () => {
    if (!uiProgress.gameStarted) setGameStarted();
    incrementFloatingClicks();
    addQuickMoney();
  };

  // Handler für ClickerButtons
  const handleClickerButton = (index) => {
    setButtonClicked(index);
    handleClick(index);
  };

  // UpgradeTabs erst anzeigen, wenn alle Buttons mindestens einmal geklickt wurden
  const allButtonsClicked = uiProgress.clickedButtons.every(Boolean);

  // FloatingButton: centerMode solange < 1 Klicks
  const floatingCenterMode = floatingClicks < 1;

  return (
    <div className="game-container">
      {/* GameHeader (mit Money, Income, Save, Reset, Playtime) erst nach erstem Klick */}
      {uiProgress.gameStarted && (
        <GameHeader
          money={money}
          easyMode={easyMode}
          onEasyModeToggle={onEasyModeToggle}
          playTime={playTime}
          onSaveGame={saveGame}
          totalMoneyPerSecond={totalMoneyPerSecond}
        />
      )}

      {/* ClickerButtons erst ab 10 € */}
      {uiProgress.gameStarted && money >= 10 && (
        <ClickerButtons 
          buttons={buttons} 
          cooldowns={cooldowns} 
          handleClick={handleClickerButton} 
        />
      )}

      {/* UpgradeTabs erst, wenn alle Buttons mindestens einmal geklickt wurden */}
      {uiProgress.gameStarted && money >= 10 && allButtonsClicked && (
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
          isInterventionsUnlocked={isInterventionsUnlocked}
          unlockInterventions={unlockInterventions}
          interventionsUnlockCost={interventionsUnlockCost}
          investmentCostMultiplier={investmentCostMultiplier}
        />
      )}

      {/* FloatingClickButton immer sichtbar */}
      <FloatingClickButton onClick={handleFloatingClick} centerMode={floatingCenterMode} />
    </div>
  );
}