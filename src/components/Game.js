import {
  GameContext,
  useGame,
  GameState,
  useGameContext,
} from "../context/game";
import Snake from "./Snake";
import styles from "../../styles/Snake.module.css";
import { Config } from "../constants";
import { usePlay } from "../hooks/snake";
import { useMemo } from "react";

const Header = () => {
  const { score, state, setState, resetGame } = useGameContext();
  const actions = useMemo(() => {
    // a switch statement is one of the best ways to handle conditional rendering.
    switch (state) {
      case GameState.Finished:
        return [
          {
            name: "Play",
            onClick: () => {
              resetGame();
              setState(GameState.Playing);
            },
          },
        ];
      case GameState.Paused:
        return [
          {
            name: "Resume",
            onClick: () => {
              setState(GameState.Playing);
            },
          },
        ];
      case GameState.Playing:
        return [
          {
            name: "Pause",
            onClick: () => {
              setState(GameState.Paused);
            },
          },
        ];
      default:
        return [];
    }
  }, [state, resetGame, setState]);

  return (
    <div
      className={styles.header}
      style={{ width: Config.width * Config.cellSize }}
    >
      <div>Score: {score}</div>
      <div>
        {actions.map(({ name, onClick }) => (
          <button key={name} onClick={onClick}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

const Playing = () => {
  usePlay();
  return <Snake />;
};

const SnakeContainer = () => {
  const { state } = useGameContext();
  switch (state) {
    case GameState.Playing:
      return <Playing />;

    default:
      return <Snake />;
  }
};

const Game = () => {
  const game = useGame();
  return (
    <GameContext.Provider value={game}>
      <div className={styles.container}>
        <Header></Header>
        <SnakeContainer></SnakeContainer>
      </div>
    </GameContext.Provider>
  );
};
export default Game;
