import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export default function UnlockRoadmapCard({ milestone, onDismiss }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!milestone) {
    return null;
  }

  const progressValue = Math.max(
    0,
    Math.min(100, Math.round(milestone.currentProgressPercentage ?? 0))
  );
  const isReady = milestone.status === 'ready';
  const isUnlocked = milestone.status === 'unlocked';
  const isNearMiss = !isReady && !isUnlocked && progressValue >= 85;
  const isEmphasized = isReady || isNearMiss;
  const canDismiss = !isEmphasized;
  const showAutoPreview = isEmphasized && !isExpanded;
  const shouldShowDetails = isExpanded;
  const isCompact = !isEmphasized && !isExpanded;
  const stateLabel = isReady
    ? 'Ready now'
    : isNearMiss
      ? 'Almost there'
      : 'Next Milestone';
  const detailId = `unlock-roadmap-card-details-${milestone.id}`;
  const compactProgressLabel = milestone.compactProgressTextPrefix
    ? `${milestone.compactProgressTextPrefix} ${milestone.remainingRequirementText.replace(/^Needs\s+/i, '')}`
    : `${milestone.remainingRequirementText} for ${milestone.title}`;
  const progressLabel = isReady
    ? milestone.readyLabel ?? 'Ready'
    : isCompact
      ? compactProgressLabel
      : milestone.remainingRequirementText;

  return (
    <section
      className={`unlock-roadmap-card${isEmphasized ? ' is-emphasized' : ''}${isReady ? ' is-ready' : ''}${isCompact ? ' is-compact' : ''}`}
      aria-label={`${milestone.title} unlock progress`}
    >
      <div className="unlock-roadmap-card__summary">
        <div className="unlock-roadmap-card__summary-copy">
          <p className="unlock-roadmap-card__eyebrow">{stateLabel}</p>
          <h3 className="unlock-roadmap-card__title">{milestone.title}</h3>
        </div>
        <div className="unlock-roadmap-card__summary-actions">
          {typeof onDismiss === 'function' && canDismiss && (
            <button
              type="button"
              className="unlock-roadmap-card__dismiss"
              onClick={onDismiss}
              aria-label="Hide milestone banner"
              title="Hide milestone banner"
            >
              <X size={16} />
            </button>
          )}
          <span
            className={`unlock-roadmap-card__status${isUnlocked ? ' is-unlocked' : ''}${isReady ? ' is-ready' : ''}`}
          >
            {isReady ? milestone.ctaLabel : `${progressValue}%`}
          </span>
          <button
            type="button"
            className="unlock-roadmap-card__toggle"
            onClick={() => setIsExpanded((previousState) => !previousState)}
            aria-expanded={isExpanded}
            aria-controls={detailId}
            aria-label={isExpanded ? 'Hide milestone details' : 'Show milestone details'}
          >
            <span className="unlock-roadmap-card__toggle-label">
              {isExpanded ? 'Less' : 'More'}
            </span>
            <span className="unlock-roadmap-card__caret" aria-hidden="true">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>
        </div>
      </div>

      <div className="unlock-roadmap-card__progress-copy">
        <span>{progressLabel}</span>
      </div>

      <div
        className="unlock-roadmap-card__progress-bar"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progressValue}
        aria-valuetext={isReady ? milestone.ctaLabel : milestone.remainingRequirementText}
      >
        <span
          className="unlock-roadmap-card__progress-fill"
          style={{ width: `${progressValue}%` }}
        />
      </div>

      {showAutoPreview && (
        <p className="unlock-roadmap-card__preview unlock-roadmap-card__preview--inline">
          {milestone.previewText}
        </p>
      )}

      {shouldShowDetails && (
        <div id={detailId} className="unlock-roadmap-card__details">
          <p className="unlock-roadmap-card__preview">{milestone.previewText}</p>
          <p className="unlock-roadmap-card__description">{milestone.description}</p>
        </div>
      )}
    </section>
  );
}
