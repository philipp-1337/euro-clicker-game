import { gameConfig } from '@constants/gameConfig';
import { Gem, Gauge, Lock, ShoppingCart, Bot, Cpu, Sparkles } from 'lucide-react';
import { formatNumber } from '@utils/calculators';

const getIcon = (iconName) => {
  if (iconName === 'Gem') return <Gem className="premium-icon" />;
  if (iconName === 'Gauge') return <Gauge className="premium-icon" />;
  if (iconName === 'ShoppingCart') return <ShoppingCart className="premium-icon" />;
  if (iconName === 'Bot') return <Bot className="premium-icon" />;
  if (iconName === 'Cpu') return <Cpu className="premium-icon" />;
  if (iconName === 'Sparkles') return <Sparkles className="premium-icon" />;
  return null;
};

const getNameForCraftedItem = (index, quantity) => {
    if (index === 0) return quantity === 1 ? 'Coin' : 'Coins';
    if (index === 1) return quantity === 1 ? 'Gold Bar' : 'Gold Bars';
    return '';
};

const formatPercentLabel = (value) => `${Math.round(value * 100)}%`;

const getUpgradeDescription = (upgrade) => {
  if (upgrade.id === 'crafting_value') {
    return `Increases the value of crafted items by ${formatPercentLabel(upgrade.effectPerLevel)} per level.`;
  }

  if (upgrade.id === 'crafting_speed') {
    return `Reduces the production time of crafted items by ${formatPercentLabel(upgrade.effectPerLevel)} per level.`;
  }

  if (upgrade.id === 'material_cost') {
    return `Reduces the cost of raw materials by ${formatPercentLabel(upgrade.effectPerLevel)} per level.`;
  }

  if (upgrade.id === 'rare_result') {
    return `Increases the rare result chance of wealth production routes by ${formatPercentLabel(upgrade.effectPerLevel)} per level.`;
  }

  return upgrade.description;
};

const getProductionHqRequirements = () => {
  const milestone = gameConfig.unlockRoadmap.find((entry) => entry.id === 'productionHq');

  if (!milestone?.requirements) {
    return [];
  }

  return milestone.requirements
    .filter((requirement) => typeof requirement.key === 'string' && requirement.key.startsWith('craftingItems.'))
    .map((requirement) => {
      const itemIndex = Number(requirement.key.split('.')[1]);

      return {
        itemIndex,
        label: requirement.itemName || getNameForCraftedItem(itemIndex, requirement.target),
        target: Number(requirement.target) || 0,
      };
    });
};

const UpgradeCard = ({ upgrade, level, buyUpgrade, craftingItems }) => {
  const currentLevel = level || 0;
  const isMaxLevel = currentLevel >= upgrade.maxLevel;
  const costs = !isMaxLevel ? upgrade.getCost(currentLevel) : [];
  
  const canAfford = costs.every(cost => (craftingItems[cost.item] || 0) >= Math.ceil(cost.quantity));

  const isDisabled = isMaxLevel || !canAfford;

  const renderCosts = () => {
    if (isMaxLevel) return <span>Max Level</span>;
    return (
      <div className="production-hq-cost-stack">
        {costs.map((cost, index) => {
          const quantity = Math.ceil(cost.quantity);
          const owned = craftingItems?.[cost.item] || 0;
          const isMet = owned >= quantity;

          return (
            <span key={index} className={`cost-item ${isMet ? 'is-met' : 'is-missing'}`}>
              <span className="cost-item__required">
                {formatNumber(quantity, { decimals: 0 })} {getNameForCraftedItem(cost.item, quantity)}
              </span>
              <span className="cost-item__owned">
                Owned: {formatNumber(owned, { decimals: 0 })}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="premium-upgrade-card">
      <div className="premium-upgrade-header">
        {getIcon(upgrade.icon)}
        <h3>{upgrade.name}</h3>
      </div>
      <p className="premium-upgrade-description">{getUpgradeDescription(upgrade)}</p>
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

const AutomationCard = ({ upgrade, level, buyUpgrade, craftingItems }) => {
  const isUnlocked = (level || 0) > 0;
  
  if (!isUnlocked) {
    return <UpgradeCard upgrade={upgrade} level={level} buyUpgrade={buyUpgrade} craftingItems={craftingItems} />;
  }

  return (
    <div className="premium-upgrade-card automation-card">
      <div className="premium-upgrade-header">
        {getIcon(upgrade.icon)}
        <h3>{upgrade.name}</h3>
      </div>
      <p className="premium-upgrade-description">
        {getUpgradeDescription(upgrade)} Manage the live state via the <Bot size={12} /> icon in the header or the Automation Settings modal.
      </p>
      <div className="premium-upgrade-info auto-buyer-info">
        <button
          disabled
          className="premium-upgrade-button disabled"
        >
          Unlocked
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
  productionHqMaterialCostMultiplier = 1,
  productionHqValueMultiplier = 1,
  productionHqSpeedMultiplier = 1,
  productionHqRareChanceBonus = 0,
}) {
  const unlockRequirements = getProductionHqRequirements();

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
            {unlockRequirements.map((requirement) => {
              const owned = craftingItems?.[requirement.itemIndex] || 0;
              const isMet = owned >= requirement.target;

              return (
                <div key={requirement.itemIndex} className={`premium-upgrade-level ${isMet ? 'met' : ''}`}>
                  {requirement.label}: <strong>{formatNumber(owned, { decimals: 0 })}</strong> / {formatNumber(requirement.target, { decimals: 0 })}
                </div>
              );
            })}
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

      <div className="crafting-journey-card is-live">
        <span className="crafting-journey-card__eyebrow">HQ Overview</span>
        <h3>Convert crafted assets into durable production leverage</h3>
        <p>
          The HQ is your post-prestige efficiency layer: reduce sourcing costs, compress batch times, and push crafted payouts high enough to justify active claim timing.
        </p>
        <div className="crafting-journey-card__highlights">
          <span>Craft value: {formatPercentLabel(productionHqValueMultiplier - 1)} bonus</span>
          <span>Craft speed: {formatPercentLabel(1 - productionHqSpeedMultiplier)} faster</span>
          <span>Material costs: {formatPercentLabel(1 - productionHqMaterialCostMultiplier)} lower</span>
          <span>Rare finishes: {formatPercentLabel(productionHqRareChanceBonus)} higher chance</span>
        </div>
      </div>
      
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
        />
      ))}
    </div>
  );
}
