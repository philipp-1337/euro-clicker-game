import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function UnlockRoadmapCard({ milestone }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!milestone) {
    return null;
  }

  const progressValue = Math.max(
    0,
    Math.min(100, Math.round(milestone.currentProgressPercentage ?? 0))
  );

  return (
    <section
      className="unlock-roadmap-card"
      aria-label={`${milestone.title} roadmap progress`}
    >
      <button
        type="button"
        className="unlock-roadmap-card__toggle"
        onClick={() => setIsExpanded((previousState) => !previousState)}
        aria-expanded={isExpanded}
      >
        <div className={`unlock-roadmap-card__toggle-row${isExpanded ? ' is-expanded' : ''}`}>
          <p className="unlock-roadmap-card__eyebrow">Next milestone</p>
          <span className="unlock-roadmap-card__caret" aria-hidden="true">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </button>

      {isExpanded && (
        <>
          <div className="unlock-roadmap-card__header">
            <div>
              <h3 className="unlock-roadmap-card__title">{milestone.title}</h3>
            </div>
            <div className="unlock-roadmap-card__header-actions">
              <span
                className={`unlock-roadmap-card__status${milestone.status === 'unlocked' ? ' is-unlocked' : ''}${milestone.status === 'ready' ? ' is-ready' : ''}`}
              >
                {milestone.statusLabel}
              </span>
            </div>
          </div>

          <p className="unlock-roadmap-card__description">{milestone.description}</p>

          <div className="unlock-roadmap-card__progress-copy">
            <span>{milestone.remainingRequirementText}</span>
            <span>{progressValue}%</span>
          </div>

          <div
            className="unlock-roadmap-card__progress-bar"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progressValue}
            aria-valuetext={milestone.remainingRequirementText}
          >
            <span
              className="unlock-roadmap-card__progress-fill"
              style={{ width: `${progressValue}%` }}
            />
          </div>

          <p className="unlock-roadmap-card__preview">{milestone.previewText}</p>
        </>
      )}
    </section>
  );
}
