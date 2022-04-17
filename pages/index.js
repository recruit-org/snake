import dynamic from "next/dynamic";
import { useEffect, useState, useRef, useCallback } from "react";
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
  Poison: "poison",
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
          backgroundColor: "red",
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

const getRandomCell = (type) => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
  start: Date.now(),
  type: type,
});

//custom hook
//controller
const UseInterval = (func, dir) => {
  const timer = useRef(Date.now());
  const createCallback = useCallback(() => {
    if (Date.now() - timer.current > dir) {
      timer.current = Date.now();
      func();
    }
  }, [dir, func]);

  useEffect(() => {
    const interval = setInterval(createCallback, 1000 / 60);
    return () => clearInterval(interval);
  }, [createCallback]);
};
const UseSnake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);
  // const [foods, setFoods] = useState([]);
  // const [poisons, setPoison] = useState([]);
  const [objects, setObjects] = useState([]);
  const score = snake.length - 3;

  const finding = ({ x, y }, arr, type) => {
    return arr.find((position) => position.x === x && position.y === y && position.type===type);
  };

  //checking cells
  const isObject = useCallback(
    ({ x, y }, type) => {
      if (type === CellType.Food) return finding({ x, y }, objects,type);
      else if (type === CellType.Poison) return finding({ x, y }, objects, type);
      else if (type === CellType.Snake) return finding({ x, y }, snake);
    },
    [objects, snake]
  );

  //restart the game
  const resetGame = useCallback(() => {
    setSnake(getDefaultSnake());
    setDirection(Direction.Right);
    setObjects([]);
  }, []);

  //moving the snake
  const runSingleStep = useCallback(() => {
    setSnake((snake) => {
      const head = snake[0];
      const newHead = {
        x: (head.x + direction.x + Config.width) % Config.width,
        y: (head.y + direction.y + Config.height) % Config.height,
      };

      // make a new snake by extending head
      const newSnake = [newHead, ...snake];

      // remove tail when head doesnt eat food
      if (!isObject(newHead, CellType.Food)) {
        newSnake.pop();
      }
      //remove again when eats poison
      if (isObject(newHead, CellType.Poison)) {
        newSnake.pop();
      }
      if (isObject(newHead, CellType.Snake) || score < 0) {
        resetGame();
      }

      return newSnake;
    });
  }, [direction.x, direction.y, isObject, resetGame, score]);

  const isBlocked = useCallback(
    (cell) =>
      isObject(cell, CellType.Snake) ||
      isObject(cell, CellType.Food) ||
      isObject(cell, CellType.Poison),
    [isObject]
  );
  const addObject = useCallback(
    (type) => {
      let newObject = getRandomCell(type);
      while (isBlocked(newObject)) {
        newObject = getRandomCell(type);
      }
        console.log(newObject.type)
        setObjects((currentObjects) => [...currentObjects, newObject]);
    },
    [isBlocked]
  );
  const removeObject = useCallback(() => {
      setObjects((currentObjects) =>
        currentObjects.filter((currentObject) => Date.now() - currentObject.start < 10000)
      );
  }, []);

  // update foods and poisons whenever head touches a food or a poison
  useEffect(() => {
    const head = snake[0];
    if (isObject(head, CellType.Food)) {
      console.log("ate object");
      setObjects((currentObjects) =>
        currentObjects.filter((currentObject) => !(currentObject.x === head.x && currentObject.y === head.y))
      );
    }
  }, [isObject, snake]);

  UseInterval(() => addObject(CellType.Food), 3000);
  UseInterval(() => addObject(CellType.Poison), 1000);
  UseInterval(runSingleStep, 300);
  UseInterval(() => removeObject(CellType.Food), 50);
  UseInterval(() => removeObject(CellType.Poison), 100);

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
  const cells = [];
  for (let x = 0; x < Config.width; x++) {
    for (let y = 0; y < Config.height; y++) {
      let type = CellType.Empty,
        remaining = undefined;
      if (isObject({ x, y }, CellType.Food)) {
        type = CellType.Food;
        remaining =
          10 - Math.round((Date.now() - finding({ x, y }, objects, type).start) / 1000);
      } else if (isObject({ x, y }, CellType.Snake)) {
        type = CellType.Snake;
      } else if (isObject({ x, y }, CellType.Poison)) {
        type = CellType.Poison;
        remaining =
          10 -
          Math.round((Date.now() - finding({ x, y }, objects, type).start) / 1000);
      }
      cells.push(
        <Cell key={`${x}-${y}`} x={x} y={y} type={type} remaining={remaining} />
      );
    }
  }
  return { score, isObject, cells };
};

//view
const Snake = () => {
  const { score, cells } = UseSnake();
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
