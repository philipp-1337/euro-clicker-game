import { useEffect, useState } from 'react';

function getRemainingWindowSeconds(boostState, now) {
  if (!boostState?.challengeWindowEndsAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((boostState.challengeWindowEndsAt - now) / 1000));
}

export default function InvestmentBoostMeter({
  investmentId,
  boostState,
  progressLabel,
  challengeText,
  getBoostState,
  getBoostProgressLabel,
}) {
  const [now, setNow] = useState(() => Date.now());
  const liveBoostState = typeof getBoostState === 'function'
    ? getBoostState(investmentId)
    : boostState;
  const liveProgressLabel = typeof getBoostProgressLabel === 'function'
    ? getBoostProgressLabel(investmentId)
    : progressLabel;

  useEffect(() => {
    if (!liveBoostState?.challengeWindowEndsAt || liveBoostState?.boosted) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => clearInterval(intervalId);
  }, [liveBoostState?.boosted, liveBoostState?.challengeWindowEndsAt]);

  const progress = liveBoostState?.requiredProgress
    ? Math.min(100, Math.max(0, (liveBoostState.currentProgress / liveBoostState.requiredProgress) * 100))
    : 0;
  const remainingWindowSeconds = getRemainingWindowSeconds(liveBoostState, now);
  const hasActiveWindow = remainingWindowSeconds > 0;
  const meterStateClass = liveBoostState?.boosted
    ? 'is-complete'
    : hasActiveWindow
      ? 'is-active-window'
      : 'is-incomplete';

  return (
    <div className={`investment-boost-meter ${meterStateClass}`}>
      <div className="investment-boost-meter__header">
        <span className="investment-boost-meter__label">
          {liveBoostState?.boosted ? 'Permanent boost active' : liveProgressLabel}
        </span>
        {liveBoostState?.boosted && (
          <span className="investment-boost-meter__badge is-complete">Completed</span>
        )}
        {!liveBoostState?.boosted && hasActiveWindow && (
          <span className="investment-boost-meter__badge is-active">
            {remainingWindowSeconds}s left
          </span>
        )}
      </div>

      <div className="investment-boost-meter__track" aria-hidden="true">
        <div
          className="investment-boost-meter__fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="investment-boost-meter__challenge">
        {liveBoostState?.boosted ? 'Income stays permanently doubled for this investment.' : challengeText}
      </p>
    </div>
  );
}
