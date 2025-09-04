import { useState, useEffect } from 'react';
import { useUiProgress } from '@hooks/useUiProgress';
import GameHeader from '@components/GameHeader';
import ClickerButtons from './ClickerButtons';
import FloatingClickButton from './FloatingClickButton';
import BottomTabMenu from './BottomTabMenu';
import BasicUpgrades from './UpgradeTabs/BasicUpgrades';
import Investments from './UpgradeTabs/Investments';
import Crafting from './UpgradeTabs/Crafting';
import PremiumUpgrades from './UpgradeTabs/PremiumUpgrades';
import useGameCore from '@hooks/useGameCore';
import { useAchievements } from '@hooks/useAchievements';
import useAchievementNotifications from '@hooks/useAchievementNotifications';
import { gameConfig } from '@constants/gameConfig'; // Import gameConfig
import AchievementNotification from './AchievementNotification';
import { CHECKPOINTS } from '@constants/gameConfig';
import WelcomeBackModal from '@components/WelcomeBackModal/WelcomeBackModal'; // Import the new modal
import useCloudSave from '@hooks/useCloudSave';
import { APP_VERSION } from '../../version';
import AutoBuyerModal from '@components/AutoBuyerModal/AutoBuyerModal';
import { formatNumber } from '@utils/calculators';

