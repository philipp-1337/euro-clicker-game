import { useState, useEffect } from 'react';
import { useUiProgress } from '@hooks/useUiProgress';
import GameHeader from '@components/GameHeader';
import ClickerButtons from './ClickerButtons';
import FloatingClickButton from './FloatingClickButton';
import UpgradeTabs from './UpgradeTabs';
import useClickerGame from '@hooks/useClickerGame';
import { useAchievements } from '@hooks/useAchievements';
import useAchievementNotifications from '@hooks/useAchievementNotifications';
import { gameConfig } from '@constants/gameConfig'; // Import gameConfig
import AchievementNotification from './AchievementNotification';
import { CHECKPOINTS } from '@constants/gameConfig';
import WelcomeBackModal from '@components/WelcomeBackModal/WelcomeBackModal'; // Import the new modal
import useCloudSave from '@hooks/useCloudSave';
import { APP_VERSION } from '../../version';

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
  // buyQuantity, // This will be managed here now
  // toggleBuyQuantity // This will be managed here now
}) {
  const [activeTab, setActiveTab] = useState("basic");
  // UI-Progress-Logik in eigenen Hook ausgelagert
  const {
    uiProgress,
    setGameStarted,
    setButtonClicked,
    floatingClicks,
    incrementFloatingClicks,
    prestigeButtonEverVisible,
    setPrestigeButtonEverVisible,
  } = useUiProgress();

  // State for buy quantity (x1 / x10)
  const [buyQuantity, setBuyQuantity] = useState(1);
  const toggleBuyQuantity = () => {
    setBuyQuantity((prev) => {
      if (prev === 1) return 10;
      if (prev === 10) return 25;
      return 1; // Cycle back to 1 from 25
    });
  };

  const {
    money,
    setMoney,
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
    manualMoneyPerSecond,
    unlockInvestmentCost,
    investmentCostMultiplier,
    offlineEarningsLevel, // New
    currentOfflineEarningsFactor, // New
    offlineEarningsLevelCost, // New
    buyOfflineEarningsLevel, // New
    gameState,
    criticalClickChanceLevel, // New
    currentCriticalClickChance, // New
    criticalClickChanceCost, // New
    buyCriticalClickChanceLevel, // New
    loadGameState,
    activePlayTime,
    inactivePlayTime,
    lastInactiveDuration, // Get new state from hook
    clearLastInactiveDuration, // Get new function from hook
    calculatedOfflineEarnings, // Holen aus dem ersten Hook-Aufruf
    claimOfflineEarnings, // Holen aus dem ersten Hook-Aufruf
    handleInvestmentBoost, // Get the handler for investment boosts
    // Prestige related
    prestigeShares,
    prestigeCount,
    currentRunShares,
    prestigeGame,
    prestigeBonusMultiplier, // Stellen Sie sicher, dass dies hier ist
    canPrestige,
    floatingClickValueLevel,
    floatingClickValueMultiplier,
    buyFloatingClickValue,
    currentFloatingClickValue,
    craftingItems,
    buyCraftingItem,
    buyMaterial,
    rawMaterials,
    resourcePurchaseCounts,
    setRawMaterials,
    setResourcePurchaseCounts,
  isCraftingUnlocked,
  setIsCraftingUnlocked,
  autoBuyValueUpgradeEnabled,
  setAutoBuyValueUpgradeEnabled,
  autoBuyCooldownUpgradeEnabled,
  setAutoBuyCooldownUpgradeEnabled,
  } = useClickerGame(easyMode, soundEffectsEnabled); // Pass soundEffectsEnabled

  // Crafting Unlock Handler
  const unlockCrafting = () => {
    const unlockCost = gameConfig.unlockCraftingCost;
    if (!isCraftingUnlocked && prestigeShares >= 1 && money >= unlockCost) {
      if (typeof setMoney === "function") {
        setMoney((prev) => prev - unlockCost);
      }
      if (typeof setIsCraftingUnlocked === "function") {
        setIsCraftingUnlocked(true);
      }
      // SaveGame wird jetzt im useEffect nachgezogen
    }
  };

  const {
    achievements,
    unlockedAchievements,
    clearUnlockedAchievements,
    unlockSpecificAchievementById, // Funktion hier holen
  } = useAchievements(money, floatingClicks, playTime);
  const {
    showAchievement,
    setShowAchievement,
    setNotificationQueue,
    hasAnyAchievement,
  } = useAchievementNotifications(
    achievements,
    unlockedAchievements,
    clearUnlockedAchievements
  );

  // --- Cloud Save Hook ---
  const { exportToCloud, cloudUuid } = useCloudSave();
  const cloudSaveMode = uiProgress.cloudSaveMode;

  // Track if music has started
  const [musicStarted, setMusicStarted] = useState(false);

  // State für visuelle Effekte bei kritischen Klicks
  const [showCriticalEffect, setShowCriticalEffect] = useState(false);
  const [criticalHitAnimations, setCriticalHitAnimations] = useState([]);

  // Handler für FloatingClickButton
  const handleFloatingClick = () => {
    if (!uiProgress.gameStarted) setGameStarted();
    incrementFloatingClicks();
    // Start background music on first manual click (on floating button)
    if (
      musicEnabled &&
      !musicStarted &&
      typeof setMusicPlaying === "function"
    ) {
      setMusicPlaying(true);
      setMusicStarted(true);
    }
    // Füge Geld hinzu und prüfe, ob der Klick kritisch war
    const { isCritical, amount } = addQuickMoney(); // Destructure isCritical and amount
    if (isCritical) {
      console.log(
        "CRITICAL HIT DETECTED! Amount:",
        amount,
        "Applying visual effect."
      );
      setShowCriticalEffect(true);
      const newAnimation = { id: Date.now(), amount: amount };
      setCriticalHitAnimations((prev) => [...prev, newAnimation]);

      setTimeout(() => {
        setShowCriticalEffect(false);
      }, 1000); // Dauer des Effekts in ms (auf 1 Sekunde erhöht)
      setTimeout(() => {
        setCriticalHitAnimations((prev) =>
          prev.filter((anim) => anim.id !== newAnimation.id)
        );
      }, 1500); // Dauer der Text-Animation (muss zur CSS Animation passen)
    }
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

  // Leaderboard-Checkpoint-Tracking im Local Storage
  const LEADERBOARD_CHECKPOINTS_KEY = "leaderboardCheckpointsReached";

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
      localStorage.setItem(
        LEADERBOARD_CHECKPOINTS_KEY,
        JSON.stringify(reached)
      );
    }
  }

  const [leaderboardName, setLeaderboardName] = useState("");
  // const [checkpointReached, setCheckpointReached] = useState(false);
  const [showLeaderboardCongrats, setShowLeaderboardCongrats] = useState(false);
  const [leaderboardSubmitted, setLeaderboardSubmitted] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);

  // Leaderboard-Checkpoint-Modal nur zeigen, wenn dieser Checkpoint noch nicht im Local Storage ist
  useEffect(() => {
    const reachedCheckpointsInStorage = getReachedCheckpointsFromStorage();

    // Finde den höchsten Checkpoint, der erreicht wurde UND noch nicht im Local Storage ist.
    // Iteriere rückwärts, um den höchsten zuerst zu finden.
    const newTargetCheckpoint = CHECKPOINTS.slice()
      .reverse()
      .find(
        (cp) =>
          money >= cp.value && !reachedCheckpointsInStorage.includes(cp.id)
      );

    if (newTargetCheckpoint) {
      // Zeige das Modal, wenn wir einen neuen Ziel-Checkpoint gefunden haben,
      // der sich von dem aktuell im Modal angezeigten unterscheidet,
      // oder wenn aktuell kein Modal für einen Checkpoint angezeigt wird.
      if (
        !currentCheckpoint ||
        currentCheckpoint.id !== newTargetCheckpoint.id
      ) {
        setCurrentCheckpoint(newTargetCheckpoint);
        // Optional: Name aus Local Storage vorbefüllen, falls vorhanden
        setLeaderboardName(localStorage.getItem("leaderboardName") || "");
        setShowLeaderboardCongrats(true);
        setLeaderboardSubmitted(false); // Wichtig: Zurücksetzen für den neuen Checkpoint
      }
    }
    // Die Abhängigkeiten stellen sicher, dass der Effekt neu bewertet wird, wenn sich das Geld ändert,
    // der aktuelle Checkpoint (für den das Modal ggf. offen ist) sich ändert,
    // oder der Status des Modals/der Einreichung sich ändert.
  }, [money, currentCheckpoint, showLeaderboardCongrats, leaderboardSubmitted]);

  // Nach Submit oder "Maybe later" Checkpoint im Local Storage speichern und Spielstand sichern
  const handleLeaderboardCongratsClose = async () => {
    // Diese Funktion wird jetzt hauptsächlich für den "Maybe later"-Button verwendet.
    // Wenn "Submit" geklickt wurde, kümmert sich handleLeaderboardSubmit um Speicherung und Schließen.
    if (currentCheckpoint && !leaderboardSubmitted) {
      // Nur hinzufügen, wenn "Maybe later" geklickt wurde
      addCheckpointToStorage(currentCheckpoint.id);
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
        console.error("Cloud save failed:", e);
      }
    } else if (typeof saveGame === "function") {
      saveGame();
    }
    setShowLeaderboardCongrats(false);
    // leaderboardSubmitted bleibt true, wenn es so war, bis ein neuer Checkpoint anvisiert wird.
  };

  // --- Environment detection for leaderboard flagging ---
  const [environment, setEnvironment] = useState("production");
  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes("beta")) setEnvironment("beta");
    else if (hostname.includes("alpha")) setEnvironment("alpha");
    else if (hostname === "localhost" || hostname === "127.0.0.1")
      setEnvironment("localhost");
    else setEnvironment("production");
  }, []);

  // Leaderboard Submission (analog zu useLeaderboardSubmit, aber immer aktiv)
  const handleLeaderboardSubmit = async () => {
    if (!leaderboardName.trim() || !currentCheckpoint) return;

    // Firestore Submission wie in useLeaderboardSubmit.js
    const { addDoc, collection } = await import("firebase/firestore");
    const { db } = await import("../../firebase");
    // Flag für Test/Alpha-Umgebung
    const isTestOrAlpha =
      environment === "localhost" || environment === "alpha";

    const dataToSubmit = {
      name: leaderboardName.trim(),
      playtime: playTime,
      goal: currentCheckpoint.id, // Die ID des erreichten Ziels hinzufügen
      clicks: floatingClicks,
      activePlaytime: activePlayTime, // Add activePlayTime here
      timestamp: Date.now(),
      checkpointDate: new Date().toISOString(), // NEU: Datum als ISO-String
      flagged: isTestOrAlpha,
      version: APP_VERSION,
      prestigeCount: prestigeCount,
    };

    if (isTestOrAlpha) {
      dataToSubmit.flaggedReason = environment;
    }

    await addDoc(collection(db, "leaderboard"), dataToSubmit);
    setLeaderboardSubmitted(true);
    // Save game state (cloud or local)
    if (cloudSaveMode) {
      // Die Logik zum Speichern in der Cloud bleibt hier gleich
      try {
        // Force new UUID if missing (first cloud save)
        if (!cloudUuid) {
          await exportToCloud({ ...gameState });
        } else {
          await exportToCloud({ ...gameState });
        }
      } catch (e) {
        // Optionally show error to user
        console.error("Cloud save failed:", e);
      }
    } else if (typeof saveGame === "function") {
      saveGame();
    }
    addCheckpointToStorage(currentCheckpoint.id); // Bei erfolgreichem Submit auch im Storage vermerken
    setShowLeaderboardCongrats(false); // Modal direkt schließen
  };

  // Prestige-Button: Sichtbarkeit zentral prüfen und setzen
  useEffect(() => {
    if (
      !prestigeButtonEverVisible &&
      (money >= gameConfig.prestige.minMoneyForModalButton || prestigeCount > 0)
    ) {
      setPrestigeButtonEverVisible(true);
    }
    // Niemals wieder auf false setzen!
  }, [
    money,
    prestigeCount,
    prestigeButtonEverVisible,
    setPrestigeButtonEverVisible,
  ]);

  // Synchronisiere nach jedem Render, falls Bedingungen erfüllt sind
  useEffect(() => {
    if (uiProgress.gameStarted && money >= 10 && !clickerButtonsUnlocked) {
      setClickerButtonsUnlocked(true);
    }
  }, [uiProgress.gameStarted, money, clickerButtonsUnlocked]);

  useEffect(() => {
    if (
      uiProgress.gameStarted &&
      money >= 10 &&
      allButtonsClicked &&
      !upgradeTabsUnlocked
    ) {
      setUpgradeTabsUnlocked(true);
    }
  }, [uiProgress.gameStarted, money, allButtonsClicked, upgradeTabsUnlocked]);

  // State and effect for WelcomeBackModal
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);
  useEffect(() => {
    console.log(
      "[ClickerGame] WelcomeBackModal effect. lastInactiveDuration:",
      lastInactiveDuration,
      "uiProgress.gameStarted:",
      uiProgress.gameStarted
    );
    // Show modal if inactive duration (from reload or tab hide) is more than 5 seconds
    if (lastInactiveDuration > 5 && uiProgress.gameStarted) {
      setShowWelcomeBackModal(true);
    }
  }, [lastInactiveDuration, uiProgress.gameStarted]);

  // Registriere die saveGame Funktion beim übergeordneten App-Component
  useEffect(() => {
    if (
      registerSaveGameHandler &&
      typeof registerSaveGameHandler === "function"
    ) {
      registerSaveGameHandler(saveGame);
    }
  }, [saveGame, registerSaveGameHandler]);

  // Listener für das Event, das bei manipulierten Speicherdaten ausgelöst wird
  // und Freischaltung des "Cheater"-Achievements
  useEffect(() => {
    const handleTampering = (event) => {
      // Die Alert-Box wird weiterhin von App.js angezeigt.
      // Hier schalten wir nur das Achievement frei.
      unlockSpecificAchievementById("cheater");
    };
    window.addEventListener("gamestateTampered", handleTampering);
    return () => {
      window.removeEventListener("gamestateTampered", handleTampering);
    };
  }, [unlockSpecificAchievementById]);
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
            setNotificationQueue((prev) => prev.slice(1));
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
          manualMoneyPerSecond={manualMoneyPerSecond}
          floatingClicks={floatingClicks}
          gameState={gameState}
          onImportCloudSave={loadGameState}
          achievements={achievements}
          hasAnyAchievement={hasAnyAchievement}
          activePlayTime={activePlayTime}
          inactivePlayTime={inactivePlayTime}
          musicEnabled={musicEnabled}
          setMusicEnabled={setMusicEnabled}
          soundEffectsEnabled={soundEffectsEnabled}
          setSoundEffectsEnabled={setSoundEffectsEnabled}
          prestigeShares={prestigeShares}
          prestigeCount={prestigeCount}
          currentRunShares={currentRunShares}
          prestigeGame={prestigeGame}
          prestigeBonusMultiplier={prestigeBonusMultiplier}
          canPrestige={canPrestige}
          buyQuantity={buyQuantity}
          toggleBuyQuantity={toggleBuyQuantity}
          gameConfig={gameConfig}
          environment={environment}
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
              You have reached a milestone (
              {currentCheckpoint ? currentCheckpoint.label : "a goal"})!
              <br />
              Do you want to enter your name for the leaderboard?
            </p>
            <input
              className="modal-input"
              type="text"
              maxLength={18}
              placeholder="Your name for the leaderboard"
              value={leaderboardName}
              onChange={(e) => setLeaderboardName(e.target.value)}
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
            buyQuantity={buyQuantity}
            globalMultiplierLevel={globalMultiplierLevel}
            easyMode={easyMode}
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
            totalMoneyPerSecond={totalMoneyPerSecond}
            unlockInvestmentCost={unlockInvestmentCost}
            investmentCostMultiplier={investmentCostMultiplier}
            offlineEarningsLevel={offlineEarningsLevel}
            currentOfflineEarningsFactor={currentOfflineEarningsFactor}
            buyOfflineEarningsLevel={buyOfflineEarningsLevel}
            offlineEarningsLevelCost={offlineEarningsLevelCost}
            criticalClickChanceLevel={criticalClickChanceLevel}
            currentCriticalClickChance={currentCriticalClickChance}
            criticalClickChanceCost={criticalClickChanceCost}
            buyCriticalClickChanceLevel={buyCriticalClickChanceLevel}
            floatingClickValueLevel={floatingClickValueLevel}
            floatingClickValueMultiplier={floatingClickValueMultiplier}
            buyFloatingClickValue={buyFloatingClickValue}
            currentFloatingClickValue={currentFloatingClickValue}
            onInvestmentBoosted={handleInvestmentBoost}
            soundEffectsEnabled={soundEffectsEnabled}
            craftingItems={craftingItems}
            buyCraftingItem={buyCraftingItem}
            rawMaterials={rawMaterials}
            setRawMaterials={setRawMaterials}
            buyMaterial={buyMaterial}
            resourcePurchaseCounts={resourcePurchaseCounts}
            setResourcePurchaseCounts={setResourcePurchaseCounts}
            // Crafting unlock props
            isCraftingUnlocked={isCraftingUnlocked}
            unlockCrafting={unlockCrafting}
            accumulatedPrestigeShares={prestigeShares}
            autoBuyValueUpgradeEnabled={autoBuyValueUpgradeEnabled}
            setAutoBuyValueUpgradeEnabled={setAutoBuyValueUpgradeEnabled}
            autoBuyCooldownUpgradeEnabled={autoBuyCooldownUpgradeEnabled}
            setAutoBuyCooldownUpgradeEnabled={setAutoBuyCooldownUpgradeEnabled}
          />
        </div>
      )}

      {/* FloatingClickButton immer sichtbar */}
      <FloatingClickButton
        onClick={handleFloatingClick}
        centerMode={floatingCenterMode}
        isCritical={showCriticalEffect}
        criticalHitAnimations={criticalHitAnimations}
        floatingClickValue={currentFloatingClickValue}
      />
    </div>
  );
}