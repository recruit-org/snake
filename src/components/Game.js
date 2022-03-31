import {
  GameContext,
  GameState,
  useGame,
  useGameContext,
} from "../context/game";
import Snake from "./Snake";
import styles from "../../styles/Snake.module.css";
import { Config } from "../constants";
import { usePlay, useReplay } from "../hooks/snake";
import { useMemo } from "react";

const Header = () => {
  const { score, state, setState, resetGame } = useGameContext();

  const actions = useMemo(() => {
    switch (state) {
      case GameState.Finished:
        return [
          {
            name: "New",
            onClick: () => {
              resetGame();
              setState(GameState.Playing);
            },
          },
          {
            name: "Replay",
            onClick: () => {
              setState(GameState.Replaying);
            },
          },
        ];

      case GameState.Playing:
        return [
          {
            name: "Pause",
            onClick: () => setState(GameState.Paused),
          },
        ];

      case GameState.Paused:
        return [
          {
            name: "Resume",
            onClick: () => setState(GameState.Playing),
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

const Play = () => {
  usePlay();
  return <Snake />;
};

const Replay = () => {
  useReplay();
  return <Snake />;
};

const SnakeContainer = () => {
  const { state } = useGameContext();
  switch (state) {
    case GameState.Playing:
      return <Play />;

    case GameState.Replaying:
      return <Replay />;

    default:
      return <Snake />;
  }
};

const Game = () => {
  const game = useGame();
  return (
    <GameContext.Provider value={game}>
      <div className={styles.container}>
        <Header />
        <SnakeContainer />
      </div>
    </GameContext.Provider>
  );
};

export default Game;
