import { GameContext, useGame } from "../context/game";
import Snake from "./Snake";

const Game = () => {
  const game = useGame();
  return (
    <GameContext.Provider value={game}>
      <Snake />
    </GameContext.Provider>
  );
};

export default Game;
