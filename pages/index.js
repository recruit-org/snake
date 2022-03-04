import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
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
  createdAt: Date.now()
});

const Snake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(() => Direction.Right);
  //const time = new Date();
  const foodArray = [{ x: 4, y: 10, createdAt: Date.now() }];
  const [food, setFood] = useState(foodArray);
  const [score, setScore] = useState(0);
  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };
        if (newHead.y < 0)
          newHead.y = 24;
        else if (newHead.y > 24)
          newHead.y = 0;
        else if (newHead.x < 0)
          newHead.x = 24;
        else if (newHead.x > 24)
          newHead.x = 0;
        if (isSnake(newHead)) {
          setSnake(() => getDefaultSnake());
          setDirection(() => Direction.Right);
          setFood([{ x: 4, y: 10, createdAt: Date.now() }]);
          setScore(() => 0);
        }
        // make a new snake by extending head
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        const newSnake = [newHead, ...snake];

        // remove tail
        newSnake.pop();

        return newSnake;
      });
    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 500);

    return () => clearInterval(timer);
  }, [direction, food]);
  //update food
  useEffect(() => {
    const updateFood = () => {
      setFood((food) => {
        const foodCell = getRandomCell();
        const newFood = [...food, foodCell];
        return newFood;
      });
    };
    const timer = setInterval(updateFood, 3000);
    return () => clearInterval(timer);
  }, [])
  useEffect(() => {
    const updateFood = () => {
      setFood((food) => {
        const newFood = food.filter(f => Math.floor((Date.now() - f.createdAt) / 1000) < 10.00)
        return newFood;
      });
    };
    updateFood();
    const timer = setInterval(updateFood, 500);
    return () => clearInterval(timer);
  }, [])

  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      const prevFood = food.filter(f => f.x != head.x && f.y != head.y)
      setScore((score) => {
        return score + 1;
      });
      setSnake((snake) => {
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };
        if (newHead.y < 0)
          newHead.y = 24;
        else if (newHead.y > 24)
          newHead.y = 0;
        else if (newHead.x < 0)
          newHead.x = 24;
        else if (newHead.x > 24)
          newHead.x = 0;
        if (isSnake(newHead)) {
          setSnake(() => getDefaultSnake());
          setDirection(() => Direction.Right);
          setFood([{ x: 4, y: 10, createdAt: Date.now() }]);
          setScore(() => 0);
        }
        else {
          let newFood = getRandomCell();
          while (isSnake(newFood)) {
            newFood = getRandomCell();
          }
          setFood([...prevFood, newFood]);
        }
        const newSnake = [newHead, ...snake];
        return newSnake;
      });


    }


  }, [snake]);

  useEffect(() => {
    const handleNavigation = (event) => {

      switch (event.key) {
        case "ArrowRight":
          setDirection((prevDirection) => {
            if (prevDirection.x == -1 && prevDirection.y == 0)
              return Direction.Left;
            else
              return Direction.Right;
          });
          break;

        case "ArrowLeft":
          setDirection((prevDirection) => {
            if (prevDirection.x == 1 && prevDirection.y == 0)
              return Direction.Right;
            else
              return Direction.Left;
          });
          break;


        case "ArrowUp":
          setDirection((prevDirection) => {
            if (prevDirection.x == 0 && prevDirection.y == 1)
              return Direction.Bottom;
            else
              return Direction.Top;
          });
          break;

        case "ArrowDown":

          setDirection((prevDirection) => {
            if (prevDirection.x == 0 && prevDirection.y == -1)
              return Direction.Top;
            else
              return Direction.Bottom;
          });
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = ({ x, y }) =>
    food.find((position) => position.x === x && position.y === y);

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
