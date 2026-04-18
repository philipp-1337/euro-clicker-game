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

const getMilestoneMeta = (id, fallback) =>
  gameConfig.unlockRoadmap.find((milestone) => milestone.id === id) ?? fallback;

const resolveInvestmentMilestone = ({ money, isInvestmentUnlocked, investmentUnlockCost }) => {
  const configInvestmentMeta = getMilestoneMeta('investments', {});
  const targetValue = normalizeNumber(investmentUnlockCost, normalizeNumber(configInvestmentMeta.targetValue, gameConfig.unlockInvestmentCost));
  const isCurrentlyUnlocked = Boolean(isInvestmentUnlocked);
  const isReached = isCurrentlyUnlocked;
  const progressPercent = isCurrentlyUnlocked
    ? 100
    : clampPercentage((normalizeNumber(money) / Math.max(1, targetValue)) * 100);

  return {
    id: 'investments',
    title: configInvestmentMeta.title ?? 'Investments',
    description: configInvestmentMeta.description ?? '',
    ctaLabel: configInvestmentMeta.ctaLabel ?? 'Unlock Investments',
    previewText: configInvestmentMeta.previewText ?? '',
    unlockType: 'money',
    scope: 'run',
    currentProgressPercentage: progressPercent,
    remainingRequirementText: isCurrentlyUnlocked
      ? 'Unlocked'
      : formatRemainingMoney(money, targetValue),
    isCurrentlyUnlocked,
    isReached,
    canRelock: true,
    targetValue,
  };
};

const resolvePrestigeMilestone = ({ money, prestigeCount, prestigeThresholdMoney }) => {
  const currentMoney = normalizeNumber(money);
  const configPrestigeMeta = getMilestoneMeta('prestige', {});
  const targetValue = normalizeNumber(prestigeThresholdMoney, normalizeNumber(configPrestigeMeta.targetValue, gameConfig.prestige.minMoneyForModalButton));
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

  return {
    id: 'prestige',
    title: configPrestigeMeta.title ?? 'Prestige',
    description: configPrestigeMeta.description ?? '',
    ctaLabel: configPrestigeMeta.ctaLabel ?? 'Reach Prestige',
    previewText: configPrestigeMeta.previewText ?? '',
    unlockType: 'money',
    scope: 'career',
    currentProgressPercentage: progressPercent,
    remainingRequirementText,
    isCurrentlyUnlocked,
    isReached,
    canRelock: false,
    targetValue,
  };
};

const resolveCraftingMilestone = ({
  money,
  prestigeShares,
  isCraftingUnlocked,
  craftingUnlockCost,
  craftingUnlockPrestige,
}) => {
  const configCraftingMeta = getMilestoneMeta('wealthProduction', {});
  const currentMoney = normalizeNumber(money);
  const currentPrestigeShares = normalizeNumber(prestigeShares);
  const targetValue = normalizeNumber(craftingUnlockCost, normalizeNumber(configCraftingMeta.targetValue, gameConfig.unlockCraftingCost));
  const targetPrestige = normalizeNumber(craftingUnlockPrestige, normalizeNumber(configCraftingMeta.targetPrestige, gameConfig.unlockCraftingPrestige));
  const isCurrentlyUnlocked = Boolean(isCraftingUnlocked);
  const isReached = isCurrentlyUnlocked;

  const moneyProgress = clampPercentage((currentMoney / Math.max(1, targetValue)) * 100);
  const prestigeProgress = clampPercentage((currentPrestigeShares / Math.max(1, targetPrestige)) * 100);
  const progressPercent = isCurrentlyUnlocked ? 100 : Math.min(moneyProgress, prestigeProgress);

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

  return {
    id: 'wealthProduction',
    title: configCraftingMeta.title ?? 'Wealth Production',
    description: configCraftingMeta.description ?? '',
    ctaLabel: configCraftingMeta.ctaLabel ?? 'Unlock Wealth Production',
    previewText: configCraftingMeta.previewText ?? '',
    unlockType: 'moneyAndPrestige',
    scope: 'run',
    currentProgressPercentage: progressPercent,
    remainingRequirementText,
    isCurrentlyUnlocked,
    isReached,
    canRelock: true,
    targetValue,
    targetPrestige,
  };
};

export default function useUnlockRoadmap({
  money,
  isInvestmentUnlocked,
  prestigeCount,
  prestigeShares,
  isCraftingUnlocked,
  currentInvestmentUnlockCost,
  prestigeThresholdMoney = gameConfig.prestige.minMoneyForModalButton,
  craftingUnlockCost = gameConfig.unlockCraftingCost,
  craftingUnlockPrestige = gameConfig.unlockCraftingPrestige,
} = {}) {
  return useMemo(() => {
    const configInvestmentTarget = normalizeNumber(getMilestoneMeta('investments', {}).targetValue, gameConfig.unlockInvestmentCost);
    const resolvedInvestmentUnlockCost = normalizeNumber(
      currentInvestmentUnlockCost,
      configInvestmentTarget
    );
    const milestones = [
      resolveInvestmentMilestone({ money, isInvestmentUnlocked, investmentUnlockCost: resolvedInvestmentUnlockCost }),
      resolvePrestigeMilestone({ money, prestigeCount, prestigeThresholdMoney }),
      resolveCraftingMilestone({
        money,
        prestigeShares,
        isCraftingUnlocked,
        craftingUnlockCost,
        craftingUnlockPrestige,
      }),
    ];

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
    currentInvestmentUnlockCost,
    prestigeThresholdMoney,
    craftingUnlockCost,
    craftingUnlockPrestige,
  ]);
}
