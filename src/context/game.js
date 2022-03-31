import React, { useState } from "react";
import { getDefaultSnake, getInitialDirection } from "../helpers";

export const GameContext = React.createContext({});

export const useGame = () => {
  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(getInitialDirection());
  const [foods, setFoods] = useState([]);

  const score = snake.length - 3;

  return { snake, setSnake, direction, setDirection, foods, setFoods, score };
};
