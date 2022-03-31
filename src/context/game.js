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

  const score = snake.length - 3;

  // resets the snake, foods, direction to initial values
  const resetGame = useCallback(() => {
    setState(GameState.Finished);
    setSnake(getDefaultSnake());
    setFoods([]);
    setDirection(getInitialDirection());
  }, [setDirection, setFoods, setState]);

  return {
    clock,
    setClock,
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
  };
};

export const useGameContext = () => useContext(GameContext);
