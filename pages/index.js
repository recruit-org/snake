import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useRef } from "react";
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
          backgroundColor: "darkorange",
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
    // eslint-disable-next-line react/react-in-jsx-scope
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
      <div className={styles.cell} style={getStyles()}></div>
    </div>
  );
};

const getRandomCell = () => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
  createdAt: Date.now(),
});
const getRandomWrongCell = () => ({
  x: Math.floor(Math.random() * Config.width) + 24,
  y: Math.floor(Math.random() * Config.width) + 24,
  createdAt: Date.now(),
});

const getInitialDirection = () => Direction.Right;

const useInterval = (callback, duration) => {
  const time = useRef(0);

  const wrappedCallback = useCallback(() => {
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

const UseSnake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(getInitialDirection());

  const [foods, setFoods] = useState([]);
  const score = snake.length - 3;
  // eslint-disable-next-line no-unused-vars
  const resetGame = useCallback(() => {
    setSnake(getDefaultSnake());
    setDirection(getInitialDirection());
    setFoods([]);
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

  const addFood = useCallback(() => {
    let newFood = getRandomCell();
    while (isSnake(newFood) || isFood(newFood)) {
      newFood = getRandomCell();
    }
    setFoods((currentFoods) => [...currentFoods, newFood]);
  }, [isFood, isSnake]);

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
      if (isSnake(newHead)) {
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
      }
      cells.push(
        <Cell key={`${x}-${y}`} x={x} y={y} type={type} remaining={remaining} />
      );
    }
  }

  return { snake, cells, score };
};

const Snake = () => {
  const { cells, score } = UseSnake();
  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{
          width: Config.width * Config.cellSize,
        }}
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
