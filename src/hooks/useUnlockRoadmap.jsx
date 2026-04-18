import { useMemo } from 'react';
import { gameConfig } from '@constants/gameConfig';
import { formatNumber } from '@utils/calculators';

const clampPercentage = (value) => Math.max(0, Math.min(100, value));

const normalizeNumber = (value, fallback = 0) =>
  (typeof value === 'number' && Number.isFinite(value)) ? value : fallback;

const formatRemainingMoney = (currentValue, targetValue) => {
  const remaining = Math.max(0, targetValue - currentValue);
  return remaining > 0 ? `Need ${formatNumber(remaining)} € more` : 'Ready';
};

const formatRemainingMoneyAmount = (currentValue, targetValue) =>
  `${formatNumber(Math.max(0, targetValue - currentValue))} €`;

const formatRemainingPrestige = (currentPrestigeShares, targetPrestige) =>
  `${formatNumber(Math.max(0, targetPrestige - currentPrestigeShares), { decimals: 0 })} Prestige`;

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

  return false;
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

const getSingleRequirementProgress = (context, milestone) => {
  const thresholdCondition = Array.isArray(milestone.readyWhen)
    ? milestone.readyWhen.find((condition) => condition.type === 'threshold')
    : milestone.readyWhen;
  const progressKey = thresholdCondition?.key ?? 'money';
  const targetKey = thresholdCondition?.target ?? 'targetValue';
  return clampPercentage(
    (normalizeNumber(getContextValue(context, progressKey)) / Math.max(1, normalizeNumber(milestone[targetKey]))) * 100
  );
};

const getStagedDualRequirementProgress = (context, milestone) => {
  const moneyProgress = clampPercentage((normalizeNumber(getContextValue(context, 'money')) / Math.max(1, normalizeNumber(milestone.targetValue))) * 100);
  const prestigeProgress = clampPercentage((normalizeNumber(getContextValue(context, 'prestigeShares')) / Math.max(1, normalizeNumber(milestone.targetPrestige))) * 100);

  if (prestigeProgress >= 100) {
    return 50 + (moneyProgress * 0.5);
  }

  return (prestigeProgress * 0.5) + (moneyProgress * 0.2);
};

const formatRemainingText = (milestone, context, milestoneState) => {
  if (milestoneState.isReached) {
    return 'Unlocked';
  }
  if (milestoneState.isReady) {
    return milestone.readyLabel ?? 'Ready';
  }
  if (milestone.unlockType === 'moneyAndPrestige') {
    const remainingParts = [];
    const currentMoney = normalizeNumber(getContextValue(context, 'money'));
    const currentPrestigeShares = normalizeNumber(getContextValue(context, 'prestigeShares'));
    if (currentMoney < milestoneState.targetValue) {
      remainingParts.push(formatRemainingMoneyAmount(currentMoney, milestoneState.targetValue));
    }
    if (currentPrestigeShares < milestoneState.targetPrestige) {
      remainingParts.push(formatRemainingPrestige(currentPrestigeShares, milestoneState.targetPrestige));
    }
    return remainingParts.length > 0
      ? `Need ${remainingParts.join(' and ')}`
      : 'Ready to unlock';
  }

  return formatRemainingMoney(normalizeNumber(getContextValue(context, 'money')), milestoneState.targetValue);
};

const resolveMilestoneState = (milestone, context, overrides) => {
  const milestoneState = buildMilestoneState(milestone, {
    targetValue: getTargetValue(milestone, overrides),
    targetPrestige: getTargetPrestige(milestone, overrides),
    canRelock: milestone.scope === 'run',
  });
  const isReady = resolveCondition(milestone.readyWhen, context, milestoneState);
  const isReached = resolveCondition(milestone.reachedWhen, context, milestoneState);
  const currentProgressPercentage = isReached
    ? 100
    : milestone.progressStrategy === 'stagedDualRequirement'
      ? getStagedDualRequirementProgress(context, milestoneState)
      : getSingleRequirementProgress(context, milestoneState);

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

const resolveCraftingMilestone = (milestone, context, overrides) => {
  const resolvedMilestone = resolveMilestoneState(milestone, context, overrides);
  let remainingRequirementText;
  if (resolvedMilestone.isReached) {
    remainingRequirementText = 'Unlocked';
  } else if (resolvedMilestone.isReady) {
    remainingRequirementText = 'Ready to unlock';
  } else {
    remainingRequirementText = resolvedMilestone.remainingRequirementText;
  }

  return {
    ...resolvedMilestone,
    remainingRequirementText,
  };
};

const progressStrategyResolvers = {
  stagedDualRequirement: resolveCraftingMilestone,
  singleRequirement: resolveMilestoneState,
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
      const resolveMilestone = progressStrategyResolvers[milestone.progressStrategy];
      if (!resolveMilestone) {
        return buildMilestoneState(milestone, {
          currentProgressPercentage: 0,
          remainingRequirementText: '',
          isCurrentlyUnlocked: false,
          isReached: false,
          canRelock: false,
        });
      }

      return resolveMilestone(milestone, milestoneContext, milestoneOverrides);
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
