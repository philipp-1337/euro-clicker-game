import { useCallback } from 'react';
import {
  getCraftingProductionModeById,
  getCraftingRecipeById,
  normalizeCraftingProductionState,
} from '@constants/gameConfig';

const QUALITY_WINDOW_BUFFER_MS = 0;

const createDeterministicRoll = (input) => {
  const text = String(input ?? '');
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index);
    hash |= 0;
  }

  return (Math.abs(hash) % 10000) / 10000;
};

export default function useCraftingProductionMode(
  craftingProductionState = {},
  setCraftingProductionState,
  productionHqValueMultiplier = 1,
  productionHqRareChanceBonus = 0,
) {
  const getNormalizedState = useCallback(() => {
    return normalizeCraftingProductionState(craftingProductionState);
  }, [craftingProductionState]);

  const getSelectedMode = useCallback((recipeId) => {
    const recipe = getCraftingRecipeById(recipeId);

    if (!recipe) {
      return null;
    }

    const normalizedState = getNormalizedState();
    return getCraftingProductionModeById(
      recipe,
      normalizedState[recipeId]?.selectedModeId
    );
  }, [getNormalizedState]);

  const setSelectedMode = useCallback((recipeId, modeId) => {
    const recipe = getCraftingRecipeById(recipeId);

    if (!recipe || typeof setCraftingProductionState !== 'function') {
      return;
    }

    const normalizedMode = getCraftingProductionModeById(recipe, modeId);

    setCraftingProductionState((previousState) => {
      const normalizedState = normalizeCraftingProductionState(previousState);
      return {
        ...normalizedState,
        [recipeId]: {
          ...normalizedState[recipeId],
          selectedModeId: normalizedMode.id,
        },
      };
    });
  }, [setCraftingProductionState]);

  const resolveCraftOutcome = useCallback((recipeInput, completionTime, claimTime = Date.now()) => {
    const recipe = typeof recipeInput === 'string'
      ? getCraftingRecipeById(recipeInput)
      : recipeInput;

    if (!recipe) {
      return null;
    }

    const normalizedCompletionTime = Number.isFinite(completionTime)
      ? completionTime
      : claimTime;
    const normalizedClaimTime = Number.isFinite(claimTime)
      ? claimTime
      : normalizedCompletionTime;
    const mode = getCraftingProductionModeById(
      recipe,
      recipe?.selectedModeId ?? getSelectedMode(recipe.id)?.id
    );
    const baseMoney = Math.max(0, recipe?.output?.money ?? 0);
    const qualityBonusApplied = (
      Number.isFinite(recipe?.qualityBonusWindowMs)
      && recipe.qualityBonusWindowMs > 0
      && normalizedClaimTime <= normalizedCompletionTime + recipe.qualityBonusWindowMs + QUALITY_WINDOW_BUFFER_MS
    );
    const qualityMultiplier = qualityBonusApplied
      ? (recipe?.qualityMultiplier ?? 1)
      : 1;
    const rareRoll = createDeterministicRoll(`${recipe.id}:${mode?.id}:${normalizedCompletionTime}`);
    const rareChance = Math.max(0, Math.min(1, (recipe?.rareBonusChance ?? 0) + productionHqRareChanceBonus));
    const rareBonusApplied = rareRoll < rareChance;
    const rareMultiplier = rareBonusApplied
      ? (recipe?.rareBonusMultiplier ?? 1)
      : 1;
    const modeRewardMultiplier = mode?.rewardMultiplier ?? 1;
    const durationMultiplier = mode?.durationMultiplier ?? 1;

    return {
      recipeId: recipe.id,
      modeId: mode?.id ?? getCraftingProductionModeById(recipe)?.id,
      completionTime: normalizedCompletionTime,
      claimTime: normalizedClaimTime,
      qualityBonusApplied,
      rareBonusApplied,
      baseMoney,
      qualityMultiplier,
      rareChance,
      rareMultiplier,
      modeRewardMultiplier,
      durationMultiplier,
      money: Math.round(baseMoney * modeRewardMultiplier * qualityMultiplier * rareMultiplier * productionHqValueMultiplier),
    };
  }, [getSelectedMode, productionHqRareChanceBonus, productionHqValueMultiplier]);

  return {
    getSelectedMode,
    setSelectedMode,
    resolveCraftOutcome,
  };
}
