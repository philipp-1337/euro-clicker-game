import { useEffect, useState } from 'react';
import { Clock3, Gem, Sparkles, Factory, ShieldCheck } from 'lucide-react';
import { formatNumber } from '@utils/calculators';
import { gameConfig } from '@constants/gameConfig';

const getModeById = (recipe, modeId) => {
  const modes = Array.isArray(recipe?.productionModes) ? recipe.productionModes : [];
  return modes.find((mode) => mode.id === modeId) ?? modes[0] ?? null;
};

const formatDurationLabel = (seconds) => {
  const roundedSeconds = Math.max(0, Math.ceil(seconds));

  if (roundedSeconds >= 60) {
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  return `${roundedSeconds}s`;
};

const getDurationSeconds = (recipe, easyMode, modeId, productionHqSpeedMultiplier) => {
  const mode = getModeById(recipe, modeId);
  const baseCooldown = typeof recipe?.cooldownSeconds === 'number'
    ? recipe.cooldownSeconds
    : (gameConfig.craftingCooldownSeconds || 5);

  return baseCooldown
    * gameConfig.getCostMultiplier(easyMode)
    * (mode?.durationMultiplier ?? 1)
    * productionHqSpeedMultiplier;
};

const getBaseReward = (recipe, modeId, productionHqValueMultiplier) => {
  const mode = getModeById(recipe, modeId);
  return Math.round((recipe?.output?.money ?? 0) * (mode?.rewardMultiplier ?? 1) * productionHqValueMultiplier);
};

export default function CraftingProductionCard({
  index,
  recipe,
  rawMaterials,
  craftedCount = 0,
  recipeState,
  easyMode = false,
  getSelectedProductionMode,
  setSelectedProductionMode,
  resolveCraftOutcome,
  startCraftingProduction,
  claimCraftingProduction,
  productionHqValueMultiplier = 1,
  productionHqSpeedMultiplier = 1,
  productionHqRareChanceBonus = 0,
}) {
  const [now, setNow] = useState(() => Date.now());
  const pendingOutcome = recipeState?.pendingOutcome ?? null;
  const projectedMode = getSelectedProductionMode?.(recipe.id) ?? getModeById(recipe);
  const activeMode = pendingOutcome
    ? getModeById(recipe, pendingOutcome.modeId)
    : projectedMode;
  const activeModeId = activeMode?.id ?? projectedMode?.id;
  const standardReward = getBaseReward(recipe, activeModeId, productionHqValueMultiplier);
  const durationSeconds = getDurationSeconds(recipe, easyMode, activeModeId, productionHqSpeedMultiplier);
  const canStart = recipe.materials.every((material) => (rawMaterials?.[material.id] || 0) >= material.quantity);
  const completionTime = pendingOutcome?.completionTime ?? null;
  const isPending = Number.isFinite(completionTime);
  const isReady = isPending && now >= completionTime;
  const qualityWindowMs = recipe?.qualityBonusWindowMs ?? 0;
  const qualityWindowEndsAt = isPending ? completionTime + qualityWindowMs : null;
  const qualityWindowActive = isReady && Number.isFinite(qualityWindowEndsAt) && now <= qualityWindowEndsAt;
  const secondsUntilClaim = isPending && !isReady
    ? Math.ceil((completionTime - now) / 1000)
    : 0;
  const qualitySecondsLeft = qualityWindowActive
    ? Math.ceil((qualityWindowEndsAt - now) / 1000)
    : 0;
  const startedAt = isPending ? completionTime - (durationSeconds * 1000) : null;
  const progressPercent = isPending && startedAt
    ? Math.max(0, Math.min(100, ((now - startedAt) / (durationSeconds * 1000)) * 100))
    : 0;
  const liveOutcome = isPending
    ? resolveCraftOutcome?.(
      { ...recipe, selectedModeId: activeModeId },
      completionTime,
      isReady ? now : completionTime
    )
    : null;
  const perfectOutcome = resolveCraftOutcome?.(
    { ...recipe, selectedModeId: activeModeId },
    isPending ? completionTime : now + (durationSeconds * 1000),
    isPending ? completionTime : now + (durationSeconds * 1000)
  );
  const rarePreviewMoney = perfectOutcome?.rareBonusApplied
    ? perfectOutcome.money
    : Math.round(
      standardReward
      * (recipe?.qualityMultiplier ?? 1)
      * (recipe?.rareBonusMultiplier ?? 1)
    );
  const effectiveRareChance = Math.max(0, Math.min(1, (recipe?.rareBonusChance ?? 0) + productionHqRareChanceBonus));

  useEffect(() => {
    if (!isPending) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => clearInterval(intervalId);
  }, [isPending]);

  return (
    <article className={`crafting-production-card${isReady ? ' is-ready' : ''}${isPending && !isReady ? ' is-pending' : ''}`}>
      <div className="crafting-production-card__header">
        <div className="crafting-production-card__identity">
          <span className="crafting-production-card__eyebrow">Production Route</span>
          <h3>{recipe.name}</h3>
          <p>
            In inventory: <strong>{craftedCount}</strong>
          </p>
        </div>
        <div className="crafting-production-card__status-pill">
          {isReady ? 'Ready to Claim' : isPending ? `In Production · ${secondsUntilClaim}s` : 'Idle'}
        </div>
      </div>

      <div className="crafting-production-card__materials">
        {recipe.materials.map((material) => {
          const owned = rawMaterials?.[material.id] || 0;
          const hasEnough = owned >= material.quantity;

          return (
            <div
              key={`${recipe.id}-${material.id}`}
              className={`crafting-production-card__material${hasEnough ? ' is-satisfied' : ' is-missing'}`}
            >
              <span>{material.quantity}x {gameConfig.rawMaterials.find((entry) => entry.id === material.id)?.name || material.id}</span>
              <strong>{owned}</strong>
            </div>
          );
        })}
      </div>

      <div className="crafting-production-card__modes">
        <div className="crafting-production-card__section-title">Production Mode</div>
        <div className="crafting-mode-selector">
          {(recipe.productionModes || []).map((mode) => (
            <button
              key={`${recipe.id}-${mode.id}`}
              type="button"
              className={`crafting-mode-button ${activeModeId === mode.id ? 'active' : ''}`}
              disabled={isPending}
              onClick={() => setSelectedProductionMode?.(recipe.id, mode.id)}
            >
              <span>{mode.label}</span>
              <small>{formatDurationLabel(getDurationSeconds(recipe, easyMode, mode.id, productionHqSpeedMultiplier))}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="crafting-production-card__projection-grid">
        <div className="crafting-production-card__projection">
          <Clock3 size={16} />
          <div>
            <span>Voraussichtliche Dauer</span>
            <strong>{formatDurationLabel(durationSeconds)}</strong>
          </div>
        </div>
        <div className="crafting-production-card__projection">
          <Factory size={16} />
          <div>
            <span>Standardergebnis</span>
            <strong>{formatNumber(standardReward)} €</strong>
          </div>
        </div>
        <div className="crafting-production-card__projection">
          <Sparkles size={16} />
          <div>
            <span>Timing Bonus Window</span>
            <strong>
              {qualityWindowMs > 0
                ? `${formatDurationLabel(qualityWindowMs / 1000)} for ${formatNumber(Math.round(standardReward * (recipe?.qualityMultiplier ?? 1)))} €`
                : 'No timing bonus'}
            </strong>
          </div>
        </div>
        <div className="crafting-production-card__projection">
          <Gem size={16} />
          <div>
            <span>Rare Result</span>
            <strong>
              {recipe?.rareBonusChance > 0
                ? `${Math.round(effectiveRareChance * 100)}% chance for up to ${formatNumber(rarePreviewMoney)} €`
                : 'No rare result'}
            </strong>
          </div>
        </div>
      </div>

      {!isPending && (
        <div className="crafting-production-card__hint">
          <ShieldCheck size={16} />
          <p>
            {qualityWindowMs > 0
              ? `Claim right after completion to lock in the timing bonus. ${activeMode?.label} trades ${activeMode?.durationMultiplier < 1 ? 'speed for reward' : 'higher reward for a longer run time'}.`
              : `${activeMode?.label} runs on a fixed route without a timing window.`}
          </p>
        </div>
      )}

      {isPending && (
        <div className="crafting-production-card__pending-panel">
          {!isReady ? (
            <>
              <div className="crafting-production-card__pending-summary">
                <span>Current Batch</span>
                <strong>{activeMode?.label}</strong>
              </div>
              <div className="crafting-production-card__progress-track" aria-hidden="true">
                <div
                  className="crafting-production-card__progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p>
                Claim in <strong>{formatDurationLabel(secondsUntilClaim)}</strong>. The timing bonus window starts immediately after completion.
              </p>
            </>
          ) : (
            <>
              <div className="crafting-production-card__claim-banner">
                <span>Claim Result</span>
                <strong>{formatNumber(liveOutcome?.money ?? standardReward)} €</strong>
              </div>
              <div className="crafting-production-card__claim-breakdown">
                <div>
                  <span>Standardergebnis</span>
                  <strong>{formatNumber(standardReward)} €</strong>
                </div>
                <div>
                  <span>Timing Bonus</span>
                  <strong>
                    {liveOutcome?.qualityBonusApplied
                      ? `Active · ${qualitySecondsLeft}s left`
                      : (qualityWindowMs > 0 ? 'Expired' : 'Unavailable')}
                  </strong>
                </div>
                <div>
                  <span>Rare Result</span>
                  <strong>
                    {liveOutcome?.rareBonusApplied
                      ? `Included · total ${formatNumber(liveOutcome.money)} €`
                      : (recipe?.rareBonusChance > 0 ? 'Not triggered this time' : 'No rare result')}
                  </strong>
                </div>
              </div>
              <p className="crafting-production-card__claim-copy">
                {liveOutcome?.qualityBonusApplied
                  ? 'Claim now to secure the timing bonus before the quality window closes.'
                  : 'The batch can still be claimed, but the timing window has already expired.'}
              </p>
            </>
          )}
        </div>
      )}

      <div className="crafting-production-card__actions">
        {isReady ? (
          <button
            type="button"
            className={`premium-upgrade-button crafting-claim-button${liveOutcome?.qualityBonusApplied ? ' is-quality' : ''}${liveOutcome?.rareBonusApplied ? ' is-rare' : ''}`}
            onClick={() => claimCraftingProduction?.(index)}
          >
            {liveOutcome?.rareBonusApplied
              ? `Claim Rare Finish · ${formatNumber(liveOutcome.money)} €`
              : liveOutcome?.qualityBonusApplied
                ? `Claim Quality Finish · ${formatNumber(liveOutcome.money)} €`
                : `Claim Standard Batch · ${formatNumber(liveOutcome?.money ?? standardReward)} €`}
          </button>
        ) : (
          <button
            type="button"
            className={`premium-upgrade-button crafting-start-button ${(!canStart || isPending) ? 'disabled' : ''}`}
            disabled={!canStart || isPending}
            onClick={() => startCraftingProduction?.(index)}
          >
            {isPending
              ? `In Production · ${secondsUntilClaim}s`
              : `Start ${activeMode?.label}`}
          </button>
        )}
      </div>
    </article>
  );
}
