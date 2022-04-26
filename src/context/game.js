import React, { useState } from "react";
import { getDefaultSnake, getInitialDirection } from "../helpers";

export const GameContext = React.createContext({});

export const useGame = () => {
  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(getInitialDirection());
  const [objects, setObjects] = useState([
    { x: 4, y: 10, createTime: Date.now(), type: "food" },

    { x: 4, y: 10, createTime: Date.now(), type: "poison" },
  ]);

  const score = snake.length - 3;

  return {
    snake,
    setSnake,
    direction,
    setDirection,
    objects,
    setObjects,
    score,
  };
};
