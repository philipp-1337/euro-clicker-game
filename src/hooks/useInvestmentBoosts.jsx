import { useCallback } from 'react';
import {
  gameConfig,
  getEffectiveInvestmentCost,
  getInvestmentById,
  getInvestmentBoostStateKey,
  isInvestmentBoostCompleted,
  normalizeInvestmentBoostState,
} from '@constants/gameConfig';

const getRuleTarget = (investment) => Math.max(1, investment?.boostRule?.target ?? 100);

const clampProgress = (value, target) => Math.min(target, Math.max(0, value));

const hasReserveChallengeContext = (actionContext) => {
  return Number.isFinite(actionContext?.availableMoney);
};

const resolveInvestment = (identifier) => {
  if (typeof identifier === 'number') {
    return gameConfig.investments[identifier] ?? null;
  }

  return getInvestmentById(identifier, gameConfig.investments);
};

const PURCHASE_TRIGGERS = new Set([
  'investment_purchase',
  'manager_purchase',
  'material_purchase',
  'upgrade_purchase',
]);

const buildCompletedState = (state, target, timestamp) => ({
  ...state,
  boosted: true,
  currentProgress: target,
  bestProgress: Math.max(state.bestProgress ?? 0, target),
  completedAt: state.completedAt ?? timestamp,
  lastAdvancedAt: timestamp,
});

const advanceManualActions = (state, target, amount, timestamp) => {
  const nextProgress = clampProgress((state.currentProgress ?? 0) + amount, target);
  const nextState = {
    ...state,
    currentProgress: nextProgress,
    bestProgress: Math.max(state.bestProgress ?? 0, nextProgress),
    lastAdvancedAt: timestamp,
  };

  return nextProgress >= target
    ? buildCompletedState(nextState, target, timestamp)
    : nextState;
};

const advanceTimedActions = (state, investment, amount, timestamp) => {
  const target = getRuleTarget(investment);
  const windowMs = Math.max(1, (investment?.boostRule?.windowSeconds ?? 20) * 1000);
  const previousWindowEndsAt = state.challengeWindowEndsAt ?? 0;
  const isWindowActive = previousWindowEndsAt > timestamp;
  const windowStartedAt = isWindowActive ? state.challengeWindowStartedAt : timestamp;
  const nextProgress = clampProgress(
    (isWindowActive ? state.currentProgress : 0) + amount,
    target
  );

  const nextState = {
    ...state,
    currentProgress: nextProgress,
    bestProgress: Math.max(state.bestProgress ?? 0, nextProgress),
    challengeWindowStartedAt: windowStartedAt,
    challengeWindowEndsAt: windowStartedAt + windowMs,
    lastAdvancedAt: timestamp,
  };

  return nextProgress >= target
    ? buildCompletedState(nextState, target, timestamp)
    : nextState;
};

const advanceReserveChallenge = (state, investment, amount, actionContext, timestamp, effectiveCost) => {
  const target = getRuleTarget(investment);
  const requiredReserve = effectiveCost * (investment?.boostRule?.reserveMultiplier ?? 1);
  const availableMoney = Number(actionContext?.availableMoney ?? 0);
  const qualifies = availableMoney >= requiredReserve;
  const nextProgress = qualifies
    ? clampProgress((state.currentProgress ?? 0) + amount, target)
    : 0;

  const nextState = {
    ...state,
    currentProgress: nextProgress,
    bestProgress: Math.max(state.bestProgress ?? 0, nextProgress),
    challengeWindowStartedAt: qualifies ? (state.challengeWindowStartedAt ?? timestamp) : null,
    challengeWindowEndsAt: null,
    lastAdvancedAt: timestamp,
  };

  return nextProgress >= target
    ? buildCompletedState(nextState, target, timestamp)
    : nextState;
};

