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
  const isCurrentlyUnlocked = Boolean(isInvestmentUnlocked);
  const isReached = isCurrentlyUnlocked;
  const progressPercent = isCurrentlyUnlocked
    ? 100
    : clampPercentage((normalizeNumber(money) / Math.max(1, investmentUnlockCost)) * 100);

  return {
    id: 'investments',
    title: getMilestoneMeta('investments', { title: 'Investments' }).title,
    description: getMilestoneMeta('investments', { description: '' }).description,
    ctaLabel: getMilestoneMeta('investments', { ctaLabel: 'Unlock Investments' }).ctaLabel,
    previewText: getMilestoneMeta('investments', { previewText: '' }).previewText,
    unlockType: 'money',
    scope: 'run',
    currentProgressPercentage: progressPercent,
    remainingRequirementText: isCurrentlyUnlocked
      ? 'Unlocked'
      : formatRemainingMoney(money, investmentUnlockCost),
    isCurrentlyUnlocked,
    isReached,
    canRelock: true,
    targetMoney: investmentUnlockCost,
  };
};

const resolvePrestigeMilestone = ({ money, prestigeCount, prestigeThresholdMoney }) => {
  const currentMoney = normalizeNumber(money);
  const hasPrestiged = normalizeNumber(prestigeCount) > 0;
  const isCurrentlyUnlocked = currentMoney >= prestigeThresholdMoney;
  const isReached = hasPrestiged;
  const progressPercent = hasPrestiged
    ? 100
    : clampPercentage((currentMoney / Math.max(1, prestigeThresholdMoney)) * 100);

  let remainingRequirementText;
  if (hasPrestiged) {
    remainingRequirementText = 'Unlocked';
  } else if (isCurrentlyUnlocked) {
    remainingRequirementText = 'Ready to prestige';
  } else {
    remainingRequirementText = formatRemainingMoney(currentMoney, prestigeThresholdMoney);
  }

  return {
    id: 'prestige',
    title: getMilestoneMeta('prestige', { title: 'Prestige' }).title,
    description: getMilestoneMeta('prestige', { description: '' }).description,
    ctaLabel: getMilestoneMeta('prestige', { ctaLabel: 'Reach Prestige' }).ctaLabel,
    previewText: getMilestoneMeta('prestige', { previewText: '' }).previewText,
    unlockType: 'money',
    scope: 'career',
    currentProgressPercentage: progressPercent,
    remainingRequirementText,
    isCurrentlyUnlocked,
    isReached,
    canRelock: false,
    targetMoney: prestigeThresholdMoney,
  };
};

const resolveCraftingMilestone = ({
  money,
  prestigeShares,
  isCraftingUnlocked,
  craftingUnlockCost,
  craftingUnlockPrestige,
}) => {
  const currentMoney = normalizeNumber(money);
  const currentPrestigeShares = normalizeNumber(prestigeShares);
  const isCurrentlyUnlocked = Boolean(isCraftingUnlocked);
  const isReached = isCurrentlyUnlocked;

  const moneyProgress = clampPercentage((currentMoney / Math.max(1, craftingUnlockCost)) * 100);
  const prestigeProgress = clampPercentage((currentPrestigeShares / Math.max(1, craftingUnlockPrestige)) * 100);
  const progressPercent = isCurrentlyUnlocked ? 100 : Math.min(moneyProgress, prestigeProgress);

  let remainingRequirementText;
  if (isCurrentlyUnlocked) {
    remainingRequirementText = 'Unlocked';
  } else {
    const remainingParts = [];
    if (currentMoney < craftingUnlockCost) {
      remainingParts.push(formatRemainingMoneyAmount(currentMoney, craftingUnlockCost));
    }
    if (currentPrestigeShares < craftingUnlockPrestige) {
      remainingParts.push(formatRemainingPrestige(currentPrestigeShares, craftingUnlockPrestige));
    }
    remainingRequirementText = remainingParts.length > 0
      ? `Need ${remainingParts.join(' and ')}`
      : 'Ready to unlock';
  }

  return {
    id: 'wealthProduction',
    title: getMilestoneMeta('wealthProduction', { title: 'Wealth Production' }).title,
    description: getMilestoneMeta('wealthProduction', { description: '' }).description,
    ctaLabel: getMilestoneMeta('wealthProduction', { ctaLabel: 'Unlock Wealth Production' }).ctaLabel,
    previewText: getMilestoneMeta('wealthProduction', { previewText: '' }).previewText,
    unlockType: 'moneyAndPrestige',
    scope: 'run',
    currentProgressPercentage: progressPercent,
    remainingRequirementText,
    isCurrentlyUnlocked,
    isReached,
    canRelock: true,
    targetMoney: craftingUnlockCost,
    targetPrestige: craftingUnlockPrestige,
  };
};

export default function useUnlockRoadmap({
  money,
  isInvestmentUnlocked,
  prestigeCount,
  prestigeShares,
  isCraftingUnlocked,
  investmentUnlockCost = gameConfig.unlockInvestmentCost,
  prestigeThresholdMoney = gameConfig.prestige.minMoneyForModalButton,
  craftingUnlockCost = gameConfig.unlockCraftingCost,
  craftingUnlockPrestige = gameConfig.unlockCraftingPrestige,
} = {}) {
  return useMemo(() => {
    const milestones = [
      resolveInvestmentMilestone({ money, isInvestmentUnlocked, investmentUnlockCost }),
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
    investmentUnlockCost,
    prestigeThresholdMoney,
    craftingUnlockCost,
    craftingUnlockPrestige,
  ]);
}
