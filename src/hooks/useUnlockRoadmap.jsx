import { useMemo } from 'react';
import { gameConfig } from '@constants/gameConfig';
import { formatNumber } from '@utils/calculators';

const clampPercentage = (value) => Math.max(0, Math.min(100, value));

const normalizeNumber = (value, fallback = 0) =>
  (typeof value === 'number' && Number.isFinite(value)) ? value : fallback;

const getRequirementValue = (requirements, requirementKey) =>
  normalizeNumber(requirements?.[requirementKey], 0);

const formatRemainingMoney = (currentValue, targetValue) =>
  `Need ${formatNumber(Math.max(0, targetValue - currentValue))} € more`;

const formatRemainingMoneyAmount = (currentValue, targetValue) =>
  `${formatNumber(Math.max(0, targetValue - currentValue))} €`;

const formatRemainingPrestige = (currentPrestigeShares, targetPrestige) =>
  `${formatNumber(Math.max(0, targetPrestige - currentPrestigeShares), { decimals: 0 })} Prestige`;

const resolveMoneyMilestone = (milestone, runtimeState, requirements) => {
  const targetMoney = getRequirementValue(requirements, milestone.requirementKey);
  const currentMoney = normalizeNumber(runtimeState.money);
  const isAvailableNow = milestone.availabilityStrategy === 'prestigeThreshold'
    ? (currentMoney >= targetMoney || runtimeState.prestigeCount > 0)
    : Boolean(runtimeState[milestone.unlockStateKey]);

  const isReached = milestone.scope === 'career'
    ? runtimeState.prestigeCount > 0
    : isAvailableNow;

  const progressPercent = isReached
    ? 100
    : clampPercentage((currentMoney / Math.max(1, targetMoney)) * 100);

  const remainingRequirementText = isReached
    ? (milestone.scope === 'career' && milestone.availabilityStrategy === 'prestigeThreshold' && runtimeState.prestigeCount === 0 && currentMoney >= targetMoney
      ? 'Ready to prestige'
      : 'Unlocked')
    : formatRemainingMoney(currentMoney, targetMoney);

  return {
    ...milestone,
    targetMoney,
    progressPercent,
    currentProgressPercentage: progressPercent,
    remainingRequirementText,
    isCurrentlyUnlocked: isAvailableNow,
    isAvailableNow,
    isReached,
    canRelock: milestone.scope === 'run',
  };
};

const resolveMoneyAndPrestigeMilestone = (milestone, runtimeState, requirements) => {
  const targetMoney = getRequirementValue(requirements, milestone.requirementKey);
  const targetPrestige = getRequirementValue(requirements, milestone.secondaryRequirementKey);
  const currentMoney = normalizeNumber(runtimeState.money);
  const currentPrestigeShares = normalizeNumber(runtimeState.prestigeShares);
  const isAvailableNow = milestone.availabilityStrategy === 'runtimeBoolean'
    ? Boolean(runtimeState[milestone.unlockStateKey])
    : false;
  const isReached = isAvailableNow;

  const moneyProgress = clampPercentage((currentMoney / Math.max(1, targetMoney)) * 100);
  const prestigeProgress = clampPercentage((currentPrestigeShares / Math.max(1, targetPrestige)) * 100);
  const progressPercent = isAvailableNow
    ? 100
    : Math.min(moneyProgress, prestigeProgress);

  let remainingRequirementText;
  if (isAvailableNow) {
    remainingRequirementText = 'Unlocked';
  } else {
    const remainingParts = [];
    if (currentMoney < targetMoney) {
      remainingParts.push(formatRemainingMoneyAmount(currentMoney, targetMoney));
    }
    if (currentPrestigeShares < targetPrestige) {
      remainingParts.push(formatRemainingPrestige(currentPrestigeShares, targetPrestige));
    }
    remainingRequirementText = remainingParts.length > 0
      ? `Need ${remainingParts.join(' and ')}`
      : 'Ready to unlock';
  }

  return {
    ...milestone,
    targetMoney,
    targetPrestige,
    progressPercent,
    currentProgressPercentage: progressPercent,
    remainingRequirementText,
    isCurrentlyUnlocked: isAvailableNow,
    isAvailableNow,
    isReached,
    canRelock: milestone.scope === 'run',
  };
};

const resolverByUnlockType = {
  money: resolveMoneyMilestone,
  moneyAndPrestige: resolveMoneyAndPrestigeMilestone,
};

const resolveMilestone = (milestone, runtimeState, requirements) => {
  const resolver = resolverByUnlockType[milestone.unlockType];
  if (!resolver) {
    return {
      ...milestone,
      progressPercent: 0,
      currentProgressPercentage: 0,
      remainingRequirementText: 'Unavailable',
      isCurrentlyUnlocked: false,
      isAvailableNow: false,
      isReached: false,
      canRelock: milestone.scope === 'run',
    };
  }

  return resolver(milestone, runtimeState, requirements);
};

export default function useUnlockRoadmap({
  money,
  isInvestmentUnlocked,
  prestigeCount,
  prestigeShares,
  isCraftingUnlocked,
  requirements = {},
} = {}) {
  return useMemo(() => {
    const roadmap = Array.isArray(gameConfig.unlockRoadmap) ? gameConfig.unlockRoadmap : [];
    const runtimeState = {
      money,
      isInvestmentUnlocked: Boolean(isInvestmentUnlocked),
      prestigeCount: normalizeNumber(prestigeCount),
      prestigeShares: normalizeNumber(prestigeShares),
      isCraftingUnlocked: Boolean(isCraftingUnlocked),
    };

    const resolvedMilestones = roadmap.map((milestone) => resolveMilestone(milestone, runtimeState, requirements));
    const nextMilestone = resolvedMilestones.find((milestone) => !milestone.isReached) ?? null;

    return {
      milestones: resolvedMilestones,
      resolvedMilestones,
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
    requirements,
  ]);
}
