import { formatNumber } from '@utils/calculators';

export default function GameHeader({ money }) {
  return (
    <>
      <h1 className="game-title">Euro Clicker Game</h1>

      <div className="money-display">
        {formatNumber(money)} €
      </div>
    </>
  );
}