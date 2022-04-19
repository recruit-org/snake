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

//  let gameHasBeenReset = false;
//   foods.forEach(
//     // (food) => !(food.x == newHead.x && food.y === newHead.y)
//     (food) => {
//       if (gameHasBeenReset) {
//         return;
//       }
//       if (
//         food.x == newHead.x &&
//         food.y === newHead.y &&
//         food.type === "badFood"
//       ) {
//         gameHasBeenReset = true;
//         resetGame();
//       }
//     }
//     // it will remove that food which is matched with the position of snake
//   );
//   if (gameHasBeenReset) {
//     return;
//   }
// it will remove that food which is matched with the position of snake
