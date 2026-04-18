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
  if (milestone.id === 'investments') {
    return normalizeNumber(overrides.unlockInvestmentCost, normalizeNumber(milestone.targetValue, gameConfig.unlockInvestmentCost));
  }

  if (milestone.id === 'prestige') {
    return normalizeNumber(overrides.prestigeThresholdMoney, normalizeNumber(milestone.targetValue, gameConfig.prestige.minMoneyForModalButton));
  }

  if (milestone.id === 'wealthProduction') {
    return normalizeNumber(overrides.craftingUnlockCost, normalizeNumber(milestone.targetValue, gameConfig.unlockCraftingCost));
  }

  return normalizeNumber(milestone.targetValue);
};

const getTargetPrestige = (milestone, overrides) => {
  if (milestone.id === 'wealthProduction') {
    return normalizeNumber(overrides.craftingUnlockPrestige, normalizeNumber(milestone.targetPrestige, gameConfig.unlockCraftingPrestige));
  }

  return normalizeNumber(milestone.targetPrestige);
};

const buildMilestoneState = (milestone, values) => ({
  id: milestone.id,
  title: milestone.title ?? '',
  description: milestone.description ?? '',
  ctaLabel: milestone.ctaLabel ?? '',
  previewText: milestone.previewText ?? '',
  unlockType: milestone.unlockType,
  scope: milestone.scope,
  ...values,
});

const resolveInvestmentMilestone = (milestone, { money, isInvestmentUnlocked }, overrides) => {
  const targetValue = getTargetValue(milestone, overrides);
  const isCurrentlyUnlocked = Boolean(isInvestmentUnlocked);
  const isReached = isCurrentlyUnlocked;
  const progressPercent = isCurrentlyUnlocked
    ? 100
    : clampPercentage((normalizeNumber(money) / Math.max(1, targetValue)) * 100);

  return buildMilestoneState(milestone, {
    currentProgressPercentage: progressPercent,
    remainingRequirementText: isCurrentlyUnlocked
      ? 'Unlocked'
      : formatRemainingMoney(money, targetValue),
    isCurrentlyUnlocked,
    isReached,
    canRelock: true,
    targetValue,
  });
};

const resolvePrestigeMilestone = (milestone, { money, prestigeCount }, overrides) => {
  const currentMoney = normalizeNumber(money);
  const targetValue = getTargetValue(milestone, overrides);
  const hasPrestiged = normalizeNumber(prestigeCount) > 0;
  const isCurrentlyUnlocked = currentMoney >= targetValue;
  const isReached = hasPrestiged;
  const progressPercent = hasPrestiged
    ? 100
    : clampPercentage((currentMoney / Math.max(1, targetValue)) * 100);

  let remainingRequirementText;
  if (hasPrestiged) {
    remainingRequirementText = 'Unlocked';
  } else if (isCurrentlyUnlocked) {
    remainingRequirementText = 'Ready to prestige';
  } else {
    remainingRequirementText = formatRemainingMoney(currentMoney, targetValue);
  }

  return buildMilestoneState(milestone, {
    currentProgressPercentage: progressPercent,
    remainingRequirementText,
    isCurrentlyUnlocked,
    isReached,
    canRelock: false,
    targetValue,
  });
};

const resolveCraftingMilestone = (milestone, {
  money,
  prestigeShares,
  isCraftingUnlocked,
}, overrides) => {
  const currentMoney = normalizeNumber(money);
  const currentPrestigeShares = normalizeNumber(prestigeShares);
  const targetValue = getTargetValue(milestone, overrides);
  const targetPrestige = getTargetPrestige(milestone, overrides);
  const isCurrentlyUnlocked = Boolean(isCraftingUnlocked);
  const isReached = isCurrentlyUnlocked;

  const moneyProgress = clampPercentage((currentMoney / Math.max(1, targetValue)) * 100);
  const prestigeProgress = clampPercentage((currentPrestigeShares / Math.max(1, targetPrestige)) * 100);
  const progressPercent = isCurrentlyUnlocked ? 100 : (moneyProgress + prestigeProgress) / 2;

  let remainingRequirementText;
  if (isCurrentlyUnlocked) {
    remainingRequirementText = 'Unlocked';
  } else {
    const remainingParts = [];
    if (currentMoney < targetValue) {
      remainingParts.push(formatRemainingMoneyAmount(currentMoney, targetValue));
    }
    if (currentPrestigeShares < targetPrestige) {
      remainingParts.push(formatRemainingPrestige(currentPrestigeShares, targetPrestige));
    }
    remainingRequirementText = remainingParts.length > 0
      ? `Need ${remainingParts.join(' and ')}`
      : 'Ready to unlock';
  }

  return buildMilestoneState(milestone, {
    currentProgressPercentage: progressPercent,
    remainingRequirementText,
    isCurrentlyUnlocked,
    isReached,
    canRelock: true,
    targetValue,
    targetPrestige,
  });
};

const milestoneResolvers = {
  investments: resolveInvestmentMilestone,
  prestige: resolvePrestigeMilestone,
  wealthProduction: resolveCraftingMilestone,
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
      const resolveMilestone = milestoneResolvers[milestone.id];
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
