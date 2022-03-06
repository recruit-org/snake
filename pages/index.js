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
  const [currentDirection, setCurrentDirection] = useState(Direction.Right);

  const [isNewGame, setIsNewGame] = useState(false);

  const initialFoods = [getRandomCell()];

  const [foods, setFoods] = useState(initialFoods);
  const [score, setScore] = useState(0);

  const resetGame = () => {
    setScore(0);
    setFoods(initialFoods);
    setCurrentDirection(Direction.Left);
    setCurrentDirection(Direction.Right);
    setSnake(getDefaultSnake());
    setIsNewGame(!isNewGame);
  };

  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        const newHead = {
          x: head.x + currentDirection.x,
          y: head.y + currentDirection.y,
        };

        // check if snake hits itself
        if (
            snake.some((cell) => cell.x === newHead.x && cell.y === newHead.y)
        ) {
          resetGame();
          return getDefaultSnake();
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
  }, [currentDirection, foods]);

  //   check if snake hit wall , then change direction to opposite

  useEffect(() => {
    const checkIfHitWall = () => {
      const head = snake[0];
      if (head.x === Config.width) {
        setSnake((snake) => {
          const newHead = {
            x: 0,
            y: head.y,
          };
          const newSnake = [newHead, ...snake];
          newSnake.pop();
          return newSnake;
        });
      } else if (head.x === -1) {
        setSnake((snake) => {
          const newHead = {
            x: Config.width - 1,
            y: head.y,
          };
          const newSnake = [newHead, ...snake];
          newSnake.pop();
          return newSnake;
        });
      } else if (head.y === Config.height) {
        setSnake((snake) => {
          const newHead = {
            x: head.x,

            y: 0,
          };
          const newSnake = [newHead, ...snake];
          newSnake.pop();
          return newSnake;
        });
      } else if (head.y === -1) {
        setSnake((snake) => {
          const newHead = {
            x: head.x,
            y: Config.height - 1,
          };
          const newSnake = [newHead, ...snake];
          newSnake.pop();
          return newSnake;
        });
      }
    };

    checkIfHitWall();
  }, [snake]);

  // make new food also check if the food is on the snake
  const makeNewFood = () => {
    const newFood = getRandomCell();
    if (snake.some((cell) => cell.x === newFood.x && cell.y === newFood.y)) {
      makeNewFood();
    }
    setFoods((foods) => [...foods, newFood]);
  };

  // add new food every 3 sec and remove the old food every 10 sec
  useEffect(() => {
    const addFoodTimer = setInterval(() => {
      console.log("Adding new food");
      makeNewFood();
    }, 3000);

    const removeFoodTimer = setInterval(() => {
      console.log("removing old food");

      setFoods((foods) => {
        // remove the first food
        const newFoods = foods.slice(1);
        return newFoods;
      });
    }, 10000);

    return () => {
      clearInterval(addFoodTimer);
      clearInterval(removeFoodTimer);
    };
  }, [isNewGame]);

  // update score and enlarge snake size whenever head touches a food
  useEffect(() => {
    const head = snake[0];

    // if snake eat food then remove it and add new food
    if (foods.some((food) => food.x === head.x && food.y === head.y)) {
      setFoods((foods) => {
        const newFoods = foods.filter(
            (food) => food.x !== head.x || food.y !== head.y
        );

        newFoods.push(getRandomCell());
        return newFoods;
      });
      setScore((score) => score + 1);
      // update snake length by extending it
      setSnake((snake) => [
        ...snake,
        { x: snake[snake.length - 1].x, y: snake[snake.length - 1].y },
      ]);
    }
  }, [snake, foods]);

  useEffect(() => {
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          setCurrentDirection((previousDirection) => {
            if (previousDirection == Direction.Bottom) return previousDirection;
            return Direction.Top;
          });
          break;

        case "ArrowDown":
          setCurrentDirection((previousDirection) => {
            if (previousDirection == Direction.Top) return previousDirection;
            return Direction.Bottom;
          });
          break;

        case "ArrowLeft":
          setCurrentDirection((previousDirection) => {
            if (previousDirection == Direction.Right) return previousDirection;
            return Direction.Left;
          });

          break;

        case "ArrowRight":
          setCurrentDirection((previousDirection) => {
            if (previousDirection == Direction.Left) return previousDirection;
            return Direction.Right;
          });
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = ({ x, y }) => {
    let bool = false;
    foods.forEach((food) => {
      if (food.x === x && food.y === y) {
        bool = true;
      }
    });
    return bool;
  };

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
