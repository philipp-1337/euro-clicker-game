import { useMemo } from 'react';
import { gameConfig } from '@constants/gameConfig';
import { formatNumber } from '@utils/calculators';

const clampPercentage = (value) => Math.max(0, Math.min(100, value));

const normalizeNumber = (value, fallback = 0) =>
  (typeof value === 'number' && Number.isFinite(value)) ? value : fallback;

const formatRemainingMoneyAmount = (currentValue, targetValue) =>
  `${formatNumber(Math.max(0, targetValue - currentValue))} €`;

const formatRemainingPrestige = (currentPrestigeShares, targetPrestige) =>
  `${formatNumber(Math.max(0, targetPrestige - currentPrestigeShares), { decimals: 0 })} Prestige`;

const CONDITION_TYPES = new Set(['flag', 'threshold']);
const PROGRESS_STRATEGIES = new Set(['segments']);

const invariant = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const getTargetValue = (milestone, overrides) => {
  const overrideKey = milestone.targetValueOverrideKey;
  if (overrideKey) {
    return normalizeNumber(overrides[overrideKey], normalizeNumber(milestone.targetValue));
  }
  return normalizeNumber(milestone.targetValue);
};

const getTargetPrestige = (milestone, overrides) => {
  const overrideKey = milestone.targetPrestigeOverrideKey;
  if (overrideKey) {
    return normalizeNumber(overrides[overrideKey], normalizeNumber(milestone.targetPrestige));
  }
  return normalizeNumber(milestone.targetPrestige);
};

const getContextValue = (context, key) => {
  const value = context[key];
  if (typeof value === 'boolean') {
    return value;
  }
  return normalizeNumber(value);
};

const resolveCondition = (condition, context, milestoneState) => {
  if (Array.isArray(condition)) {
    return condition.every((entry) => resolveCondition(entry, context, milestoneState));
  }

  if (!condition) {
    return false;
  }

  invariant(
    CONDITION_TYPES.has(condition.type),
    `Unsupported roadmap condition type "${condition.type}" for milestone "${milestoneState.id}".`
  );

  const value = getContextValue(context, condition.key);
  if (condition.type === 'flag') {
    return Boolean(value);
  }

  if (condition.type === 'threshold') {
    const target = condition.target
      ? normalizeNumber(milestoneState[condition.target])
      : normalizeNumber(condition.value);
    return normalizeNumber(value) >= Math.max(1, target);
  }
};

const buildMilestoneState = (milestone, values) => ({
  id: milestone.id,
  title: milestone.title ?? '',
  description: milestone.description ?? '',
  ctaLabel: milestone.ctaLabel ?? '',
  previewText: milestone.previewText ?? '',
  unlockType: milestone.unlockType,
  scope: milestone.scope,
  status: 'locked',
  isReady: false,
  isCurrentlyUnlocked: false,
  isReached: false,
  ...values,
});

const getSegmentProgress = (segment, context, milestone) => {
  const targetValue = segment.target
    ? normalizeNumber(milestone[segment.target])
    : normalizeNumber(segment.value);
  const currentValue = normalizeNumber(getContextValue(context, segment.key));
  const span = normalizeNumber(segment.end) - normalizeNumber(segment.start);
  const rawProgress = clampPercentage((currentValue / Math.max(1, targetValue)) * 100) / 100;
  const minProgress = normalizeNumber(segment.minProgress, 0);
  const maxProgress = normalizeNumber(segment.maxProgress, 1);
  const normalizedProgress = Math.max(
    0,
    Math.min(1, (rawProgress - minProgress) / Math.max(0.0001, maxProgress - minProgress))
  );
  return normalizedProgress * span;
};

const getSegmentsProgress = (milestone, context) => {
  invariant(
    Array.isArray(milestone.progressSegments) && milestone.progressSegments.length > 0,
    `Roadmap milestone "${milestone.id}" requires at least one progress segment.`
  );

  return milestone.progressSegments.reduce((totalProgress, segment) => {
    const segmentEnabled = segment.requires
      ? resolveCondition(segment.requires, context, milestone)
      : true;
    if (!segmentEnabled) {
      return totalProgress;
    }
    return totalProgress + getSegmentProgress(segment, context, milestone);
  }, 0);
};

