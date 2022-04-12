import { useCallback, useState, useEffect, useMemo } from "react";
import { useInterval } from "./interval";
import { getDefaultSnake, getRandomCell } from "../helpers";
import { Direction, CellType, Config } from "../constants";
import { Cell } from "../components/Cell";
export const useSnake = () => {
  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);
  const [object, setobject] = useState({
    food: [{ x: 4, y: 10 }],
    poison: [],
  });
  const score = snake.length - 3;

  const resetGame = useCallback(() => {
    setSnake(getDefaultSnake());
    setDirection(Direction.Right);
    setobject({
      food: [{ x: 4, y: 10 }],
      poison: [],
    });
  }, []);

  //helper function for removing food
  // const removeFood = useCallback(() => {
  //   setFoods((fs) => fs.filter((f) => Date.now() - f.createdAt <= 10 * 1000));
  // }, []);
  const removeObject = useCallback((type) => {
    setobject((o) => ({
      ...o,
      [type]: o[type].filter((f) => Date.now() - f.createdAt <= 10 * 1000),
    }));
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = useCallback(
    ({ x, y }) => object.food.some((food) => food.x === x && food.y === y),
    [object]
  );
  const isPoison = useCallback(
    ({ x, y }) => object.poison.some((p) => p.x === x && p.y === y),
    [object]
  );

  const isSnake = useCallback(
    ({ x, y }) =>
      snake.find((position) => position.x === x && position.y === y),
    [snake]
  );
  const isOccupied = useCallback(
    (cell) => isSnake(cell) || isFood(cell) || isPoison(cell),
    [isFood, isPoison, isSnake]
  );
  //helper function for adding new food
  // const addNewFood = useCallback(() => {
  //   let newFood = getRandomCell();
  //   while (isOccupied(newFood)) {
  //     newFood = getRandomCell();
  //   }

  //   setFoods((fs) => [...fs, newFood]);
  // }, [isOccupied]);

  //helper function for adding new food
  // const addNewPoison = useCallback(() => {
  //   let newPoison = getRandomCell();
  //   while (isOccupied(newPoison)) {
  //     newPoison = getRandomCell();
  //   }

  //   setPoison((fs) => [...fs, newPoison]);
  // }, [isOccupied]);
  const addNewObject = useCallback(
    (type) => {
      let newobject = getRandomCell();
      while (isOccupied(newobject)) {
        newobject = getRandomCell();
      }
      setobject((o) => ({
        ...o,
        [type]: [...o[type], newobject],
      }));
    },
    [isOccupied]
  );

  // move the snake
  const runSingleStep = useCallback(() => {
    setSnake((snake) => {
      const head = snake[0];
      const newHead = {
        x: (head.x + direction.x + Config.width) % Config.width,
        y: (head.y + direction.y + Config.height) % Config.height,
      };

      // make a new snake by extending head
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
      const newSnake = [newHead, ...snake];

      // check if snake is eating food
      if (!isFood(newHead)) {
        newSnake.pop();
      } else if (isFood(newHead)) {
        setobject((o) => ({
          ...o,
          food: o.food.filter((f) => !(f.x === newHead.x && f.y === newHead.y)),
        }));
      }
      // check if snake is eating itself
      if (isSnake(newHead)) {
        resetGame();
      }
      if (isPoison(newHead)) {
        setobject((o) => ({
          ...o,
          poison: o.poison.filter(
            (f) => !(f.x === newHead.x && f.y === newHead.y)
          ),
        }));
        if (snake.length > 3) {
          setSnake((snake) => snake.slice(0, snake.length - 1));
        }
      }

      return newSnake;
    });
  }, [direction, resetGame, isSnake, isFood, isPoison]);

  useInterval(runSingleStep, 200);
  useInterval(() => addNewObject(CellType.Food), 3000);
  useInterval(() => addNewObject(CellType.Poison), 5000);
  useInterval(() => removeObject(CellType.Food), 100);
  useInterval(() => removeObject(CellType.Poison), 100);

  useEffect(() => {
    const handleKey = (direction, oppositeDirection) => {
      setDirection((currDir) => {
        if (currDir !== oppositeDirection) {
          return direction;
        }
        return currDir;
      });
    };
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          handleKey(Direction.Top, Direction.Bottom);
          break;

        case "ArrowDown":
          handleKey(Direction.Bottom, Direction.Top);
          break;

        case "ArrowLeft":
          handleKey(Direction.Left, Direction.Right);
          break;

        case "ArrowRight":
          handleKey(Direction.Right, Direction.Left);
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
                object.food.find((food) => food.x === x && food.y === y)
                  .createdAt) /
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
  }, [object, isFood, isPoison, isSnake]);

  return { score, isFood, isSnake, cells };
};
