import BasicUpgrades from './BasicUpgrades';
import PremiumUpgrades from './PremiumUpgrades';
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
  offlineEarningsLevel,
  globalMultiplierCost,
  offlineEarningsCost,
  buyGlobalMultiplier,
  buyOfflineEarnings
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
        {gameConfig.ui.tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === 'basic' && (
        <BasicUpgrades 
          buttons={buttons}
          valueUpgradeCosts={valueUpgradeCosts}
          cooldownUpgradeCosts={cooldownUpgradeCosts}
          money={money}
          buyValueUpgrade={buyValueUpgrade}
          buyCooldownUpgrade={buyCooldownUpgrade}
          valueMultipliers={valueMultipliers}
          cooldownReductions={cooldownReductions}
        />
      )}
      
      {activeTab === 'premium' && (
        <PremiumUpgrades
          money={money} 
          globalMultiplier={globalMultiplier}
          globalMultiplierLevel={globalMultiplierLevel}
          offlineEarningsLevel={offlineEarningsLevel}
          globalMultiplierCost={globalMultiplierCost}
          offlineEarningsCost={offlineEarningsCost}
          buyGlobalMultiplier={buyGlobalMultiplier}
          buyOfflineEarnings={buyOfflineEarnings}
        />
      )}
    </>
  );
}