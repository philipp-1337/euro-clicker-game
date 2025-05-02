import { useUiProgress } from '@hooks/useUiProgress';
import { useState, useEffect, useCallback } from 'react';
import GameHeader from '@components/GameHeader';
import ClickerButtons from './ClickerButtons';
import FloatingClickButton from './FloatingClickButton';
import UpgradeTabs from './UpgradeTabs';
import useClickerGame from '@hooks/useClickerGame';
import { useAchievements } from '@hooks/useAchievements';
import AchievementNotification from './AchievementNotification';
import 'App.scss';

export default function ClickerGame({ easyMode = false, onEasyModeToggle, registerSaveGameHandler }) {
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
    gameState, // <--- hinzufügen
    loadGameState, // <--- hinzufügen
  } = useClickerGame(easyMode);

  const { achievements, unlockedAchievements, clearUnlockedAchievements } = useAchievements(money, floatingClicks, playTime);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [showAchievement, setShowAchievement] = useState(null);

  // Hilfsfunktionen für Notification-Status
  const getSeenAchievementNotifications = useCallback(() => {
    try {
      const raw = localStorage.getItem('achievementNotificationsSeen');
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, []);

  const markAchievementNotificationSeen = useCallback((id) => {
    try {
      const seen = getSeenAchievementNotifications();
      if (!seen.includes(id)) {
        const updated = [...seen, id];
        localStorage.setItem('achievementNotificationsSeen', JSON.stringify(updated));
      }
    } catch {}
  }, [getSeenAchievementNotifications]);

  const hasSeenAchievementNotification = useCallback((id) => {
    return getSeenAchievementNotifications().includes(id);
  }, [getSeenAchievementNotifications]);

  // Hilfsfunktion: Gibt true zurück, sobald mindestens ein Achievement freigeschaltet wurde
  const hasAnyAchievement = Object.values(achievements).some(a => a.unlocked);

  // Wenn neue Achievements freigeschaltet werden, zur Queue hinzufügen (nur wenn noch nicht gesehen)
  useEffect(() => {
    if (unlockedAchievements.length > 0) {
      const unseen = unlockedAchievements.filter(a => !hasSeenAchievementNotification(a.id));
      if (unseen.length > 0) {
        setNotificationQueue(prev => [...prev, ...unseen]);
      }
      clearUnlockedAchievements();
    }
  }, [unlockedAchievements, clearUnlockedAchievements, hasSeenAchievementNotification]);

  // Immer wenn showAchievement null wird und noch etwas in der Queue ist, das nächste anzeigen
  useEffect(() => {
    if (!showAchievement && notificationQueue.length > 0) {
      setShowAchievement(notificationQueue[0]);
    }
  }, [notificationQueue, showAchievement]);

  // Wenn ein Achievement angezeigt wird, nach 3s wieder ausblenden und aus Queue entfernen
  useEffect(() => {
    if (showAchievement) {
      // Markiere als gesehen, sobald angezeigt
      markAchievementNotificationSeen(showAchievement.id);
      const timer = setTimeout(() => {
        setShowAchievement(null);
        setNotificationQueue(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAchievement, markAchievementNotificationSeen]);

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
  const [clickerButtonsUnlocked, setClickerButtonsUnlocked] = useState(
    uiProgress.gameStarted && money >= 10
  );
  const [upgradeTabsUnlocked, setUpgradeTabsUnlocked] = useState(
    uiProgress.gameStarted && money >= 10 && allButtonsClicked
  );

  // Synchronisiere nach jedem Render, falls Bedingungen erfüllt sind
  useEffect(() => {
    if (uiProgress.gameStarted && money >= 10 && !clickerButtonsUnlocked) {
      setClickerButtonsUnlocked(true);
    }
  }, [uiProgress.gameStarted, money, clickerButtonsUnlocked]);

  useEffect(() => {
    if (uiProgress.gameStarted && money >= 10 && allButtonsClicked && !upgradeTabsUnlocked) {
      setUpgradeTabsUnlocked(true);
    }
  }, [uiProgress.gameStarted, money, allButtonsClicked, upgradeTabsUnlocked]);

  return (
    <div className="game-container">
      {/* Achievement Notification */}
      {showAchievement && (
        <AchievementNotification
          achievement={showAchievement}
          onClose={() => {
            setShowAchievement(null);
            setNotificationQueue(prev => prev.slice(1));
          }}
        />
      )}
      {/* GameHeader (mit Money, Income, Save, Reset, Playtime) erst nach erstem Klick */}
      {uiProgress.gameStarted && (
        <GameHeader
          money={money}
          easyMode={easyMode}
          onEasyModeToggle={onEasyModeToggle}
          playTime={playTime}
          onSaveGame={saveGame}
          totalMoneyPerSecond={totalMoneyPerSecond}
          floatingClicks={floatingClicks}
          gameState={gameState}
          onImportCloudSave={loadGameState}
          achievements={achievements}
          hasAnyAchievement={hasAnyAchievement}
        />
      )}

      {/* ClickerButtons erst ab 10 €, aber nach Freischaltung immer sichtbar */}
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