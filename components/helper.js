import { Config } from "./constants";
export const getRandomCell = () => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
  createTime: Date.now(),
});
export const getDefaultSnake = () => [
  { x: 8, y: 12 },
  { x: 7, y: 12 },
  { x: 6, y: 12 },
];
