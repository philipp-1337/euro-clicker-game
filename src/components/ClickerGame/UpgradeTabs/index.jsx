import { gameConfig } from '@constants/gameConfig';
import { calculateButtonValueMultiplier, calculateCooldownReductionPercentage } from '@utils/calculators';

export default function UpgradeTabs({
  activeTab,
  setActiveTab,
  money,
  buttons,
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
  managers,
  buyManager,
  managerCosts,
  investments,
  buyInvestment,
  isInvestmentUnlocked,
  unlockInvestments,
  totalIncomePerSecond,
  totalMoneyPerSecond,
  unlockInvestmentCost,
  investmentCostMultiplier,
  offlineEarningsLevel,      // New
  currentOfflineEarningsFactor, // New
  buyOfflineEarningsLevel,     // New
  offlineEarningsLevelCost,   // New
  criticalClickChanceLevel,      // New
  currentCriticalClickChance, // New
  buyCriticalClickChanceLevel,     // New
  criticalClickChanceCost,   // New
  onInvestmentBoosted, // New prop for handling investment boosts
  soundEffectsEnabled, // New prop
  easyMode, // Added from ClickerGame
  buyQuantity, // Added from ClickerGame
  floatingClickValueLevel,
  floatingClickValueMultiplier,
  buyFloatingClickValue,
  currentFloatingClickValue,
  autoBuyValueUpgradeEnabled,
  setAutoBuyValueUpgradeEnabled,
  autoBuyCooldownUpgradeEnabled,
  setAutoBuyCooldownUpgradeEnabled,
  craftingItems, // New prop for crafting items
  buyCraftingItem, // New prop for buying crafting items
  rawMaterials,
  setRawMaterials,
  buyMaterial,
  resourcePurchaseCounts,
  // Crafting unlock props
  isCraftingUnlocked,
  unlockCrafting,
  accumulatedPrestigeShares,
  autoBuyerUnlocked,
  buyAutoBuyerUnlock,
  autoBuyerUnlockCost,
  cooldownAutoBuyerUnlocked,
  buyCooldownAutoBuyerUnlock,
  cooldownAutoBuyerUnlockCost
}) {
  // Berechnete Werte mit ausgelagerten Funktionen
  const valueMultipliers = valueUpgradeLevels.map((_, i) => 
    calculateButtonValueMultiplier(buttons[i].value, buttons[i].baseValue, globalMultiplier)
  );
  
  const cooldownReductions = cooldownUpgradeLevels.map((_, i) => 
    calculateCooldownReductionPercentage(buttons[i].cooldownTime, buttons[i].baseCooldownTime)
  );

  return (
    <>
      <div className="upgrade-tabs">
      <div className="upgrade-tabs-inner">
        {gameConfig.ui.tabs.map((tab) => (
          (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          )
        ))}
      </div>
    </div>

    {gameConfig.ui.tabs.map(tab => (
      activeTab === tab.id && (
  <tab.component
          key={tab.id}
          money={money}
          buttons={buttons}
          valueUpgradeLevels={tab.id === 'basic' ? valueUpgradeLevels : undefined}
          cooldownUpgradeLevels={tab.id === 'basic' ? cooldownUpgradeLevels : undefined}
          easyMode={easyMode}
          buyQuantity={buyQuantity}
          valueUpgradeCosts={valueUpgradeCosts}
          cooldownUpgradeCosts={cooldownUpgradeCosts}
          buyValueUpgrade={buyValueUpgrade}
          buyCooldownUpgrade={buyCooldownUpgrade}
          autoBuyValueUpgradeEnabled={autoBuyValueUpgradeEnabled}
          setAutoBuyValueUpgradeEnabled={setAutoBuyValueUpgradeEnabled}
          autoBuyCooldownUpgradeEnabled={autoBuyCooldownUpgradeEnabled}
          setAutoBuyCooldownUpgradeEnabled={setAutoBuyCooldownUpgradeEnabled}
          autoBuyerUnlocked={autoBuyerUnlocked}
          buyAutoBuyerUnlock={buyAutoBuyerUnlock}
          autoBuyerUnlockCost={autoBuyerUnlockCost}
          cooldownAutoBuyerUnlocked={cooldownAutoBuyerUnlocked}
          buyCooldownAutoBuyerUnlock={buyCooldownAutoBuyerUnlock}
          cooldownAutoBuyerUnlockCost={cooldownAutoBuyerUnlockCost}
          globalMultiplier={globalMultiplier}
          globalMultiplierLevel={globalMultiplierLevel}
          globalMultiplierCost={globalMultiplierCost}
          buyGlobalMultiplier={buyGlobalMultiplier}
          managers={managers}
          buyManager={buyManager}
          managerCosts={managerCosts}
          investments={investments}
          buyInvestment={buyInvestment}
          valueMultipliers={valueMultipliers}
          cooldownReductions={cooldownReductions}
          isInvestmentUnlocked={isInvestmentUnlocked}
          unlockInvestments={tab.id === 'investments' ? unlockInvestments : undefined}
          unlockInvestmentCost={tab.id === 'investments' ? unlockInvestmentCost : undefined}
          totalIncomePerSecond={tab.id === 'investments' ? totalIncomePerSecond : undefined}
          globalPriceDecrease={globalPriceDecrease}
          globalPriceDecreaseLevel={globalPriceDecreaseLevel}
          globalPriceDecreaseCost={globalPriceDecreaseCost}
          buyGlobalPriceDecrease={buyGlobalPriceDecrease}
          totalMoneyPerSecond={totalMoneyPerSecond}
          investmentCostMultiplier={investmentCostMultiplier}
          offlineEarningsLevel={offlineEarningsLevel}
          currentOfflineEarningsFactor={currentOfflineEarningsFactor}
          buyOfflineEarningsLevel={buyOfflineEarningsLevel}
          offlineEarningsLevelCost={offlineEarningsLevelCost}
          criticalClickChanceLevel={criticalClickChanceLevel}
          currentCriticalClickChance={currentCriticalClickChance}
          buyCriticalClickChanceLevel={buyCriticalClickChanceLevel}
          criticalClickChanceCost={criticalClickChanceCost}
          onInvestmentBoosted={tab.id === 'investments' ? onInvestmentBoosted : undefined}
          soundEffectsEnabled={tab.id === 'basic' ? soundEffectsEnabled : undefined}
          floatingClickValueLevel={floatingClickValueLevel}
          floatingClickValueMultiplier={floatingClickValueMultiplier}
          buyFloatingClickValue={buyFloatingClickValue}
          currentFloatingClickValue={currentFloatingClickValue}
          isCraftingUnlocked={tab.id === 'crafting' ? isCraftingUnlocked : undefined}
          unlockCrafting={tab.id === 'crafting' ? unlockCrafting : undefined}
          unlockCraftingCost={tab.id === 'crafting' ? gameConfig.unlockCraftingCost : undefined}
          accumulatedPrestigeShares={tab.id === 'crafting' ? accumulatedPrestigeShares : undefined}
          craftingItems={tab.id === 'crafting' ? craftingItems : undefined}
          buyCraftingItem={tab.id === 'crafting' ? buyCraftingItem : undefined}
          rawMaterials={tab.id === 'crafting' ? rawMaterials : undefined}
          setRawMaterials={tab.id === 'crafting' ? setRawMaterials : undefined}
          resourcePurchaseCounts={tab.id === 'crafting' ? resourcePurchaseCounts : undefined}
          {...(tab.id === 'crafting' ? { buyMaterial } : {})}
        />
      )
    ))}
  </>
  );
}
