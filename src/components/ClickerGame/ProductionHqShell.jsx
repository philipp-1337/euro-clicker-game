import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';
import { canAffordHqCosts } from '@hooks/useProductionHqLoop.helpers';

const formatCompactCount = (value) => formatNumber(value ?? 0, { decimals: value >= 10 ? 1 : 2 });

const formatSeconds = (milliseconds) => {
  if (!milliseconds || milliseconds <= 0) {
    return 'Ready';
  }

  return `${Math.ceil(milliseconds / 1000)}s`;
};

export default function ProductionHqShell({
  productionHqEntryState,
  productionHqLoop,
  hqTier,
  hqProgress,
}) {
  const {
    materials,
    components,
    upgrades,
    currentTierDefinition,
    nextTierDefinition,
    precisionActive,
    precisionBonusOutput,
    precisionCooldownRemainingMs,
    triggerOverdrive,
    triggerPrecisionWindow,
    craftComponent,
    buyHqUpgrade,
    installCoreStage,
    overdriveReadyAt,
  } = productionHqLoop;

  const materialsConfig = gameConfig.productionHqPhase.materials;
  const componentsConfig = gameConfig.productionHqPhase.components;
  const upgradesConfig = gameConfig.productionHqPhase.upgrades;
  const coreProgressTarget = currentTierDefinition?.projectCount ?? 0;
  const coreProgressPercentage = coreProgressTarget > 0
    ? Math.min(100, (hqProgress / coreProgressTarget) * 100)
    : 100;
  const canAffordCoreStage = canAffordHqCosts(components, currentTierDefinition?.projectCost ?? {});

  return (
    <section className="upgrade-section premium-section crafting-section production-hq-shell">
      <div className="crafting-journey-card is-live">
        <span className="crafting-journey-card__eyebrow">Production Phase</span>
        <h2>Production HQ</h2>
        <p>
          The cash economy is over. Build extraction pressure, time your precision window, and
          decide whether your next components go into faster production or the HQ core itself.
        </p>
        <div className="crafting-journey-card__highlights">
          <span>{formatNumber(productionHqEntryState?.coinCount ?? 0, { decimals: 0 })} Coins archived</span>
          <span>{formatNumber(productionHqEntryState?.goldCount ?? 0, { decimals: 0 })} Gold archived</span>
          <span>{precisionActive ? `Precision active: +${precisionBonusOutput}` : `Precision cooldown: ${formatSeconds(precisionCooldownRemainingMs)}`}</span>
        </div>
      </div>

      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <h3>Precision Window</h3>
        </div>
        <p className="premium-upgrade-description">
          Trigger a short assembly spike. While active, every component craft produces extra output.
          This is the main active burst tool for the new phase.
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Status: {precisionActive ? `Live (+${precisionBonusOutput} output)` : formatSeconds(precisionCooldownRemainingMs)}
          </div>
          <button
            type="button"
            className={`premium-upgrade-button ${precisionCooldownRemainingMs > 0 ? 'disabled' : ''}`}
            onClick={triggerPrecisionWindow}
            disabled={precisionCooldownRemainingMs > 0}
          >
            Trigger Precision Window
          </button>
        </div>
      </div>

      <h3 className="section-subtitle" style={{ marginTop: 24, marginBottom: 12 }}>Extraction</h3>
      {materialsConfig.map((material) => {
        const cooldownRemaining = Math.max(0, (overdriveReadyAt?.[material.id] ?? 0) - Date.now());

        return (
          <div key={material.id} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <h3>{material.name}</h3>
            </div>
            <p className="premium-upgrade-description">{material.overdriveLabel}</p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Stock: <strong>{formatCompactCount(materials?.[material.id] ?? 0)}</strong>
              </div>
              <div className="premium-upgrade-level">
                Rate: +{formatCompactCount(material.baseRatePerSecond * (1 + ((upgrades?.flux_lines ?? 0) * 0.25)))} / s
              </div>
              <button
                type="button"
                className={`premium-upgrade-button ${cooldownRemaining > 0 ? 'disabled' : ''}`}
                onClick={() => triggerOverdrive(material.id)}
                disabled={cooldownRemaining > 0}
              >
                {cooldownRemaining > 0 ? `Overdrive ${formatSeconds(cooldownRemaining)}` : `Overdrive +${material.overdriveBurst}`}
              </button>
            </div>
          </div>
        );
      })}

      <h3 className="section-subtitle" style={{ marginTop: 24, marginBottom: 12 }}>Assembly</h3>
      {componentsConfig.map((component) => {
        const costLabel = Object.entries(component.costs)
          .map(([materialId, amount]) => `${amount} ${gameConfig.productionHqPhase.materials.find((entry) => entry.id === materialId)?.name ?? materialId}`)
          .join(' • ');
        const canAfford = canAffordHqCosts(materials, component.costs);

        return (
          <div key={component.id} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <h3>{component.name}</h3>
            </div>
            <p className="premium-upgrade-description">{component.description}</p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Stock: <strong>{formatCompactCount(components?.[component.id] ?? 0)}</strong>
              </div>
              <div className="premium-upgrade-level">
                Cost: {costLabel}
              </div>
              <button
                type="button"
                className={`premium-upgrade-button ${canAfford ? '' : 'disabled'}`}
                onClick={() => craftComponent(component.id)}
                disabled={!canAfford}
              >
                Assemble {precisionActive ? `(1+${precisionBonusOutput})` : '(1)'}
              </button>
            </div>
          </div>
        );
      })}

      <h3 className="section-subtitle" style={{ marginTop: 24, marginBottom: 12 }}>HQ Core</h3>
      <div className="premium-upgrade-card">
        <div className="premium-upgrade-header">
          <h3>Tier {hqTier} Core Stabilization</h3>
        </div>
        <p className="premium-upgrade-description">
          Spend components on the core to unlock the next production layer.
          {nextTierDefinition ? ` Next unlock: ${currentTierDefinition?.unlockLabel}` : ' Core stabilized for the current prototype.'}
        </p>
        <div className="premium-upgrade-info">
          <div className="premium-upgrade-level">
            Progress: {hqProgress} / {coreProgressTarget || 0}
          </div>
          <div
            style={{
              width: '100%',
              height: 10,
              borderRadius: 999,
              background: 'rgba(0,0,0,0.08)',
              overflow: 'hidden',
              margin: '8px 0 14px',
            }}
          >
            <div
              style={{
                width: `${coreProgressPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f0b429, #ff7a18)',
              }}
            />
          </div>
          <div className="premium-upgrade-level">
            Install cost: {Object.entries(currentTierDefinition?.projectCost ?? {}).map(([componentId, amount]) => `${amount} ${componentsConfig.find((entry) => entry.id === componentId)?.name ?? componentId}`).join(' • ') || 'Maxed'}
          </div>
          <button
            type="button"
            className={`premium-upgrade-button ${coreProgressTarget <= 0 || !canAffordCoreStage ? 'disabled' : ''}`}
            onClick={installCoreStage}
            disabled={coreProgressTarget <= 0 || !canAffordCoreStage}
          >
            {coreProgressTarget > 0 ? 'Install Core Stage' : 'Core Stable'}
          </button>
        </div>
      </div>

      <h3 className="section-subtitle" style={{ marginTop: 24, marginBottom: 12 }}>HQ Upgrades</h3>
      {upgradesConfig.map((upgrade) => {
        const currentLevel = upgrades?.[upgrade.id] ?? 0;
        const nextCost = upgrade.costsByLevel[currentLevel];
        const canAffordUpgrade = nextCost ? canAffordHqCosts(components, nextCost) : false;
        const costLabel = nextCost
          ? Object.entries(nextCost).map(([componentId, amount]) => `${amount} ${componentsConfig.find((entry) => entry.id === componentId)?.name ?? componentId}`).join(' • ')
          : 'Max level';

        return (
          <div key={upgrade.id} className="premium-upgrade-card">
            <div className="premium-upgrade-header">
              <h3>{upgrade.name}</h3>
            </div>
            <p className="premium-upgrade-description">{upgrade.description}</p>
            <div className="premium-upgrade-info">
              <div className="premium-upgrade-level">
                Level: {currentLevel} / {upgrade.maxLevel}
              </div>
              <div className="premium-upgrade-level">
                Next cost: {costLabel}
              </div>
              <button
                type="button"
                className={`premium-upgrade-button ${currentLevel >= upgrade.maxLevel || !canAffordUpgrade ? 'disabled' : ''}`}
                onClick={() => buyHqUpgrade(upgrade.id)}
                disabled={currentLevel >= upgrade.maxLevel || !canAffordUpgrade}
              >
                Upgrade
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
