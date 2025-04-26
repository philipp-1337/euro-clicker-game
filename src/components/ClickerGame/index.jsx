import { useUiProgress } from '@hooks/useUiProgress';
import { useState, useEffect } from 'react'; // Importiere useEffect
import GameHeader from '@components/GameHeader';
import ClickerButtons from './ClickerButtons';
import FloatingClickButton from './FloatingClickButton';
import UpgradeTabs from './UpgradeTabs';
import useClickerGame from '@hooks/useClickerGame';
import 'App.scss';

export default function ClickerGame({ easyMode = false, onEasyModeToggle, registerSaveGameHandler }) { // Neuer Prop
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

  // Registriere die saveGame Funktion beim übergeordneten App-Component
  useEffect(() => {
    if (registerSaveGameHandler && typeof registerSaveGameHandler === 'function') {
      registerSaveGameHandler(saveGame);
    }
  }, [saveGame, registerSaveGameHandler]);

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

  // --- Fix: UI bleibt sichtbar, wenn einmal freigeschaltet, auch wenn das Geld wieder unter 10 € fällt ---
  // Merke, ob ClickerButtons und UpgradeTabs schon einmal angezeigt wurden
  const [clickerButtonsUnlocked, setClickerButtonsUnlocked] = useState(false);
  const [upgradeTabsUnlocked, setUpgradeTabsUnlocked] = useState(false);

  if (uiProgress.gameStarted && money >= 10 && !clickerButtonsUnlocked) {
    setClickerButtonsUnlocked(true);
  }
  if (uiProgress.gameStarted && money >= 10 && allButtonsClicked && !upgradeTabsUnlocked) {
    setUpgradeTabsUnlocked(true);
  }

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
          floatingClicks={floatingClicks} // <-- floatingClicks weitergeben
        />
      )}

      {/* ClickerButtons erst ab 10 €, aber nach Freischaltung immer sichtbar */}
      {uiProgress.gameStarted && clickerButtonsUnlocked && (
        <div className="clicker-buttons-fade">
          <ClickerButtons 
            buttons={buttons} 
            cooldowns={cooldowns} 
            handleClick={handleClickerButton} 
          />
        </div>
      )}

      {/* UpgradeTabs erst, wenn alle Buttons mindestens einmal geklickt wurden, aber nach Freischaltung immer sichtbar */}
      {uiProgress.gameStarted && upgradeTabsUnlocked && (
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