import React from "react";

const BetaEndBanner = () => {
  const isBeta = 
    window.location.hostname.includes("beta") || window.location.hostname.includes("localhost");

  if (!isBeta) {
    return null;
  }

  return (
    <div className="beta-end-banner">
      <p>
        The Beta will be shut down soon. Please use only the <a href="https://euro-clicker-game.web.app">main version</a> from now on. You can transfer your game progress using the Cloud Save feature (Settings).
      </p>
    </div>
  );
};

export default BetaEndBanner;
