import React, { useCallback, useContext, useState } from "react";

import { getDefaultSnake, getInitialDirection } from "../helpers";

export const GameContext = React.createContext({});

export const GameState = {
  Running: "running",
  Paused: "paused",
  Replaying: "replaying",
  Finished: "finished",
};

export const useGame = () => {
  // snake[0] is head and snake[snake.length - 1] is tail
  const [clock, setClock] = useState(0);
  const [state, setState] = useState(GameState.Finished);
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(getInitialDirection());
  const [foods, setFoods] = useState([]);

  const [history, setHistory] = useState([]);

  const saveSnapshot = useCallback(() => {
    setHistory((history) =>
      history.concat({
        clock,
        snake,
        foods,
        direction,
      })
    );
  }, [clock, snake, foods, direction]);

  const gotoSnapshot = useCallback(
    (time) => {
      // find first snapshot AFTER time
      const snapshot = history.find((snap) => snap.clock >= time);

      if (!snapshot) {
        return;
      }

      const { clock, snake, foods, direction } = snapshot;

      setClock(clock);
      setSnake(snake);
      setFoods(foods);
      setDirection(direction);
    },
    [history]
  );

  const score = snake.length - 3;

  // resets the snake, foods, direction to initial values
  const resetGame = useCallback(() => {
    setState(GameState.Finished);
    setSnake(getDefaultSnake());
    setFoods([]);
    setDirection(getInitialDirection());
    setHistory([]);
  }, [setDirection, setFoods, setState]);

  return {
    clock,
    setClock,
    history,
    setHistory,
    state,
    setState,
    snake,
    setSnake,
    direction,
    setDirection,
    foods,
    setFoods,
    score,
    resetGame,
    saveSnapshot,
    gotoSnapshot,
  };
};

export const useGameContext = () => useContext(GameContext);
