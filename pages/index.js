import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/Snake.module.css";

const Config = {
  height: 15,
  width: 15,
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

const Cell = ({ x, y, type }) => {
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
        };

      default:
        return {};
    }
  };
  return (
    <div
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
  start: Math.floor(Math.random()),
});

//custom hook
//controller
const UseSnake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);

  const [foods, setFoods] = useState([]);
  const score = snake.length - 3;

  const resetGame = () => {
    setSnake(getDefaultSnake());
    setDirection(Direction.Right);
    setFoods([]);
  };
  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        const newHead = {
          x: (head.x + direction.x + Config.width) % Config.width,
          y: (head.y + direction.y + Config.height) % Config.height,
        };

        // make a new snake by extending head
        const newSnake = [newHead, ...snake];

        // remove tail when head doesnt eat food
        if (!isFood(newHead)) {
          newSnake.pop();
        }
        if (isSnake(newHead)) {
          resetGame();
        }

        return newSnake;
      });
    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 300);

    return () => clearInterval(timer);
  }, [direction]);

  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      setFoods((currentFoods) =>
        currentFoods.filter((food) => food.x !== head.x && food.y !== head.y)
      );
    }
  }, [snake]);

  //food after 3s
  useEffect(() => {
    const interval = setInterval(() => {
      let newFood = getRandomCell();
      while (isSnake(newFood) || isFood(newFood)) {
        newFood = getRandomCell();
      }
      setFoods((currentFoods) => [...currentFoods, newFood]);
      setTimeout(() => {
        setFoods((f) =>
          f.filter(
            (e) =>
             e.start!==newFood.start
          )
        );
      },10*1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const changeDir = (checkDir, newDir) => {
    setDirection((direction) => {
      if (direction != checkDir) return newDir;
      return direction;
    });
  };

  useEffect(() => {
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          changeDir(Direction.Bottom, Direction.Top);
          break;

        case "ArrowDown":
          changeDir(Direction.Top, Direction.Bottom);
          break;

        case "ArrowLeft":
          changeDir(Direction.Right, Direction.Left);
          break;

        case "ArrowRight":
          changeDir(Direction.Left, Direction.Right);
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  // ?. is called optional chaining
  const isFood = ({ x, y }) =>
    foods.find((position) => position.x === x && position.y === y);

  const isSnake = ({ x, y }) =>
    snake.find((position) => position.x === x && position.y === y);

  return { score, isFood, isSnake };
};

//view
const Snake = () => {
  const { score, isFood, isSnake } = UseSnake();
  const cells = [];
  for (let x = 0; x < Config.width; x++) {
    for (let y = 0; y < Config.height; y++) {
      let type = CellType.Empty;
      if (isFood({ x, y })) {
        type = CellType.Food;
      } else if (isSnake({ x, y })) {
        type = CellType.Snake;
      }
      cells.push(<Cell key={`${x}-${y}`} x={x} y={y} type={type} />);
    }
  }

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