export default function ClickerGame({
  easyMode = false,
  onEasyModeToggle,
  registerSaveGameHandler,
  setMusicPlaying,
  musicEnabled, // New
  setMusicEnabled, // New
  soundEffectsEnabled, // New
  setSoundEffectsEnabled // New
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const {
    uiProgress,
    setGameStarted,
    setButtonClicked,
    floatingClicks,
    incrementFloatingClicks,
    prestigeButtonEverVisible,
    setPrestigeButtonEverVisible,
  } = useUiProgress();

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
    offlineEarningsLevel,
    currentOfflineEarningsFactor,
    offlineEarningsLevelCost,
    buyOfflineEarningsLevel,
    gameState,
    criticalClickChanceLevel,
    currentCriticalClickChance,
    criticalClickChanceCost,
    buyCriticalClickChanceLevel,
    loadGameState,
    activePlayTime,
    inactivePlayTime,
    lastInactiveDuration,
    clearLastInactiveDuration,
    calculatedOfflineEarnings,
    claimOfflineEarnings,
    handleInvestmentBoost,
    prestigeShares,
    prestigeCount,
    currentRunShares,
    prestigeGame,
    prestigeBonusMultiplier,
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
    // setResourcePurchaseCounts,
    isCraftingUnlocked,
    setIsCraftingUnlocked,
    autoBuyValueUpgradeEnabled,
    setAutoBuyValueUpgradeEnabled,
    autoBuyCooldownUpgradeEnabled,
    setAutoBuyCooldownUpgradeEnabled,
    autoBuyerUnlocked,
    buyAutoBuyerUnlock,
    autoBuyerUnlockCost,
    cooldownAutoBuyerUnlocked,
    buyCooldownAutoBuyerUnlock,
    cooldownAutoBuyerUnlockCost,
    autoBuyerInterval,
    setAutoBuyerInterval,
    autoBuyerBuffer,
    setAutoBuyerBuffer,
    isAutoBuyerModalOpen,
    setIsAutoBuyerModalOpen,
    criticalHitMultiplier,
    autoBuyGlobalMultiplierEnabled,
    setAutoBuyGlobalMultiplierEnabled,
    autoBuyGlobalPriceDecreaseEnabled,
    setAutoBuyGlobalPriceDecreaseEnabled,
    globalMultiplierAutoBuyerUnlocked,
    buyGlobalMultiplierAutoBuyerUnlock,
    globalMultiplierAutoBuyerUnlockCost,
    globalPriceDecreaseAutoBuyerUnlocked,
    buyGlobalPriceDecreaseAutoBuyerUnlock,
    globalPriceDecreaseAutoBuyerUnlockCost,
  } = useGameCore(easyMode, soundEffectsEnabled, buyQuantity);

  const unlockCrafting = () => {
    const unlockCost = gameConfig.unlockCraftingCost;
    if (!isCraftingUnlocked && prestigeShares >= 1 && money >= unlockCost) {
      if (typeof setMoney === "function") {
        setMoney((prev) => prev - unlockCost);
      }
      if (typeof setIsCraftingUnlocked === "function") {
        setIsCraftingUnlocked(true);
      }
    }
  };

  const {
    achievements,
    unlockedAchievements,
    clearUnlockedAchievements,
    unlockSpecificAchievementById,
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

  const { exportToCloud, cloudUuid } = useCloudSave();
  const cloudSaveMode = uiProgress.cloudSaveMode;

  const [musicStarted, setMusicStarted] = useState(false);
  const [showCriticalEffect, setShowCriticalEffect] = useState(false);
  const [criticalHitAnimations, setCriticalHitAnimations] = useState([]);

  const handleFloatingClick = () => {
    if (!uiProgress.gameStarted) setGameStarted();
    incrementFloatingClicks();
    if (
      musicEnabled &&
      !musicStarted &&
      typeof setMusicPlaying === "function"
    ) {
      setMusicPlaying(true);
      setMusicStarted(true);
    }
    const { isCritical, amount } = addQuickMoney();
    if (isCritical) {
      setShowCriticalEffect(true);
      const newAnimation = { id: Date.now(), amount: amount };
      setCriticalHitAnimations((prev) => [...prev, newAnimation]);

      setTimeout(() => {
        setShowCriticalEffect(false);
      }, 1000);
      setTimeout(() => {
        setCriticalHitAnimations((prev) =>
          prev.filter((anim) => anim.id !== newAnimation.id)
        );
      }, 1500);
    }
  };

  const handleClickerButton = (index) => {
    setButtonClicked(index);
    handleClick(index);
  };

  const allButtonsClicked = uiProgress.clickedButtons.every(Boolean);
  const floatingCenterMode = floatingClicks < 1;

  const [clickerButtonsUnlocked, setClickerButtonsUnlocked] = useState(
    uiProgress.gameStarted && money >= 10
  );
  const [upgradeTabsUnlocked, setUpgradeTabsUnlocked] = useState(
    uiProgress.gameStarted && money >= 10 && allButtonsClicked
  );

  const LEADERBOARD_CHECKPOINTS_KEY = "leaderboardCheckpointsReached";

  function getReachedCheckpointsFromStorage() {
    try {
      const stored = localStorage.getItem(LEADERBOARD_CHECKPOINTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
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
  const [showLeaderboardCongrats, setShowLeaderboardCongrats] = useState(false);
  const [leaderboardSubmitted, setLeaderboardSubmitted] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);

  useEffect(() => {
    const reachedCheckpointsInStorage = getReachedCheckpointsFromStorage();
    const newTargetCheckpoint = CHECKPOINTS.slice()
      .reverse()
      .find(
        (cp) =>
          money >= cp.value && !reachedCheckpointsInStorage.includes(cp.id)
      );

    if (newTargetCheckpoint) {
      if (
        !currentCheckpoint ||
        currentCheckpoint.id !== newTargetCheckpoint.id
      ) {
        setCurrentCheckpoint(newTargetCheckpoint);
        setLeaderboardName(localStorage.getItem("leaderboardName") || "");
        setShowLeaderboardCongrats(true);
        setLeaderboardSubmitted(false);
      }
    }
  }, [money, currentCheckpoint, showLeaderboardCongrats, leaderboardSubmitted]);

  const handleLeaderboardCongratsClose = async () => {
    if (currentCheckpoint && !leaderboardSubmitted) {
      addCheckpointToStorage(currentCheckpoint.id);
    }
    if (cloudSaveMode) {
      try {
        if (!cloudUuid) {
          await exportToCloud({ ...gameState });
        } else {
          await exportToCloud({ ...gameState });
        }
      } catch (e) {
        console.error("Cloud save failed:", e);
      }
    } else if (typeof saveGame === "function") {
      saveGame();
    }
    setShowLeaderboardCongrats(false);
  };

  const [environment, setEnvironment] = useState("production");
  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes("beta")) setEnvironment("beta");
    else if (hostname.includes("alpha")) setEnvironment("alpha");
    else if (hostname === "localhost" || hostname === "127.0.0.1")
      setEnvironment("localhost");
    else setEnvironment("production");
  }, []);

  const handleLeaderboardSubmit = async () => {
    if (!leaderboardName.trim() || !currentCheckpoint) return;

    const { addDoc, collection } = await import("firebase/firestore");
    const { db } = await import("../../firebase");
    const isTestOrAlpha =
      environment === "localhost" || environment === "alpha";

    const dataToSubmit = {
      name: leaderboardName.trim(),
      playtime: playTime,
      goal: currentCheckpoint.id,
      clicks: floatingClicks,
      activePlaytime: activePlayTime,
      timestamp: Date.now(),
      checkpointDate: new Date().toISOString(),
      flagged: isTestOrAlpha,
      version: APP_VERSION,
      prestigeCount: prestigeCount,
    };

    if (isTestOrAlpha) {
      dataToSubmit.flaggedReason = environment;
    }

    await addDoc(collection(db, "leaderboard"), dataToSubmit);
    setLeaderboardSubmitted(true);
    if (cloudSaveMode) {
      try {
        if (!cloudUuid) {
          await exportToCloud({ ...gameState });
        } else {
          await exportToCloud({ ...gameState });
        }
      } catch (e) {
        console.error("Cloud save failed:", e);
      }
    } else if (typeof saveGame === "function") {
      saveGame();
    }
    addCheckpointToStorage(currentCheckpoint.id);
    setShowLeaderboardCongrats(false);
  };

  useEffect(() => {
    if (
      !prestigeButtonEverVisible &&
      (money >= gameConfig.prestige.minMoneyForModalButton || prestigeCount > 0)
    ) {
      setPrestigeButtonEverVisible(true);
    }
  }, [
    money,
    prestigeCount,
    prestigeButtonEverVisible,
    setPrestigeButtonEverVisible,
  ]);

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

  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);
  useEffect(() => {
    if (lastInactiveDuration > 5 && uiProgress.gameStarted) {
      setShowWelcomeBackModal(true);
    }
  }, [lastInactiveDuration, uiProgress.gameStarted]);

  useEffect(() => {
    if (
      registerSaveGameHandler &&
      typeof registerSaveGameHandler === "function"
    ) {
      registerSaveGameHandler(saveGame);
    }
  }, [saveGame, registerSaveGameHandler]);

  useEffect(() => {
  const handleTampering = () => {
      unlockSpecificAchievementById("cheater");
    };
    window.addEventListener("gamestateTampered", handleTampering);
    return () => {
      window.removeEventListener("gamestateTampered", handleTampering);
    };
  }, [unlockSpecificAchievementById]);

  return (
    <div className="game-container">
      {showWelcomeBackModal && (
        <WelcomeBackModal
          show={showWelcomeBackModal}
          duration={lastInactiveDuration}
          offlineEarnings={calculatedOfflineEarnings}
          isOfflineEarningsUnlocked={offlineEarningsLevel > 0}
          onClose={() => {
            setShowWelcomeBackModal(false);
            clearLastInactiveDuration();
            claimOfflineEarnings();
          }}
        />
      )}

      <AutoBuyerModal
        show={isAutoBuyerModalOpen}
        onClose={() => setIsAutoBuyerModalOpen(false)}
        autoBuyerInterval={autoBuyerInterval}
        setAutoBuyerInterval={setAutoBuyerInterval}
        autoBuyerBuffer={autoBuyerBuffer}
        setAutoBuyerBuffer={setAutoBuyerBuffer}
        formatNumber={formatNumber}
        autoBuyValueUpgradeEnabled={autoBuyValueUpgradeEnabled}
        setAutoBuyValueUpgradeEnabled={setAutoBuyValueUpgradeEnabled}
        autoBuyCooldownUpgradeEnabled={autoBuyCooldownUpgradeEnabled}
        setAutoBuyCooldownUpgradeEnabled={setAutoBuyCooldownUpgradeEnabled}
        autoBuyerUnlocked={autoBuyerUnlocked}
        cooldownAutoBuyerUnlocked={cooldownAutoBuyerUnlocked}
        autoBuyGlobalMultiplierEnabled={autoBuyGlobalMultiplierEnabled}
        setAutoBuyGlobalMultiplierEnabled={setAutoBuyGlobalMultiplierEnabled}
        globalMultiplierAutoBuyerUnlocked={globalMultiplierAutoBuyerUnlocked}
        autoBuyGlobalPriceDecreaseEnabled={autoBuyGlobalPriceDecreaseEnabled}
        setAutoBuyGlobalPriceDecreaseEnabled={setAutoBuyGlobalPriceDecreaseEnabled}
        globalPriceDecreaseAutoBuyerUnlocked={globalPriceDecreaseAutoBuyerUnlocked}
      />

      {showAchievement && (
        <AchievementNotification
          achievement={showAchievement}
          onClose={() => {
            setShowAchievement(null);
            setNotificationQueue((prev) => prev.slice(1));
          }}
        />
      )}
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
          autoBuyerUnlocked={autoBuyerUnlocked}
          cooldownAutoBuyerUnlocked={cooldownAutoBuyerUnlocked}
          globalMultiplierAutoBuyerUnlocked={globalMultiplierAutoBuyerUnlocked}
          globalPriceDecreaseAutoBuyerUnlocked={globalPriceDecreaseAutoBuyerUnlocked}
          setIsAutoBuyerModalOpen={setIsAutoBuyerModalOpen}
          autoBuyValueUpgradeEnabled={autoBuyValueUpgradeEnabled}
          autoBuyCooldownUpgradeEnabled={autoBuyCooldownUpgradeEnabled}
          autoBuyGlobalMultiplierEnabled={autoBuyGlobalMultiplierEnabled}
          autoBuyGlobalPriceDecreaseEnabled={autoBuyGlobalPriceDecreaseEnabled}
        />
      )}

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

      {uiProgress.gameStarted && upgradeTabsUnlocked && (
        <>
          <div style={{ paddingBottom: '64px' }}>
            {activeTab === 'basic' && (
              <BasicUpgrades
                money={money}
                buttons={buttons}
                valueUpgradeLevels={valueUpgradeLevels}
                cooldownUpgradeLevels={cooldownUpgradeLevels}
                valueUpgradeCosts={valueUpgradeCosts}
                cooldownUpgradeCosts={cooldownUpgradeCosts}
                buyValueUpgrade={buyValueUpgrade}
                buyCooldownUpgrade={buyCooldownUpgrade}
                managers={managers}
                buyManager={buyManager}
                managerCosts={managerCosts}
                valueMultipliers={valueMultipliers}
                cooldownReductions={cooldownReductions}
                soundEffectsEnabled={soundEffectsEnabled}
                buyQuantity={buyQuantity}
                easyMode={easyMode}
                globalPriceDecrease={globalPriceDecrease}
              />
            )}
            {activeTab === 'investments' && (
              <Investments
                money={money}
                investments={investments}
                buyInvestment={buyInvestment}
                investmentCostMultiplier={investmentCostMultiplier}
                onInvestmentBoosted={handleInvestmentBoost}
                isInvestmentUnlocked={isInvestmentUnlocked}
                unlockInvestments={unlockInvestments}
                unlockInvestmentCost={unlockInvestmentCost}
                totalIncomePerSecond={totalIncomePerSecond}
              />
            )}
            {activeTab === 'crafting' && (
              <Crafting
                money={money}
                rawMaterials={rawMaterials}
                buyCraftingItem={buyCraftingItem}
                buyMaterial={buyMaterial}
                craftingItems={craftingItems}
                resourcePurchaseCounts={resourcePurchaseCounts}
                easyMode={easyMode}
                buyQuantity={buyQuantity}
                isCraftingUnlocked={isCraftingUnlocked}
                unlockCrafting={unlockCrafting}
                unlockCraftingCost={gameConfig.unlockCraftingCost}
                accumulatedPrestigeShares={prestigeShares}
              />
            )}
            {activeTab === 'premium' && (
              <PremiumUpgrades
                money={money}
                globalMultiplier={globalMultiplier}
                globalMultiplierLevel={globalMultiplierLevel}
                globalPriceDecrease={globalPriceDecrease}
                globalPriceDecreaseLevel={globalPriceDecreaseLevel}
                buyGlobalPriceDecrease={buyGlobalPriceDecrease}
                buyGlobalMultiplier={buyGlobalMultiplier}
                offlineEarningsLevel={offlineEarningsLevel}
                currentOfflineEarningsFactor={currentOfflineEarningsFactor}
                buyOfflineEarningsLevel={buyOfflineEarningsLevel}
                criticalClickChanceLevel={criticalClickChanceLevel}
                currentCriticalClickChance={currentCriticalClickChance}
                buyCriticalClickChanceLevel={buyCriticalClickChanceLevel}
                criticalHitMultiplier={criticalHitMultiplier}
                buyQuantity={buyQuantity}
                easyMode={easyMode}
                floatingClickValueLevel={floatingClickValueLevel}
                floatingClickValueMultiplier={floatingClickValueMultiplier}
                buyFloatingClickValue={buyFloatingClickValue}
                autoBuyerUnlocked={autoBuyerUnlocked}
                buyAutoBuyerUnlock={buyAutoBuyerUnlock}
                autoBuyerUnlockCost={autoBuyerUnlockCost}
                cooldownAutoBuyerUnlocked={cooldownAutoBuyerUnlocked}
                buyCooldownAutoBuyerUnlock={buyCooldownAutoBuyerUnlock}
                cooldownAutoBuyerUnlockCost={cooldownAutoBuyerUnlockCost}
                globalMultiplierAutoBuyerUnlocked={globalMultiplierAutoBuyerUnlocked}
                buyGlobalMultiplierAutoBuyerUnlock={buyGlobalMultiplierAutoBuyerUnlock}
                globalMultiplierAutoBuyerUnlockCost={globalMultiplierAutoBuyerUnlockCost}
                globalPriceDecreaseAutoBuyerUnlocked={globalPriceDecreaseAutoBuyerUnlocked}
                buyGlobalPriceDecreaseAutoBuyerUnlock={buyGlobalPriceDecreaseAutoBuyerUnlock}
                globalPriceDecreaseAutoBuyerUnlockCost={globalPriceDecreaseAutoBuyerUnlockCost}
              />
            )}
          </div>
          <BottomTabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}

      <FloatingClickButton
        onClick={handleFloatingClick}
        centerMode={floatingCenterMode}
        isCritical={showCriticalEffect}
        criticalHitAnimations={criticalHitAnimations}
        floatingClickValue={currentFloatingClickValue}
        bottomOffset={64} // Höhe des BottomTabMenus
      />
    </div>
  );
}