const formatRemainingRequirement = (requirement, context, milestoneState) => {
  const currentValue = normalizeNumber(getContextValue(context, requirement.key));
  const targetValue = requirement.target
    ? normalizeNumber(milestoneState[requirement.target])
    : normalizeNumber(requirement.value);

  if (requirement.format === 'money') {
    return formatRemainingMoneyAmount(currentValue, targetValue);
  }

  if (requirement.format === 'prestige') {
    return formatRemainingPrestige(currentValue, targetValue);
  }

  throw new Error(
    `Unsupported roadmap requirement format "${requirement.format}" for milestone "${milestoneState.id}".`
  );
};

const formatRemainingText = (milestone, context, milestoneState) => {
  if (milestoneState.isReached) {
    return 'Unlocked';
  }
  if (milestoneState.isReady) {
    return milestone.readyLabel ?? 'Ready';
  }
  invariant(
    Array.isArray(milestone.remainingRequirements) && milestone.remainingRequirements.length > 0,
    `Roadmap milestone "${milestone.id}" requires remaining requirement metadata.`
  );
  const remainingParts = milestone.remainingRequirements
    .filter((requirement) => {
      const currentValue = normalizeNumber(getContextValue(context, requirement.key));
      const targetValue = requirement.target
        ? normalizeNumber(milestoneState[requirement.target])
        : normalizeNumber(requirement.value);
      return currentValue < targetValue;
    })
    .map((requirement) => formatRemainingRequirement(requirement, context, milestoneState));

  return remainingParts.length > 0
    ? `Need ${remainingParts.join(' and ')}`
    : 'Ready';
};

const resolveMilestoneState = (milestone, context, overrides) => {
  invariant(
    PROGRESS_STRATEGIES.has(milestone.progressStrategy),
    `Unsupported roadmap progress strategy "${milestone.progressStrategy}" for milestone "${milestone.id}".`
  );
  const milestoneState = buildMilestoneState(milestone, {
    targetValue: getTargetValue(milestone, overrides),
    targetPrestige: getTargetPrestige(milestone, overrides),
    canRelock: milestone.scope === 'run',
  });
  const isReady = resolveCondition(milestone.readyWhen, context, milestoneState);
  const isReached = resolveCondition(milestone.reachedWhen, context, milestoneState);
  const runtimeMilestone = {
    ...milestone,
    ...milestoneState,
  };
  const currentProgressPercentage = isReached
    ? 100
    : getSegmentsProgress(runtimeMilestone, context);

  return {
    ...milestoneState,
    status: isReached ? 'unlocked' : isReady ? 'ready' : 'locked',
    isReady,
    isCurrentlyUnlocked: isReached,
    isReached,
    currentProgressPercentage,
    remainingRequirementText: formatRemainingText(milestone, context, {
      ...milestoneState,
      isReady,
      isReached,
    }),
  };
};

export default function useUnlockRoadmap({
  money,
  isInvestmentUnlocked,
  prestigeCount,
  prestigeShares,
  isCraftingUnlocked,
  unlockInvestmentCost,
  prestigeThresholdMoney = gameConfig.prestige.minMoneyForModalButton,
  craftingUnlockCost = gameConfig.unlockCraftingCost,
  craftingUnlockPrestige = gameConfig.unlockCraftingPrestige,
} = {}) {
  return useMemo(() => {
    const milestoneContext = {
      money,
      isInvestmentUnlocked,
      prestigeCount,
      prestigeShares,
      isCraftingUnlocked,
    };
    const milestoneOverrides = {
      unlockInvestmentCost,
      prestigeThresholdMoney,
      craftingUnlockCost,
      craftingUnlockPrestige,
    };
    const milestones = gameConfig.unlockRoadmap.map((milestone) => {
      return resolveMilestoneState(milestone, milestoneContext, milestoneOverrides);
    });

    const nextMilestone = milestones.find((milestone) => !milestone.isReached) ?? null;

    return {
      nextMilestone,
      hasNextMilestone: Boolean(nextMilestone),
      roadmapComplete: !nextMilestone,
    };
  }, [
    money,
    isInvestmentUnlocked,
    prestigeCount,
    prestigeShares,
    isCraftingUnlocked,
    unlockInvestmentCost,
    prestigeThresholdMoney,
    craftingUnlockCost,
    craftingUnlockPrestige,
  ]);
}
