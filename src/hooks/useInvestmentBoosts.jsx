import { useCallback } from 'react';
import {
  gameConfig,
  getInvestmentBoostStateKey,
  isInvestmentBoostCompleted,
  normalizeInvestmentBoostState,
} from '@constants/gameConfig';

const getRuleTarget = (investment) => Math.max(1, investment?.boostRule?.target ?? 100);

const clampProgress = (value, target) => Math.min(target, Math.max(0, value));

const hasReserveChallengeContext = (actionContext) => {
  return Number.isFinite(actionContext?.money) || Number.isFinite(actionContext?.currentMoney);
};

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

const advanceReserveChallenge = (state, investment, amount, actionContext, timestamp) => {
  const target = getRuleTarget(investment);
  const requiredReserve = (investment?.cost ?? 0) * (investment?.boostRule?.reserveMultiplier ?? 1);
  const availableMoney = Number(actionContext?.money ?? actionContext?.currentMoney ?? 0);
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

const getProgressLabelForState = (investment, state) => {
  const target = state.requiredProgress ?? getRuleTarget(investment);
  const current = Math.min(state.currentProgress ?? 0, target);

  if (state.boosted) {
    return 'Boost complete';
  }

  switch (state.ruleType) {
    case 'timed_actions': {
      const windowSeconds = investment?.boostRule?.windowSeconds ?? 20;
      return `${current}/${target} ${investment?.boostRule?.progressLabel ?? 'actions'} in ${windowSeconds}s`;
    }
    case 'reserve_challenge': {
      const reserveAmount = Math.round((investment?.cost ?? 0) * (investment?.boostRule?.reserveMultiplier ?? 1));
      return `${current}/${target} ${investment?.boostRule?.progressLabel ?? 'checks'} with ${reserveAmount} € reserve`;
    }
    case 'manual_actions':
    default:
      return `${current}/${target} ${investment?.boostRule?.progressLabel ?? 'actions'}`;
  }
};

export default function useInvestmentBoosts(investmentBoostStates = {}, setInvestmentBoostStates) {
  const getBoostState = useCallback((index) => {
    const investment = gameConfig.investments[index];

    if (!investment) {
      return null;
    }

    return normalizeInvestmentBoostState(
      investment,
      investmentBoostStates[getInvestmentBoostStateKey(investment)]
    );
  }, [investmentBoostStates]);

  const advanceBoost = useCallback((index, actionContext = {}) => {
    const investment = gameConfig.investments[index];

    if (!investment || typeof setInvestmentBoostStates !== 'function') {
      return;
    }

    const timestamp = Number.isFinite(actionContext?.timestamp)
      ? actionContext.timestamp
      : Date.now();
    const amount = Math.max(1, actionContext?.amount ?? 1);
    const investmentId = getInvestmentBoostStateKey(investment);

    if (investment.boostRule?.type === 'reserve_challenge' && hasReserveChallengeContext(actionContext) === false) {
      return;
    }

    setInvestmentBoostStates((previousStates) => {
      const currentState = normalizeInvestmentBoostState(investment, previousStates[investmentId]);

      if (currentState.boosted) {
        return previousStates;
      }

      let nextState;
      switch (currentState.ruleType) {
        case 'timed_actions':
          nextState = advanceTimedActions(currentState, investment, amount, timestamp);
          break;
        case 'reserve_challenge':
          nextState = advanceReserveChallenge(currentState, investment, amount, actionContext, timestamp);
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
        [investmentId]: nextState,
      };
    });
  }, [setInvestmentBoostStates]);

  const isBoostCompleted = useCallback((index) => {
    const investment = gameConfig.investments[index];

    if (!investment) {
      return false;
    }

    return isInvestmentBoostCompleted(
      investment,
      investmentBoostStates[getInvestmentBoostStateKey(investment)]
    );
  }, [investmentBoostStates]);

  const getBoostProgressLabel = useCallback((index) => {
    const investment = gameConfig.investments[index];

    if (!investment) {
      return '';
    }

    const state = normalizeInvestmentBoostState(
      investment,
      investmentBoostStates[getInvestmentBoostStateKey(investment)]
    );
    return getProgressLabelForState(investment, state);
  }, [investmentBoostStates]);

  return {
    getBoostState,
    advanceBoost,
    isBoostCompleted,
    getBoostProgressLabel,
  };
}
