import { useMemo } from 'react';
import { gameConfig } from '@constants/gameConfig';
import { formatNumber } from '@utils/calculators';

const clampPercentage = (value) => Math.max(0, Math.min(100, value));

const normalizeNumber = (value, fallback = 0) =>
  (typeof value === 'number' && Number.isFinite(value)) ? value : fallback;

const getMoneyProgress = (currentMoney, targetValue, isUnlocked) => {
  if (isUnlocked) return 100;
  if (targetValue <= 0) return 100;
  return clampPercentage((currentMoney / targetValue) * 100);
};

const getMoneyRequirementText = (currentMoney, targetValue, isUnlocked) => {
  if (isUnlocked) return 'Unlocked';
  const remainingMoney = Math.max(0, targetValue - currentMoney);
  return `Need ${formatNumber(remainingMoney)} € more`;
};

const getMoneyAndPrestigeRequirementText = ({
  currentMoney,
  targetMoney,
  currentPrestigeShares,
  targetPrestige,
  isUnlocked,
}) => {
  if (isUnlocked) return 'Unlocked';

  const remainingParts = [];
  const remainingMoney = Math.max(0, targetMoney - currentMoney);
  const remainingPrestige = Math.max(0, targetPrestige - currentPrestigeShares);

  if (remainingMoney > 0) {
    remainingParts.push(`${formatNumber(remainingMoney)} €`);
  }

  if (remainingPrestige > 0) {
    remainingParts.push(`${formatNumber(remainingPrestige, { decimals: 0 })} Prestige`);
  }

  if (remainingParts.length === 0) {
    return 'Ready to unlock';
  }

  return `Need ${remainingParts.join(' and ')}`;
};

const resolveMilestoneState = (milestone, state) => {
  const money = normalizeNumber(state.money);
  const prestigeCount = normalizeNumber(state.prestigeCount);
  const prestigeShares = normalizeNumber(state.prestigeShares);
  const isInvestmentUnlocked = Boolean(state.isInvestmentUnlocked);
  const isCraftingUnlocked = Boolean(state.isCraftingUnlocked);

  if (milestone.id === 'investments') {
    const targetValue = normalizeNumber(milestone.targetValue);
    const isUnlocked = isInvestmentUnlocked;
    return {
      ...milestone,
      currentProgressPercentage: getMoneyProgress(money, targetValue, isUnlocked),
      remainingRequirementText: getMoneyRequirementText(money, targetValue, isUnlocked),
      isLocked: !isUnlocked,
      isUnlocked,
    };
  }

  if (milestone.id === 'prestige') {
    const targetValue = normalizeNumber(milestone.targetValue);
    const isUnlocked = prestigeCount > 0 || money >= targetValue;
    return {
      ...milestone,
      currentProgressPercentage: getMoneyProgress(money, targetValue, isUnlocked),
      remainingRequirementText: getMoneyRequirementText(money, targetValue, isUnlocked),
      isLocked: !isUnlocked,
      isUnlocked,
    };
  }

  if (milestone.id === 'wealthProduction') {
    const targetMoney = normalizeNumber(milestone.targetValue);
    const targetPrestige = normalizeNumber(milestone.targetPrestige);
    const isUnlocked = isCraftingUnlocked;
    const moneyProgress = getMoneyProgress(money, targetMoney, isUnlocked || (money >= targetMoney && prestigeShares >= targetPrestige));
    const prestigeProgress = clampPercentage((prestigeShares / Math.max(1, targetPrestige)) * 100);
    const currentProgressPercentage = isUnlocked
      ? 100
      : Math.min(moneyProgress, prestigeProgress);

    return {
      ...milestone,
      currentProgressPercentage,
      remainingRequirementText: getMoneyAndPrestigeRequirementText({
        currentMoney: money,
        targetMoney,
        currentPrestigeShares: prestigeShares,
        targetPrestige,
        isUnlocked,
      }),
      isLocked: !isUnlocked,
      isUnlocked,
    };
  }

  return {
    ...milestone,
    currentProgressPercentage: 0,
    remainingRequirementText: 'Unavailable',
    isLocked: true,
    isUnlocked: false,
  };
};

export default function useUnlockRoadmap({
  money,
  isInvestmentUnlocked,
  prestigeCount,
  prestigeShares,
  isCraftingUnlocked,
} = {}) {
  return useMemo(() => {
    const milestones = Array.isArray(gameConfig.unlockRoadmap)
      ? gameConfig.unlockRoadmap
      : [];

    const resolvedMilestones = milestones.map((milestone) => resolveMilestoneState(milestone, {
      money,
      isInvestmentUnlocked,
      prestigeCount,
      prestigeShares,
      isCraftingUnlocked,
    }));

    const nextMilestone = resolvedMilestones.find((milestone) => milestone.isLocked) ?? null;

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
  ]);
}
