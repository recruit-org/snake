import React, { useCallback, useContext, useState } from "react";
import { getDefaultSnake, getInitialDirection } from "../helpers";

export const GameContext = React.createContext({});
export const GameState = {
  Running: "running",
  Paused: "paused",
  Playing: "playing",
  Finished: "finished",
};

export const useGame = () => {
  // snake[0] is head and snake[snake.length - 1] is tail
  const [state, setState] = useState(GameState.Finished);
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(getInitialDirection());
  const [objects, setObjects] = useState([
    { x: 4, y: 10, createTime: Date.now(), type: "food" },

    { x: 4, y: 10, createTime: Date.now(), type: "poison" },
  ]);

  const score = snake.length - 3;

  const resetGame = useCallback(() => {
    setState(GameState.Finished);
    setSnake(getDefaultSnake());
    setDirection(getInitialDirection());
    // setObjects([]);
  }, [setDirection, setState, setSnake]);

  return {
    snake,
    setSnake,
    direction,
    setDirection,
    objects,
    setObjects,
    score,
    state,
    setState,
    resetGame,
  };
};
export const useGameContext = () => useContext(GameContext);
