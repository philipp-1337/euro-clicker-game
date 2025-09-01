import { formatNumber } from '@utils/calculators'; // Import formatNumber

export default function FloatingClickButton({
  onClick,
  centerMode = false,
  isCritical = false,
  criticalHitAnimations = [],
  floatingClickValue = 1,
}) {
  // The outer div will handle the fixed/absolute positioning and centerMode class
  // The inner div with position: relative is for the animated amounts relative to the button
  return (
    <div className={`floating-click-button-container${centerMode ? ' center-mode' : ''}`}>
      <div style={{ position: 'relative', display: 'inline-block', width: '100%', height: '100%' }}> {/* For positioning amounts */}
        <button
          onClick={onClick}
          className={`floating-click-button-actual${isCritical ? ' critical-hit' : ''}`}
          aria-label="Quick Euro Button"
        >
          +{formatNumber(floatingClickValue, {decimals: 0})} €
        </button>
        {criticalHitAnimations.map(anim => (
          <span key={anim.id} className="critical-hit-amount">
            +{formatNumber(anim.amount)}€
          </span>
        ))}
      </div>
    </div>
  );
}