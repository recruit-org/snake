import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useRef } from "react";
import styles from "../styles/Snake.module.css";

const Config = {
  height: 25,
  width: 25,
  cellSize: 32,
};

const CellType = {
  Snake: "snake",
  Food: "food",
  Empty: "empty",
  Poison: "poison"
};

const Direction = {
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
  Top: { x: 0, y: -1 },
  Bottom: { x: 0, y: 1 },
};

const Cell = ({ x, y, type, remaining }) => {
  const getStyles = () => {
    switch (type) {
      case CellType.Snake:
        return {
          backgroundColor: "yellowgreen",
          borderRadius: 8,
          padding: 2,
        };

      case CellType.Food:
        return {
          backgroundColor: "tomato",
          borderRadius: 20,
          width: 32,
          height: 32,
          transform: `scale(${0.5 + remaining / 20})`,
        };

        case CellType.Poison:
          return {
            backgroundColor: "blue",
            borderRadius: 20,
            width: 32,
            height: 32,
            transform: `scale(${0.5 + remaining / 20})`,
          };

      default:
        return {};
    }
  };

  return (
    <div
      key={`${x}-${y}`}
      className={styles.cellContainer}
      style={{
        left: x * Config.cellSize,
        top: y * Config.cellSize,
        width: Config.cellSize,
        height: Config.cellSize,
      }}
    >
      <div className={styles.cell} style={getStyles()}>
        {remaining}
      </div>
    </div>
  );
};

const getRandomCell = () => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
  createdAt: Date.now(),
});

const getInitialDirection = () => Direction.Right;

const useInterval = (callback, duration) => {
  const time = useRef(0);

  const wrappedCallback = useCallback(() => {
    // don't call callback() more than once within `duration`
    if (Date.now() - time.current >= duration) {
      time.current = Date.now();
      callback();
    }
  }, [callback, duration]);

  useEffect(() => {
    const interval = setInterval(wrappedCallback, 1000 / 60);
    return () => clearInterval(interval);
  }, [wrappedCallback, duration]);
};

const useSnake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(getInitialDirection());

  const [foods, setFoods] = useState([]);
  const [poisons, setPoisons] = useState([]);

  const score = snake.length - 3;

  // useCallback() prevents instantiation of a function on each rerender
  // based on the dependency array

  // resets the snake ,foods, direction to initial values
  const resetGame = useCallback(() => {
    setFoods([]);
    setDirection(getInitialDirection());
  }, []);

  const removeFoods = useCallback(() => {
    // only keep those foods which were created within last 10s.
    setFoods((currentFoods) =>
      currentFoods.filter((food) => Date.now() - food.createdAt <= 10 * 1000)
    );
  }, []);

  const removePoisons = useCallback(() => {
    // only keep those foods which were created within last 10s.
    setPoisons((currentPoisons) =>
    currentPoisons.filter((poison) => Date.now() - poison.createdAt <= 10 * 1000)
    );
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = useCallback(
    ({ x, y }) => foods.some((food) => food.x === x && food.y === y),
    [foods]
  );

  const isPoison = useCallback(
    ({ x, y }) => poisons.some((poison) => poison.x === x && poison.y === y),
    [poisons]
  );

  const isSnake = useCallback(
    ({ x, y }) =>
      snake.find((position) => position.x === x && position.y === y),
    [snake]
  );

  const addFood = useCallback(() => {
    let newFood = getRandomCell();
    while (isSnake(newFood) || isFood(newFood) || isPoison(newFood)) {
      newFood = getRandomCell();
    }
    setFoods((currentFoods) => [...currentFoods, newFood]);
  }, [isFood, isPoison, isSnake]);

  const addPoison = useCallback(() => {
    let newPoison = getRandomCell();
    while (isSnake(newPoison) || isFood(newPoison) || isPoison(newPoison)) {
      newPoison = getRandomCell();
    }
    setPoisons((currentPoisons) => [...currentPoisons, newPoison]);
  }, [isFood, isPoison, isSnake]);

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
  }, [direction, isFood, isSnake, resetGame]);

  useInterval(runSingleStep, 200);
  useInterval(addFood, 3000);
  useInterval(addPoison, 6000);
  useInterval(removeFoods, 100);
  useInterval(removePoisons, 100);

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
  }, []);

  const cells = [];
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
      } else if(isPoison({ x, y })) {
        type = CellType.Poison;
        remaining =
          10 -
          Math.round(
            (Date.now() -
              poisons.find((poison) => poison.x === x && poison.y === y).createdAt) /
              1000
          );
      }
      cells.push(
        <Cell key={`${x}-${y}`} x={x} y={y} type={type} remaining={remaining} />
      );
    }
  }

  return {
    snake,
    cells,
    score,
  };
};

const Snake = () => {
  const { cells, score } = useSnake();
  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{ width: Config.width * Config.cellSize }}
      >
        Score: {score}
      </div>
      <div
        className={styles.grid}
        style={{
          height: Config.height * Config.cellSize,
          width: Config.width * Config.cellSize,
        }}
      >
        {cells}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Snake), {
  ssr: false,
});
