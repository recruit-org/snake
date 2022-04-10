import { Config, Direction } from "./constants";

export const getRandomCell = () => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
  createdAt: Date.now(),
});

export const getInitialDirection = () => Direction.Right;
