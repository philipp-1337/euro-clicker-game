import { useUiProgress } from '@hooks/useUiProgress';
import { useState, useEffect } from 'react';
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

  // Fade-In für UpgradeTabs und ClickerButtons
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showClickerButtons, setShowClickerButtons] = useState(false);

  // Zeige UpgradeTabs, wenn sie sichtbar werden sollen
  // Zeige ClickerButtons, wenn sie sichtbar werden sollen
  // useEffect statt useState für Side-Effect!
  useEffect(() => {
    if (uiProgress.gameStarted && money >= 10 && allButtonsClicked) {
      setShowUpgrades(true);
    }
    if (uiProgress.gameStarted && money >= 10) {
      setShowClickerButtons(true);
    }
  }, [uiProgress.gameStarted, money, allButtonsClicked]);

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
        <div className="clicker-buttons-fade">
          <ClickerButtons 
            buttons={buttons} 
            cooldowns={cooldowns} 
            handleClick={handleClickerButton} 
          />
        </div>
      )}

      {/* UpgradeTabs erst, wenn alle Buttons mindestens einmal geklickt wurden */}
      {uiProgress.gameStarted && money >= 10 && allButtonsClicked && (
        <div className="upgrade-tabs-fade">
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
        </div>
      )}

      {/* FloatingClickButton immer sichtbar */}
      <FloatingClickButton onClick={handleFloatingClick} centerMode={floatingCenterMode} />
    </div>
  );
}