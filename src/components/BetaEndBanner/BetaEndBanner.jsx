const BetaEndBanner = () => {
  const isBeta = 
    window.location.hostname.includes("beta");

  if (!isBeta) {
    return null;
  }

  return (
    <div className="beta-end-banner">
      <p>
        The Beta will be shut down soon and will no longer be updated. Please switch to euro-clicker-game.web.app (you may need to clear your cache). You can transfer your progress via the Cloud Save feature in Settings.
      </p>
    </div>
  );
};

export default BetaEndBanner;
