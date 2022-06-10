import { Direction, Config } from "./constants";
export const getRandomCellOfType = (cellType) => ({
    x: Math.floor(Math.random() * Config.width),
    y: Math.floor(Math.random() * Config.width),
    createdAt: Date.now(),
    type: cellType, 
  });
  
export const getInitialDirection = () => Direction.Right;
  
export const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
