import { useCallback, useState, useEffect, useMemo } from "react";
import { useInterval } from "./interval";
import { getDefaultSnake, getRandomCell } from "../helpers";
import { Direction, CellType, Config } from "../constants";
import { Cell } from "../components/Cell";

export const useSnake = () => {
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);
  const [object, setObject] = useState([]);

  const score = snake.length - 3;

  const resetGame = useCallback(() => {
    setSnake(getDefaultSnake());
    setDirection(Direction.Right);
    setObject([]);
  }, []);

  //helper function for removing food
  // const removeFood = useCallback(() => {
  //   setFoods((fs) => fs.filter((f) => Date.now() - f.createdAt <= 10 * 1000));
  // }, []);
  const removeObject = useCallback(() => {
    setObject((o) => o.filter((f) => Date.now() - f.createdAt <= 10 * 1000));
  }, []);

  const isObject = useCallback(
    ({ x, y }) => object.some((obj) => obj.x === x && obj.y === y),
    [object]
  );
  const isTypeObject = useCallback(
    ({ x, y, type }) =>
      object.some((obj) => obj.type === type && obj.x === x && obj.y === y),
    [object]
  );

  const isSnake = useCallback(
    ({ x, y }) =>
      snake.find((position) => position.x === x && position.y === y),
    [snake]
  );
  const isOccupied = useCallback(
    (cell) => isSnake(cell) || isObject(cell),
    [isObject, isSnake]
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
      setObject((o) => [
        ...o,
        {
          ...newobject,
          type,
        },
      ]);
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
      if (!isTypeObject({ ...newHead, type: CellType.Food })) {
        newSnake.pop();
      } else if (isTypeObject({ ...newHead, type: CellType.Food })) {
        setObject((o) =>
          o.filter(
            (f) =>
              !(
                f.x === newHead.x &&
                f.y === newHead.y &&
                f.type === CellType.Food
              )
          )
        );
      }
      // check if snake is eating itself
      if (isSnake(newHead)) {
        resetGame();
      }
      if (isTypeObject({ ...newHead, type: CellType.Poison })) {
        setObject((o) =>
          o.filter(
            (f) =>
              !(
                f.x === newHead.x &&
                f.y === newHead.y &&
                f.type === CellType.Poison
              )
          )
        );

        if (snake.length > 3) {
          setSnake((snake) => snake.slice(0, snake.length - 1));
        }
      }

      return newSnake;
    });
  }, [direction, isTypeObject, isSnake, resetGame]);

  useInterval(runSingleStep, 200);
  useInterval(() => addNewObject(CellType.Food), 3000);
  useInterval(() => addNewObject(CellType.Poison), 5000);
  useInterval(() => removeObject(), 100);

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
        if (isTypeObject({ x, y, type: CellType.Food })) {
          type = CellType.Food;
          remaining =
            10 -
            Math.round(
              (Date.now() -
                object.find(
                  (food) =>
                    food.x === x && food.y === y && food.type === CellType.Food
                ).createdAt) /
                1000
            );
        } else if (isSnake({ x, y })) {
          type = CellType.Snake;
        } else if (isTypeObject({ x, y, type: CellType.Poison })) {
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
  }, [isTypeObject, isSnake, object]);

  return { score, isTypeObject, isSnake, cells };
};
