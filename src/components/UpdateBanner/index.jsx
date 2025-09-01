export default function UpdateBanner({ onUpdate }) {
  return (
    <div className="update-banner">
      <span>A new version of the game is available!</span>
      <button onClick={onUpdate}>Save & Refresh</button>
    </div>
  );
}
