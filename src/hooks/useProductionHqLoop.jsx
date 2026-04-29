import { useCallback, useEffect, useMemo, useRef } from 'react';
import { gameConfig } from '@constants/gameConfig';
import {
  canAffordHqCosts,
  DEFAULT_HQ_UPGRADES,
  getHqExtractionRate,
  getHqUpgradeLevel,
  getOverdriveCooldownMs,
  getPrecisionDurationMs,
  getPrecisionOutputBonus,
  subtractHqCosts,
} from './useProductionHqLoop.helpers';

const PRODUCTION_HQ_TICK_MS = 1000;
const PRECISION_COOLDOWN_MS = 45000;

const buildDefaultMaterials = () => Object.fromEntries(
  gameConfig.productionHqPhase.materials.map((material) => [material.id, 0])
);

const buildDefaultComponents = () => Object.fromEntries(
  gameConfig.productionHqPhase.components.map((component) => [component.id, 0])
);

const buildDefaultProductionState = () => ({
  overdriveReadyAt: {},
  precisionActiveUntil: 0,
  precisionReadyAt: 0,
  lastTickAt: Date.now(),
});

const normalizeMap = (currentValue, fallbackFactory) => {
  if (currentValue && typeof currentValue === 'object' && !Array.isArray(currentValue)) {
    return currentValue;
  }

  return fallbackFactory();
};

