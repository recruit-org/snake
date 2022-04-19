import { Config, Direction } from "./constants";

export const getRandomCell = (objType) => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
  createdAt: Date.now(),
  type: objType,
});

export const getInitialDirection = () => Direction.Right;
