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
  satisfaction,
  dissatisfaction,
  stateBuildings,
  buyStateBuilding,
  totalMoneyPerSecond,
  unlockInvestmentCost,
  isStateUnlocked,
  unlockState,
  unlockStateCost,
  investmentCostMultiplier,
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
          ((tab.id !== 'investments' || isInvestmentUnlocked) &&
           (tab.id !== 'state' || isStateUnlocked)) && (
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
          investments={investments}
          buyInvestment={buyInvestment}
          valueMultipliers={valueMultipliers}
          cooldownReductions={cooldownReductions}
          isInvestmentUnlocked={isInvestmentUnlocked}
          unlockInvestments={unlockInvestments}
          totalIncomePerSecond={tab.id === 'investments' ? totalIncomePerSecond : undefined}
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
          investmentCostMultiplier={investmentCostMultiplier}
        />
      )
    ))}
  </>
  );
}