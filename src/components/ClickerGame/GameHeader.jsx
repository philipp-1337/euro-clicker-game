export default function GameHeader({ money }) {
    return (
      <>
        <h1 className="game-title">Euro Clicker Game</h1>
        
        <div className="money-display">
          {money.toLocaleString("en-GB", { minimumFractionDigits: 2 })} €
        </div>
      </>
    );
  }