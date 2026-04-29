export const DEFAULT_HQ_UPGRADES = {
  flux_lines: 0,
  calibration_matrix: 0,
  thermal_sinks: 0,
};

export function getHqUpgradeLevel(upgrades = {}, upgradeId) {
  return Math.max(0, upgrades?.[upgradeId] ?? DEFAULT_HQ_UPGRADES[upgradeId] ?? 0);
}

export function canAffordHqCosts(resourceState = {}, costs = {}) {
  return Object.entries(costs).every(([resourceId, amount]) => {
    return (resourceState?.[resourceId] ?? 0) >= amount;
  });
}

export function subtractHqCosts(resourceState = {}, costs = {}) {
  const nextState = { ...resourceState };

  Object.entries(costs).forEach(([resourceId, amount]) => {
    nextState[resourceId] = Math.max(0, (nextState[resourceId] ?? 0) - amount);
  });

  return nextState;
}

export function getHqExtractionRate(material, upgrades = {}) {
  const fluxLinesLevel = getHqUpgradeLevel(upgrades, 'flux_lines');
  const multiplier = 1 + (fluxLinesLevel * 0.25);

  return (material?.baseRatePerSecond ?? 0) * multiplier;
}

export function getPrecisionOutputBonus(upgrades = {}) {
  return 1 + getHqUpgradeLevel(upgrades, 'calibration_matrix');
}

export function getOverdriveCooldownMs(upgrades = {}) {
  return Math.max(5000, 20000 - (getHqUpgradeLevel(upgrades, 'thermal_sinks') * 5000));
}

export function getPrecisionDurationMs(upgrades = {}) {
  return 12000 + (getHqUpgradeLevel(upgrades, 'thermal_sinks') * 4000);
}
