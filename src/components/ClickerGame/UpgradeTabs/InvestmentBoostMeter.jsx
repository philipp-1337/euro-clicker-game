import { useEffect, useState } from 'react';

function getRemainingWindowSeconds(boostState, now) {
  if (!boostState?.challengeWindowEndsAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((boostState.challengeWindowEndsAt - now) / 1000));
}

export default function InvestmentBoostMeter({
  boostState,
  progressLabel,
  challengeText,
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!boostState?.challengeWindowEndsAt || boostState?.boosted) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => clearInterval(intervalId);
  }, [boostState?.boosted, boostState?.challengeWindowEndsAt]);

  const progress = boostState?.requiredProgress
    ? Math.min(100, Math.max(0, (boostState.currentProgress / boostState.requiredProgress) * 100))
    : 0;
  const remainingWindowSeconds = getRemainingWindowSeconds(boostState, now);
  const hasActiveWindow = remainingWindowSeconds > 0;
  const meterStateClass = boostState?.boosted
    ? 'is-complete'
    : hasActiveWindow
      ? 'is-active-window'
      : 'is-incomplete';

  return (
    <div className={`investment-boost-meter ${meterStateClass}`}>
      <div className="investment-boost-meter__header">
        <span className="investment-boost-meter__label">
          {boostState?.boosted ? 'Permanent boost active' : progressLabel}
        </span>
        {boostState?.boosted && (
          <span className="investment-boost-meter__badge is-complete">Completed</span>
        )}
        {!boostState?.boosted && hasActiveWindow && (
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
        {boostState?.boosted ? 'Income stays permanently doubled for this investment.' : challengeText}
      </p>
    </div>
  );
}
