import { gameConfig } from '@constants/gameConfig';
import { Gem, Gauge, Lock, ShoppingCart, Bot, Cpu } from 'lucide-react';
import { formatNumber } from '@utils/calculators';

const getIcon = (iconName) => {
  if (iconName === 'Gem') return <Gem className="premium-icon" />;
  if (iconName === 'Gauge') return <Gauge className="premium-icon" />;
  if (iconName === 'ShoppingCart') return <ShoppingCart className="premium-icon" />;
  if (iconName === 'Bot') return <Bot className="premium-icon" />;
  if (iconName === 'Cpu') return <Cpu className="premium-icon" />;
  return null;
};

const getNameForCraftedItem = (index, quantity) => {
    if (index === 0) return quantity === 1 ? 'Coin' : 'Coins';
    if (index === 1) return 'Gold';
    return '';
}

const UpgradeCard = ({ upgrade, level, buyUpgrade, craftingItems }) => {
  const currentLevel = level || 0;
  const isMaxLevel = currentLevel >= upgrade.maxLevel;
  const costs = !isMaxLevel ? upgrade.getCost(currentLevel) : [];
  
  const canAfford = costs.every(cost => (craftingItems[cost.item] || 0) >= Math.ceil(cost.quantity));

  const isDisabled = isMaxLevel || !canAfford;

  const renderCosts = () => {
    if (isMaxLevel) return <span>Max Level</span>;
    return costs.map((cost, index) => {
      const quantity = Math.ceil(cost.quantity);
      return (
        <span key={index} className="cost-item">
          {formatNumber(quantity, { decimals: 0 })} {getNameForCraftedItem(cost.item, quantity)}
        </span>
      );
    });
  };

  return (
    <div className="premium-upgrade-card">
      <div className="premium-upgrade-header">
        {getIcon(upgrade.icon)}
        <h3>{upgrade.name}</h3>
      </div>
      <p className="premium-upgrade-description">{upgrade.description}</p>
      <div className="premium-upgrade-info">
        <div className="premium-upgrade-level">
          Level: {currentLevel} / {upgrade.maxLevel}
        </div>
        <button
          onClick={() => buyUpgrade(upgrade.id)}
          disabled={isDisabled}
          className={`premium-upgrade-button ${isDisabled ? 'disabled' : ''}`}
        >
          {renderCosts()}
        </button>
      </div>
    </div>
  );
};

const AutomationCard = ({ upgrade, level, buyUpgrade, craftingItems, isEnabled, setEnabled }) => {
  const isUnlocked = (level || 0) > 0;
  
  if (!isUnlocked) {
    return <UpgradeCard upgrade={upgrade} level={level} buyUpgrade={buyUpgrade} craftingItems={craftingItems} />;
  }

  return (
    <div className="premium-upgrade-card automation-card">
      <div className="premium-upgrade-header">
        {getIcon(upgrade.icon)}
        <h3>{upgrade.name}</h3>
        <span className={`status-badge ${isEnabled ? 'active' : 'inactive'}`}>
          {isEnabled ? 'Active' : 'Standby'}
        </span>
      </div>
      <p className="premium-upgrade-description">{upgrade.description}</p>
      <div className="premium-upgrade-info">
        <div className="premium-upgrade-level">Status: {isEnabled ? 'Running' : 'Paused'}</div>
        <button
          onClick={() => setEnabled(!isEnabled)}
          className={`premium-upgrade-button ${isEnabled ? 'active' : ''}`}
        >
          {isEnabled ? 'Disable Module' : 'Enable Module'}
        </button>
      </div>
    </div>
  );
};

export default function ProductionHQ({ 
  productionHqUpgrades, 
  buyProductionHqUpgrade, 
  craftingItems, 
  isUnlocked,
  autoBuyMaterialsEnabled,
  setAutoBuyMaterialsEnabled,
  autoCraftEnabled,
  setAutoCraftEnabled
}) {
  if (!isUnlocked) {
    return (
      <div className="upgrade-section premium-section production-hq-locked">
        <h2 className="section-title">Production HQ</h2>
        <div className="premium-upgrade-card locked-card">
          <div className="premium-upgrade-header">
            <Lock className="premium-icon" />
            <h3>HQ Access Restricted</h3>
          </div>
          <p className="premium-upgrade-description">
            To unlock the full potential of your Production HQ, you need to prove your manufacturing capabilities.
          </p>
          <div className="crafting-unlock-card__requirements">
            <div className={`premium-upgrade-level ${(craftingItems?.[0] || 0) >= 10 ? 'met' : ''}`}>
               Collectible Coins: <strong>{formatNumber(craftingItems?.[0] || 0, { decimals: 0 })}</strong> / 10
            </div>
            <div className={`premium-upgrade-level ${(craftingItems?.[1] || 0) >= 5 ? 'met' : ''}`}>
               Gold Reserves: <strong>{formatNumber(craftingItems?.[1] || 0, { decimals: 0 })}</strong> / 5
            </div>
          </div>
          <p className="locked-hint">
            The HQ will be operational as soon as you have produced the required assets in the Crafting tab.
          </p>
        </div>
      </div>
    );
  }

  const efficiencyUpgrades = gameConfig.productionHqUpgrades.filter(u => !u.id.startsWith('auto_'));
  const automationUpgrades = gameConfig.productionHqUpgrades.filter(u => u.id.startsWith('auto_'));

  return (
    <div className="upgrade-section premium-section">
      <h2 className="section-title">Production HQ</h2>
      
      <h3 className="section-subtitle" style={{marginTop:24, marginBottom:12}}>Efficiency Upgrades</h3>
      {efficiencyUpgrades.map(upgrade => (
        <UpgradeCard
          key={upgrade.id}
          upgrade={upgrade}
          level={productionHqUpgrades?.[upgrade.id]}
          buyUpgrade={buyProductionHqUpgrade}
          craftingItems={craftingItems}
        />
      ))}

      <h3 className="section-subtitle" style={{marginTop:32, marginBottom:12}}>Automation Modules</h3>
      {automationUpgrades.map(upgrade => (
        <AutomationCard
          key={upgrade.id}
          upgrade={upgrade}
          level={productionHqUpgrades?.[upgrade.id]}
          buyUpgrade={buyProductionHqUpgrade}
          craftingItems={craftingItems}
          isEnabled={upgrade.id === 'auto_buy_materials' ? autoBuyMaterialsEnabled : autoCraftEnabled}
          setEnabled={upgrade.id === 'auto_buy_materials' ? setAutoBuyMaterialsEnabled : setAutoCraftEnabled}
        />
      ))}
    </div>
  );
}
