import { useEffect, useCallback, useMemo, useContext } from "react";

import { Config, CellType, Direction } from "../constants";
import {
  getRandomCell,
  getDefaultSnake,
  getInitialDirection,
} from "../helpers";

import Cell from "../components/Cell";

import { useInterval } from "./interval";

import { GameContext } from "../context/game";

const useSnakeController = () => {
  const { snake, direction, foods, setFoods, setDirection, setSnake } =
    useContext(GameContext);

  // useCallback() prevents instantiation of a function on each rerender
  // based on the dependency array

  // resets the snake, foods, direction to initial values
  const resetGame = useCallback(() => {
    setFoods([]);
    setDirection(getInitialDirection());
  }, [setDirection, setFoods]);

  const removeFoods = useCallback(() => {
    // only keep those foods which were created within last 10s.
    setFoods((currentFoods) =>
      currentFoods.filter((food) => Date.now() - food.createdAt <= 10 * 1000)
    );
  }, [setFoods]);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = useCallback(
    ({ x, y }) => foods.some((food) => food.x === x && food.y === y),
    [foods]
  );

  const isSnake = useCallback(
    ({ x, y }) =>
      snake.find((position) => position.x === x && position.y === y),
    [snake]
  );

  const addFood = useCallback(() => {
    let newFood = getRandomCell();
    while (isSnake(newFood) || isFood(newFood)) {
      newFood = getRandomCell();
    }
    setFoods((currentFoods) => [...currentFoods, newFood]);
  }, [isFood, isSnake, setFoods]);

  // move the snake
  const runSingleStep = useCallback(() => {
    setSnake((snake) => {
      const head = snake[0];

      // 0 <= a % b < b
      // so new x will always be inside the grid
      const newHead = {
        x: (head.x + direction.x + Config.height) % Config.height,
        y: (head.y + direction.y + Config.width) % Config.width,
      };

      // make a new snake by extending head
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
      const newSnake = [newHead, ...snake];

      // reset the game if the snake hit itself
      if (isSnake(newHead)) {
        resetGame();
        return getDefaultSnake();
      }

      // remove tail from the increased size snake
      // only if the newHead isn't a food
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
  }, [
    direction.x,
    direction.y,
    isFood,
    isSnake,
    resetGame,
    setFoods,
    setSnake,
  ]);

  return {
    foods,
    isFood,
    isSnake,
    runSingleStep,
    addFood,
    removeFoods,
  };
};

export const usePlay = () => {
  const { setDirection } = useContext(GameContext);
  const { runSingleStep, addFood, removeFoods } = useSnakeController();

  useInterval(runSingleStep, 200);
  useInterval(addFood, 3000);
  useInterval(removeFoods, 100);

  useEffect(() => {
    const handleDirection = (direction, oppositeDirection) => {
      setDirection((currentDirection) => {
        if (currentDirection === oppositeDirection) {
          return currentDirection;
        } else return direction;
      });
    };

    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          handleDirection(Direction.Top, Direction.Bottom);
          break;

        case "ArrowDown":
          handleDirection(Direction.Bottom, Direction.Top);
          break;

        case "ArrowLeft":
          handleDirection(Direction.Left, Direction.Right);
          break;

        case "ArrowRight":
          handleDirection(Direction.Right, Direction.Left);
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, [setDirection]);
};

export const useCells = () => {
  const { foods, isFood, isSnake } = useSnakeController();

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

  return cells;
};
