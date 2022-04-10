import { useEffect, useState, useCallback, useMemo } from "react";
import { getInitialDirection, getRandomCell } from "../helpers";
import { Config, Direction, CellType } from "../constants";
import Cell from "../components/cell";
import useInterval from "./interval";

const UseSnake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];

  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(getInitialDirection());

  const [foods, setFoods] = useState([]);
  const [poison, setPoison] = useState([]);

  const score = snake.length - 3;

  const resetGame = useCallback(() => {
    setSnake(getDefaultSnake());
    setDirection(getInitialDirection());
    setFoods([]);
    setPoison([]);
  }, []);

  const removeFood = useCallback(() => {
    setFoods((currentFoods) =>
      currentFoods.filter((food) => Date.now() - food.createdAt <= 10 * 1000)
    );
  }, []);

  const isFood = useCallback(
    ({ x, y }) => foods.some((food) => food.x === x && food.y === y),
    [foods]
  );

  const isSnake = useCallback(
    ({ x, y }) =>
      snake.find((position) => position.x === x && position.y === y),
    [snake]
  );

  //checking if it's a poison cell
  const isPoison = useCallback(
    ({ x, y }) => poison.some((p) => p.x === x && p.y === y),
    [poison]
  );

  const addFood = useCallback(() => {
    let newFood = getRandomCell();
    while (isSnake(newFood) || isFood(newFood)) {
      newFood = getRandomCell();
    }
    setFoods((currentFoods) => [...currentFoods, newFood]);
  }, [isFood, isSnake]);

  //adding poison
  const addPoison = useCallback(() => {
    let newPoison = getRandomCell();
    while (isSnake(newPoison) || isFood(newPoison)) {
      newPoison = getRandomCell();
    }
    setPoison((currentPoison) => [...currentPoison, newPoison]);
  }, [isFood, isSnake]);
  //removing poison
  const removePoison = useCallback(() => {
    setPoison((currentPoisons) =>
      currentPoisons.filter(
        (poison) => Date.now() - poison.createdAt <= 15 * 1000
      )
    );
  }, []);

  //moving the snake
  const runSingleStep = useCallback(() => {
    setSnake((snake) => {
      const head = snake[0];
      const newHead = {
        x: (head.x + direction.x + Config.height) % Config.height,
        y: (head.y + direction.y + Config.width) % Config.width,
      };
      const newSnake = [newHead, ...snake];

      //reset the game if snake touches its own body
      if (isSnake(newHead) || isPoison(newHead)) {
        resetGame();
        return getDefaultSnake();
      }
      if (!isFood(newHead)) {
        newSnake.pop();
      } else {
        setFoods((currentFoods) =>
          currentFoods.filter(
            (food) => !(food.x === newHead.x && food.y === newHead.y)
          )
        );
      }
      return newSnake;
    });
  }, [direction, isFood, isSnake, resetGame]);

  useInterval(runSingleStep, 200);
  useInterval(addFood, 3000);
  useInterval(removeFood, 100);
  useInterval(addPoison, 15000);
  useInterval(removePoison, 100);

  useEffect(() => {
    const controlDirection = (direction, oppositeDirection) => {
      setDirection((currentDirection) => {
        if (currentDirection === oppositeDirection) {
          return currentDirection;
        } else return direction;
      });
    };
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          controlDirection(Direction.Top, Direction.Bottom);
          break;

        case "ArrowDown":
          controlDirection(Direction.Bottom, Direction.Top);
          break;

        case "ArrowLeft":
          controlDirection(Direction.Left, Direction.Right);
          break;

        case "ArrowRight":
          controlDirection(Direction.Right, Direction.Left);
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  const cells = useMemo(() => {
    const elements = [];
    for (let x = 0; x < Config.width; x++) {
      for (let y = 0; y < Config.height; y++) {
        let type = CellType.Empty,
          remaining = undefined;
        if (isFood({ x, y })) {
          type = CellType.Food;
          remaining =
            10 -
            Math.round(
              (Date.now() -
                foods.find((food) => food.x === x && food.y === y).createdAt) /
                1000
            );
        } else if (isSnake({ x, y })) {
          type = CellType.Snake;
        } else if (isPoison({ x, y })) {
          type = CellType.Poison;
        }
        elements.push(
          <Cell
            key={`${x}-${y}`}
            x={x}
            y={y}
            type={type}
            remaining={remaining}
          />
        );
      }
    }
    return elements;
  }, [foods, isFood, isSnake]);

  //   const cells = [];
  //   for (let x = 0; x < Config.width; x++) {
  //     for (let y = 0; y < Config.height; y++) {
  //       let type = CellType.Empty,
  //         remaining = undefined;
  //       if (isFood({ x, y })) {
  //         type = CellType.Food;
  //         remaining =
  //           10 -
  //           Math.round(
  //             (Date.now() -
  //               foods.find((food) => food.x === x && food.y === y).createdAt) /
  //               1000
  //           );
  //       } else if (isSnake({ x, y })) {
  //         type = CellType.Snake;
  //       } else if (isPoison({ x, y })) {
  //         type = CellType.Poison;
  //       }
  //       cells.push(
  //         <Cell key={`${x}-${y}`} x={x} y={y} type={type} remaining={remaining} />
  //       );
  //     }
  //   }

  return { snake, cells, score };
};
export default UseSnake;
