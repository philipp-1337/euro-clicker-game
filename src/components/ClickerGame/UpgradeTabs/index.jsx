import BasicUpgrades from './BasicUpgrades';
import PremiumUpgrades from './PremiumUpgrades';

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
  return (
    <>
      <div className="upgrade-tabs">
        <button 
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Upgrades
        </button>
        <button 
          className={`tab-button ${activeTab === 'premium' ? 'active' : ''}`}
          onClick={() => setActiveTab('premium')}
        >
          Premium Upgrades
        </button>
      </div>
      
      {activeTab === 'basic' && (
        <BasicUpgrades 
          buttons={buttons}
          valueUpgradeCosts={valueUpgradeCosts}
          cooldownUpgradeCosts={cooldownUpgradeCosts}
          money={money}
          buyValueUpgrade={buyValueUpgrade}
          buyCooldownUpgrade={buyCooldownUpgrade}
          valueMultipliers={valueUpgradeLevels.map((_, i) => buttons[i].value / buttons[i].baseValue / globalMultiplier)}
          cooldownReductions={cooldownUpgradeLevels.map((_, i) => (buttons[i].cooldownTime / buttons[i].baseCooldownTime) * 100)}
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