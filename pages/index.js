import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/Snake.module.css";

let get_direction = 1;
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
});

const Snake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  const getDefaultFood = () => [{ x: 4, y: 10 }, {x: 4, y: 11}]

  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [status, setStatus] = useState(1);
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);

  let [food, setFood] = useState(getDefaultFood());
  const [score, setScore] = useState(0);

  const reset = () => {
    setSnake(getDefaultSnake());
    setScore(0);
    setFood(getDefaultFood());
    setDirection(Direction.Right);
  }
  
  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };
        if (newHead.x > 24) newHead.x = 0;
        else if (newHead.x < 0) newHead.x = 24;
        if (newHead.y > 24) newHead.y = 0;
        else if (newHead.y < 0) newHead.y = 24;
        if (!isSnake(newHead)) {
          const newSnake = [newHead, ...snake];
          // remove tail
          newSnake.pop();
          return newSnake;
        }
        else {
          const newSnake = getDefaultSnake();
          setScore(0);
          setFood([{ x: 4, y: 10 }]);
          setDirection(Direction.Right);
          return newSnake;
        }

      });
    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 500);
    if(status === 0)clearInterval(timer);

    return () => clearInterval(timer);
  }, [direction, food, status]);

  // food after 3s
  useEffect(() => {
    setInterval(() => {
      let newFood = getRandomCell();
      while (isSnake(newFood) || isFood(newFood)) {
        console.log("change")
        newFood = getRandomCell();
      }
      setFood((food) => {
        console.log({ food })
        const newArray = [...food, newFood]
        console.log({ newArray })
        return newArray;
      });
    }, 1000)
  }, [])

  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      console.log("here")
      setScore((score) => {
        return score + 1;
      });
      setSnake((snake) => {
        const newTail = { x: head.x, y: head.y - direction.y };
        const newSnake = [...snake, newTail];
        return newSnake;
      });
      setFood((food) => {
        const newArray = [...food]

        console.log({newArray})
        const newArr = newArray.filter((e)=> e.x!==head.x && e.y !== head.y)
        console.log({newArr})
        return newArr;
      });
    }
  }, [snake]);

  useEffect(() => {
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          if (get_direction !== 4) {
            setDirection(Direction.Top);
            get_direction = 2;
          }
          break;

        case "ArrowDown":
          if (get_direction !== 2) {
            setDirection(Direction.Bottom);
            get_direction = 4;
          }
          break;
        case "ArrowLeft":
          if (get_direction !== 1) {
            setDirection(Direction.Left);
            get_direction = 3;
          }
          break;
        case "ArrowRight":
          if (get_direction !== 3) {
            setDirection(Direction.Right);
            get_direction = 1;
          }
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  const isFood = ({ x, y }) =>
    food.find((position) => position.x === x &&
      position.y === y);

  const isSnake = ({ x, y }) =>
    snake.find((position) => position.x === x && position.y === y);

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
    <button onClick={() => reset()}>reset</button>
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
