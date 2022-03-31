import { useEffect, useCallback, useMemo } from "react";

import { Config, CellType, Direction } from "../constants";
import { getRandomCell } from "../helpers";

import Cell from "../components/Cell";

import { useInterval } from "./interval";

import { GameState, useGameContext } from "../context/game";

const useSnakeController = () => {
  const { clock, snake, direction, foods, setFoods, setSnake, setState } =
    useGameContext();

  // useCallback() prevents instantiation of a function on each rerender
  // based on the dependency array

  const removeFoods = useCallback(() => {
    // only keep those foods which were created within last 10s.
    setFoods((currentFoods) =>
      currentFoods.filter((food) => clock - food.createdAt <= 10 * 1000)
    );
  }, [setFoods, clock]);

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
    newFood.createdAt = clock;
    setFoods((currentFoods) => [...currentFoods, newFood]);
  }, [isFood, isSnake, setFoods, clock]);

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
        setState(GameState.Finished);
        return snake;
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
  }, [direction.x, direction.y, isFood, isSnake, setFoods, setSnake, setState]);

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
  const { setDirection, setClock } = useGameContext();
  const { runSingleStep, addFood, removeFoods } = useSnakeController();

  useInterval(runSingleStep, 200);
  useInterval(addFood, 3000);
  useInterval(removeFoods, 100);
  useInterval(() => setClock((clock) => clock + 10), 10);

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
  const { clock } = useGameContext();
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
              (clock -
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
  }, [foods, isFood, isSnake, clock]);

  return cells;
};