export default function useProductionHqLoop({
  enabled = true,
  hqMaterials,
  setHqMaterials,
  hqComponents,
  setHqComponents,
  hqTier,
  setHqTier,
  hqProgress,
  setHqProgress,
  hqProductionState,
  setHqProductionState,
  hqUpgrades,
  setHqUpgrades,
}) {
  const materials = useMemo(() => normalizeMap(hqMaterials, buildDefaultMaterials), [hqMaterials]);
  const components = useMemo(() => normalizeMap(hqComponents, buildDefaultComponents), [hqComponents]);
  const productionState = useMemo(
    () => ({ ...buildDefaultProductionState(), ...(hqProductionState ?? {}) }),
    [hqProductionState]
  );
  const upgrades = useMemo(() => ({ ...DEFAULT_HQ_UPGRADES, ...(hqUpgrades ?? {}) }), [hqUpgrades]);

  const materialsRef = useRef(materials);
  const componentsRef = useRef(components);
  const productionStateRef = useRef(productionState);
  const upgradesRef = useRef(upgrades);

  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  useEffect(() => {
    componentsRef.current = components;
  }, [components]);

  useEffect(() => {
    productionStateRef.current = productionState;
  }, [productionState]);

  useEffect(() => {
    upgradesRef.current = upgrades;
  }, [upgrades]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const lastTickAt = productionStateRef.current.lastTickAt ?? now;
      const elapsedSeconds = Math.max(0, (now - lastTickAt) / 1000);

      if (elapsedSeconds <= 0) {
        return;
      }

      setHqMaterials((previousMaterials) => {
        const currentMaterials = normalizeMap(previousMaterials, buildDefaultMaterials);
        const nextMaterials = { ...currentMaterials };

        gameConfig.productionHqPhase.materials.forEach((material) => {
          nextMaterials[material.id] = (nextMaterials[material.id] ?? 0)
            + (getHqExtractionRate(material, upgradesRef.current) * elapsedSeconds);
        });

        return nextMaterials;
      });

      setHqProductionState((previousState) => ({
        ...buildDefaultProductionState(),
        ...(previousState ?? {}),
        lastTickAt: now,
      }));
    }, PRODUCTION_HQ_TICK_MS);

    return () => clearInterval(interval);
  }, [enabled, setHqMaterials, setHqProductionState]);

  const currentTierDefinition = useMemo(() => {
    return gameConfig.productionHqPhase.coreTiers[hqTier] ?? gameConfig.productionHqPhase.coreTiers.at(-1);
  }, [hqTier]);

  const nextTierDefinition = useMemo(() => {
    return gameConfig.productionHqPhase.coreTiers[hqTier + 1] ?? null;
  }, [hqTier]);

  const precisionActive = productionState.precisionActiveUntil > Date.now();
  const precisionBonusOutput = precisionActive ? getPrecisionOutputBonus(upgrades) : 0;
  const precisionCooldownRemainingMs = Math.max(0, (productionState.precisionReadyAt ?? 0) - Date.now());

  const triggerOverdrive = useCallback((materialId) => {
    const material = gameConfig.productionHqPhase.materials.find((entry) => entry.id === materialId);

    if (!material) {
      return false;
    }

    const currentReadyAt = productionStateRef.current.overdriveReadyAt?.[materialId] ?? 0;
    const now = Date.now();

    if (currentReadyAt > now) {
      return false;
    }

    setHqMaterials((previousMaterials) => {
      const currentMaterials = normalizeMap(previousMaterials, buildDefaultMaterials);
      return {
        ...currentMaterials,
        [materialId]: (currentMaterials[materialId] ?? 0) + material.overdriveBurst,
      };
    });

    setHqProductionState((previousState) => ({
      ...buildDefaultProductionState(),
      ...(previousState ?? {}),
      overdriveReadyAt: {
        ...(previousState?.overdriveReadyAt ?? {}),
        [materialId]: now + getOverdriveCooldownMs(upgradesRef.current),
      },
      lastTickAt: now,
    }));

    return true;
  }, [setHqMaterials, setHqProductionState]);

  const triggerPrecisionWindow = useCallback(() => {
    const now = Date.now();

    if ((productionStateRef.current.precisionReadyAt ?? 0) > now) {
      return false;
    }

    setHqProductionState((previousState) => ({
      ...buildDefaultProductionState(),
      ...(previousState ?? {}),
      precisionActiveUntil: now + getPrecisionDurationMs(upgradesRef.current),
      precisionReadyAt: now + PRECISION_COOLDOWN_MS,
      lastTickAt: now,
    }));

    return true;
  }, [setHqProductionState]);

  const craftComponent = useCallback((componentId) => {
    const component = gameConfig.productionHqPhase.components.find((entry) => entry.id === componentId);

    if (!component) {
      return false;
    }

    if (!canAffordHqCosts(materialsRef.current, component.costs)) {
      return false;
    }

    setHqMaterials((previousMaterials) => subtractHqCosts(
      normalizeMap(previousMaterials, buildDefaultMaterials),
      component.costs
    ));

    setHqComponents((previousComponents) => {
      const currentComponents = normalizeMap(previousComponents, buildDefaultComponents);
      const output = 1 + (productionStateRef.current.precisionActiveUntil > Date.now()
        ? getPrecisionOutputBonus(upgradesRef.current)
        : 0);

      return {
        ...currentComponents,
        [component.id]: (currentComponents[component.id] ?? 0) + output,
      };
    });

    return true;
  }, [setHqComponents, setHqMaterials]);

  const buyHqUpgrade = useCallback((upgradeId) => {
    const upgrade = gameConfig.productionHqPhase.upgrades.find((entry) => entry.id === upgradeId);

    if (!upgrade) {
      return false;
    }

    const currentLevel = getHqUpgradeLevel(upgradesRef.current, upgradeId);

    if (currentLevel >= upgrade.maxLevel) {
      return false;
    }

    const levelCost = upgrade.costsByLevel[currentLevel] ?? null;

    if (!levelCost || !canAffordHqCosts(componentsRef.current, levelCost)) {
      return false;
    }

    setHqComponents((previousComponents) => subtractHqCosts(
      normalizeMap(previousComponents, buildDefaultComponents),
      levelCost
    ));
    setHqUpgrades((previousUpgrades) => {
      const currentUpgrades = { ...DEFAULT_HQ_UPGRADES, ...(previousUpgrades ?? {}) };
      return {
        ...currentUpgrades,
        [upgradeId]: (currentUpgrades[upgradeId] ?? 0) + 1,
      };
    });

    return true;
  }, [setHqComponents, setHqUpgrades]);

  const installCoreStage = useCallback(() => {
    if (!currentTierDefinition || currentTierDefinition.projectCount <= 0) {
      return false;
    }

    if (!canAffordHqCosts(componentsRef.current, currentTierDefinition.projectCost)) {
      return false;
    }

    setHqComponents((previousComponents) => subtractHqCosts(
      normalizeMap(previousComponents, buildDefaultComponents),
      currentTierDefinition.projectCost
    ));

    if ((hqProgress + 1) >= currentTierDefinition.projectCount) {
      setHqTier((previousTier) => previousTier + 1);
      setHqProgress(0);
    } else {
      setHqProgress((previousProgress) => previousProgress + 1);
    }

    return true;
  }, [
    currentTierDefinition,
    hqProgress,
    setHqComponents,
    setHqProgress,
    setHqTier,
  ]);

  return {
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
    overdriveReadyAt: productionState.overdriveReadyAt ?? {},
  };
}
