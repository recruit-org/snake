import {
  GameContext,
  GameState,
  useGame,
  useGameContext,
} from "../context/game";
import Snake from "./Snake";
import Slider, { Range } from "rc-slider";
import { Config } from "../constants";
import { usePlay, useReplay } from "../hooks/snake";
import { useMemo } from "react";

import "rc-slider/assets/index.css";
import styles from "../../styles/Snake.module.css";

const Header = () => {
  const { score, state, setState, resetGame, history } = useGameContext();

  const actions = useMemo(() => {
    switch (state) {
      case GameState.Finished:
        const actions = [
          {
            name: "New",
            onClick: () => {
              resetGame();
              setState(GameState.Playing);
            },
          },
        ];

        if (history.length > 0) {
          actions.push({
            name: "Replay",
            onClick: () => {
              setState(GameState.Replaying);
            },
          });
        }

        return actions;

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

      case GameState.Replaying:
        return [
          {
            name: "New",
            onClick: () => {
              resetGame();
              setState(GameState.Playing);
            },
          },
        ];
      default:
        return [];
    }
  }, [state, history.length, resetGame, setState]);

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
  const { time, setTime, speed, setSpeed, maxTime } = useReplay();

  const speedMarks = [0, 0.25, 0.5, 1, 2, 4, 8];

  return (
    <>
      <div
        className={styles.header}
        style={{
          width: Config.width * Config.cellSize,
        }}
      >
        <Slider
          min={0}
          max={maxTime}
          value={time}
          onChange={(value) => setTime(value)}
          step={1}
        />
      </div>
      <div
        className={styles.header}
        style={{
          width: Config.width * Config.cellSize,
          paddingBottom: 32,
        }}
      >
        <Slider
          min={0}
          max={speedMarks.length - 1}
          value={speedMarks.findIndex((mark) => mark === speed)}
          onChange={(index) => setSpeed(speedMarks[index])}
          marks={Object.fromEntries(
            speedMarks.map((speed, index) => [index, speed + "x"])
          )}
          step={null}
        />
      </div>
      <Snake />
    </>
  );
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