const getProgressLabelForState = (investment, state, effectiveCost) => {
  const target = state.requiredProgress ?? getRuleTarget(investment);
  const current = Math.min(state.currentProgress ?? 0, target);

  if (state.boosted) {
    return 'Boost completed';
  }

  switch (state.ruleType) {
    case 'timed_actions': {
      const windowSeconds = investment?.boostRule?.windowSeconds ?? 20;
      return `${current}/${target} ${investment?.boostRule?.progressLabel ?? 'actions'} in ${windowSeconds}s`;
    }
    case 'reserve_challenge': {
      const reserveAmount = Math.round(effectiveCost * (investment?.boostRule?.reserveMultiplier ?? 1));
      return `${current}/${target} ${investment?.boostRule?.progressLabel ?? 'checks'} with ${reserveAmount} € reserve`;
    }
    case 'manual_actions':
    default:
      return `${current}/${target} ${investment?.boostRule?.progressLabel ?? 'actions'}`;
  }
};

export default function useInvestmentBoosts(
  investmentBoostStates = {},
  setInvestmentBoostStates,
  options = {}
) {
  const resolveEffectiveCost = useCallback((investment) => {
    if (typeof options.getEffectiveInvestmentCost === 'function') {
      return options.getEffectiveInvestmentCost(investment);
    }

    return getEffectiveInvestmentCost(investment);
  }, [options]);

  const getBoostState = useCallback((identifier) => {
    const investment = resolveInvestment(identifier);

    if (!investment) {
      return null;
    }

    return normalizeInvestmentBoostState(
      investment,
      investmentBoostStates[getInvestmentBoostStateKey(investment)]
    );
  }, [investmentBoostStates]);

  const advanceBoost = useCallback((identifier, actionContext = {}) => {
    const investment = resolveInvestment(identifier);

    if (!investment || typeof setInvestmentBoostStates !== 'function') {
      return;
    }

    const timestamp = Number.isFinite(actionContext?.timestamp)
      ? actionContext.timestamp
      : Date.now();
    const amount = Math.max(1, actionContext?.amount ?? 1);
    const investmentStateKey = getInvestmentBoostStateKey(investment);
    const effectiveCost = resolveEffectiveCost(investment);
    const trigger = actionContext?.trigger ?? 'manual';

    if (
      investment.boostRule?.type === 'manual_actions'
      && trigger !== 'manual'
      && PURCHASE_TRIGGERS.has(trigger) === false
    ) {
      return;
    }

    if (investment.boostRule?.type === 'timed_actions' && PURCHASE_TRIGGERS.has(trigger) === false) {
      return;
    }

    if (
      investment.boostRule?.type === 'reserve_challenge'
      && (PURCHASE_TRIGGERS.has(trigger) === false || hasReserveChallengeContext(actionContext) === false)
    ) {
      return;
    }

    setInvestmentBoostStates((previousStates) => {
      const currentState = normalizeInvestmentBoostState(investment, previousStates[investmentStateKey]);

      if (currentState.boosted) {
        return previousStates;
      }

      let nextState;
      switch (currentState.ruleType) {
        case 'timed_actions':
          nextState = advanceTimedActions(currentState, investment, amount, timestamp);
          break;
        case 'reserve_challenge':
          nextState = advanceReserveChallenge(
            currentState,
            investment,
            amount,
            actionContext,
            timestamp,
            effectiveCost
          );
          break;
        case 'manual_actions':
        default:
          nextState = advanceManualActions(
            currentState,
            getRuleTarget(investment),
            amount,
            timestamp
          );
          break;
      }

      return {
        ...previousStates,
        [investmentStateKey]: nextState,
      };
    });
  }, [resolveEffectiveCost, setInvestmentBoostStates]);

  const isBoostCompleted = useCallback((identifier) => {
    const investment = resolveInvestment(identifier);

    if (!investment) {
      return false;
    }

    return isInvestmentBoostCompleted(
      investment,
      investmentBoostStates[getInvestmentBoostStateKey(investment)]
    );
  }, [investmentBoostStates]);

  const getBoostProgressLabel = useCallback((identifier) => {
    const investment = resolveInvestment(identifier);

    if (!investment) {
      return '';
    }

    const state = normalizeInvestmentBoostState(
      investment,
      investmentBoostStates[getInvestmentBoostStateKey(investment)]
    );
    return getProgressLabelForState(investment, state, resolveEffectiveCost(investment));
  }, [investmentBoostStates, resolveEffectiveCost]);

  return {
    getBoostState,
    advanceBoost,
    isBoostCompleted,
    getBoostProgressLabel,
  };
}
