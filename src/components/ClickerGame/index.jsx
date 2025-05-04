import { useUiProgress } from '@hooks/useUiProgress';
import { useState, useEffect } from 'react';
import GameHeader from '@components/GameHeader';
import ClickerButtons from './ClickerButtons';
import FloatingClickButton from './FloatingClickButton';
import UpgradeTabs from './UpgradeTabs';
import useClickerGame from '@hooks/useClickerGame';
import { useAchievements } from '@hooks/useAchievements';
import useAchievementNotifications from '@hooks/useAchievementNotifications';
import AchievementNotification from './AchievementNotification';
import { CHECKPOINTS } from '@constants/gameConfig';

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
    gameState,
    loadGameState,
  } = useClickerGame(easyMode);

  const { achievements, unlockedAchievements, clearUnlockedAchievements } = useAchievements(money, floatingClicks, playTime);
  const {
    showAchievement,
    setShowAchievement,
    setNotificationQueue,
    hasAnyAchievement,
  } = useAchievementNotifications(achievements, unlockedAchievements, clearUnlockedAchievements);

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

  // Leaderboard Submission: immer aktiv (kein Mode mehr)
  const [leaderboardName, setLeaderboardName] = useState("");
  const [checkpointReached, setCheckpointReached] = useState(false);
  const [showLeaderboardCongrats, setShowLeaderboardCongrats] = useState(false);
  const [leaderboardSubmitted, setLeaderboardSubmitted] = useState(false);

  useEffect(() => {
    if (CHECKPOINTS.some(cp => money >= cp) && !leaderboardSubmitted && !checkpointReached) {
      setCheckpointReached(true);
      setShowLeaderboardCongrats(true);
    }
  }, [money, leaderboardSubmitted, checkpointReached]);

  // Leaderboard Submission (analog zu useLeaderboardSubmit, aber immer aktiv)
  const handleLeaderboardSubmit = async () => {
    if (!leaderboardName.trim()) return;
    // Firestore Submission wie in useLeaderboardSubmit.js
    const { addDoc, collection } = await import('firebase/firestore');
    const { db } = await import('../../firebase');
    await addDoc(collection(db, 'leaderboard'), {
      name: leaderboardName.trim(),
      playtime: playTime,
      clicks: floatingClicks,
      timestamp: Date.now(),
    });
    setLeaderboardSubmitted(true);
    setShowLeaderboardCongrats(false);
  };

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

  // Registriere die saveGame Funktion beim übergeordneten App-Component
  useEffect(() => {
    if (registerSaveGameHandler && typeof registerSaveGameHandler === 'function') {
      registerSaveGameHandler(saveGame);
    }
  }, [saveGame, registerSaveGameHandler]);

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

      {/* Modal für Leaderboard-Checkpoint */}
      {showLeaderboardCongrats && (
        <div className="modal-backdrop" style={{ zIndex: 10002 }}>
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <h3>Herzlichen Glückwunsch!</h3>
            <p>
              Du hast einen Meilenstein erreicht ({CHECKPOINTS.find(cp => money >= cp).toLocaleString('de-DE')} €)!<br />
              Möchtest du deinen Namen für das Leaderboard eintragen?
            </p>
            <input
              className="modal-input"
              type="text"
              maxLength={18}
              placeholder="Dein Name für das Leaderboard"
              value={leaderboardName}
              onChange={e => setLeaderboardName(e.target.value)}
              style={{ marginBottom: 18, width: "100%" }}
            />
            <div className="modal-actions">
              <button
                className="modal-btn"
                disabled={!leaderboardName.trim()}
                onClick={handleLeaderboardSubmit}
              >
                Eintragen
              </button>
              <button
                className="modal-btn"
                style={{ background: "#eee", color: "#333" }}
                onClick={() => setShowLeaderboardCongrats(false)}
              >
                Später
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ClickerButtons erst ab 10 €, aber nach Freischaltung immer sichtbar */}
      {uiProgress.gameStarted && clickerButtonsUnlocked && (
        <div className="clicker-buttons-wrapper">
          <ClickerButtons
            money={money}
            buttons={buttons}
            cooldowns={cooldowns}
            handleClick={handleClickerButton}
            floatingClicks={floatingClicks}
            incrementFloatingClicks={incrementFloatingClicks}
            cooldownUpgradeLevels={cooldownUpgradeLevels}
            valueUpgradeLevels={valueUpgradeLevels}
            cooldownUpgradeCosts={cooldownUpgradeCosts}
            valueUpgradeCosts={valueUpgradeCosts}
            buyCooldownUpgrade={buyCooldownUpgrade}
            buyValueUpgrade={buyValueUpgrade}
            managers={managers}
            buyManager={buyManager}
            managerCosts={managerCosts}
            investments={investments}
            buyInvestment={buyInvestment}
            isInvestmentUnlocked={isInvestmentUnlocked}
            unlockInvestments={unlockInvestments}
            totalIncomePerSecond={totalMoneyPerSecond}
            satisfaction={satisfaction}
            dissatisfaction={dissatisfaction}
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