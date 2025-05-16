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
import WelcomeBackModal from '@components/WelcomeBackModal/WelcomeBackModal'; // Import the new modal
import useCloudSave from '@hooks/useCloudSave';

export default function ClickerGame({
  easyMode = false,
  onEasyModeToggle,
  registerSaveGameHandler,
  musicPlaying, // This is from App.js, not used directly here for control
  setMusicPlaying,
  musicEnabled, // New
  setMusicEnabled, // New
  soundEffectsEnabled, // New
  setSoundEffectsEnabled // New
}) {
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
    offlineEarningsLevel,      // New
    currentOfflineEarningsFactor, // New
    offlineEarningsLevelCost,  // New
    buyOfflineEarningsLevel,     // New
    gameState,
    loadGameState,
    activePlayTime,
    inactivePlayTime,
    lastInactiveDuration,      // Get new state from hook
    clearLastInactiveDuration, // Get new function from hook
    calculatedOfflineEarnings, // Holen aus dem ersten Hook-Aufruf
    claimOfflineEarnings,      // Holen aus dem ersten Hook-Aufruf
  } = useClickerGame(easyMode, soundEffectsEnabled); // Pass soundEffectsEnabled

  const { achievements, unlockedAchievements, clearUnlockedAchievements } = useAchievements(money, floatingClicks, playTime);
  const {
    showAchievement,
    setShowAchievement,
    setNotificationQueue,
    hasAnyAchievement,
  } = useAchievementNotifications(achievements, unlockedAchievements, clearUnlockedAchievements);

  // --- Cloud Save Hook ---
  const { exportToCloud, cloudUuid } = useCloudSave();
  const cloudSaveMode = uiProgress.cloudSaveMode;

  // Track if music has started
  const [musicStarted, setMusicStarted] = useState(false);

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
    // Start background music on first manual click
    if (musicEnabled && !musicStarted && typeof setMusicPlaying === 'function') {
      setMusicPlaying(true);
      setMusicStarted(true);
    }
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

  // Leaderboard-Checkpoint-Tracking im Local Storage
  const LEADERBOARD_CHECKPOINTS_KEY = 'leaderboardCheckpointsReached';

  function getReachedCheckpointsFromStorage() {
    try {
      const stored = localStorage.getItem(LEADERBOARD_CHECKPOINTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function addCheckpointToStorage(checkpoint) {
    const reached = getReachedCheckpointsFromStorage();
    if (!reached.includes(checkpoint)) {
      reached.push(checkpoint);
      localStorage.setItem(LEADERBOARD_CHECKPOINTS_KEY, JSON.stringify(reached));
    }
  }

  const [leaderboardName, setLeaderboardName] = useState("");
  const [checkpointReached, setCheckpointReached] = useState(false);
  const [showLeaderboardCongrats, setShowLeaderboardCongrats] = useState(false);
  const [leaderboardSubmitted, setLeaderboardSubmitted] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);

  // Leaderboard-Checkpoint-Modal nur zeigen, wenn dieser Checkpoint noch nicht im Local Storage ist
  useEffect(() => {
    const checkpoint = CHECKPOINTS.find(cp => money >= cp);
    setCurrentCheckpoint(checkpoint || null);
    if (
      checkpoint &&
      !leaderboardSubmitted &&
      !checkpointReached &&
      !getReachedCheckpointsFromStorage().includes(checkpoint)
    ) {
      setCheckpointReached(true);
      setShowLeaderboardCongrats(true);
    }
  }, [money, leaderboardSubmitted, checkpointReached]);

  // Nach Submit oder "Maybe later" Checkpoint im Local Storage speichern und Spielstand sichern
  const handleLeaderboardCongratsClose = async () => {
    if (currentCheckpoint) {
      addCheckpointToStorage(currentCheckpoint);
    }
    // Save game state (cloud or local)
    if (cloudSaveMode) {
      try {
        // Force new UUID if missing (first cloud save)
        if (!cloudUuid) {
          await exportToCloud({ ...gameState });
        } else {
          await exportToCloud({ ...gameState });
        }
      } catch (e) {
        // Optionally show error to user
        console.error('Cloud save failed:', e);
      }
    } else if (typeof saveGame === 'function') {
      saveGame();
    }
    setShowLeaderboardCongrats(false);
  };

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
      activePlaytime: activePlayTime, // Add activePlayTime here
      timestamp: Date.now(),
    });
    setLeaderboardSubmitted(true);
    // Save game state (cloud or local)
    if (cloudSaveMode) {
      try {
        // Force new UUID if missing (first cloud save)
        if (!cloudUuid) {
          await exportToCloud({ ...gameState });
        } else {
          await exportToCloud({ ...gameState });
        }
      } catch (e) {
        // Optionally show error to user
        console.error('Cloud save failed:', e);
      }
    } else if (typeof saveGame === 'function') {
      saveGame();
    }
    handleLeaderboardCongratsClose();
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

  // State and effect for WelcomeBackModal
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);
  useEffect(() => {
    console.log('[ClickerGame] WelcomeBackModal effect. lastInactiveDuration:', lastInactiveDuration, 'uiProgress.gameStarted:', uiProgress.gameStarted);
    // Show modal if inactive duration (from reload or tab hide) is more than 5 seconds
    if (lastInactiveDuration > 5 && uiProgress.gameStarted) {
      setShowWelcomeBackModal(true);
    }
  }, [lastInactiveDuration, uiProgress.gameStarted]);

  // Registriere die saveGame Funktion beim übergeordneten App-Component
  useEffect(() => {
    if (registerSaveGameHandler && typeof registerSaveGameHandler === 'function') {
      registerSaveGameHandler(saveGame);
    }
  }, [saveGame, registerSaveGameHandler]);

  return (
    <div className="game-container">
      {/* Welcome Back Modal */}
      {showWelcomeBackModal && (
        <WelcomeBackModal
          show={showWelcomeBackModal}
          duration={lastInactiveDuration}
          offlineEarnings={calculatedOfflineEarnings} // Weitergeben
          isOfflineEarningsUnlocked={offlineEarningsLevel > 0} // Updated logic
          onClose={() => {
            setShowWelcomeBackModal(false);
            clearLastInactiveDuration(); // Reset the trigger in the hook
            claimOfflineEarnings(); // Offline-Einnahmen beanspruchen
          }}
        />
      )}

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
          activePlayTime={activePlayTime}
          inactivePlayTime={inactivePlayTime}
          musicEnabled={musicEnabled} // Pass down
          setMusicEnabled={setMusicEnabled} // Pass down
          soundEffectsEnabled={soundEffectsEnabled} // Pass down
          setSoundEffectsEnabled={setSoundEffectsEnabled} // Pass down
        />
      )}

      {/* Modal für Leaderboard-Checkpoint */}
      {showLeaderboardCongrats && (
        <div className="modal-backdrop" style={{ zIndex: 10002 }}>
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <div className="settings-modal-header">
              <h3>Congratulations!</h3>
            </div>
            <p>
              You have reached a milestone ({CHECKPOINTS.find(cp => money >= cp).toLocaleString('en-US')} €)!<br />
              Do you want to enter your name for the leaderboard?
            </p>
            <input
              className="modal-input"
              type="text"
              maxLength={18}
              placeholder="Your name for the leaderboard"
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
                Submit
              </button>
              <button
                className="modal-btn"
                onClick={handleLeaderboardCongratsClose}
              >
                Maybe later
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
            offlineEarningsLevel={offlineEarningsLevel}               // New
            currentOfflineEarningsFactor={currentOfflineEarningsFactor} // New
            buyOfflineEarningsLevel={buyOfflineEarningsLevel}           // New
            offlineEarningsLevelCost={offlineEarningsLevelCost}         // New
            soundEffectsEnabled={soundEffectsEnabled} // Pass down
          />
        </div>
      )}

      {/* FloatingClickButton immer sichtbar */}
      <FloatingClickButton onClick={handleFloatingClick} centerMode={floatingCenterMode} />
    </div>
  );
}