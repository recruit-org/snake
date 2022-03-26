import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { useCallback } from "react/cjs/react.production.min";
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
  Poison: "poison",
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
      case CellType.Poison:
        return {
          backgroundColor: "blue",
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
  createdAt: Date.now(),
});

const Snake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  // const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);
  const [foods, setFoods] = useState([{ x: 4, y: 10 }]);
  const [poisons, setPoisons] = useState([{ x: 4, y: 10 }]);
  const [endGame, setEndGame] = useState(false);

  const score = snake.length - 3;

  // restart the game
  const reStartGame = () => {
    setSnake(getDefaultSnake());
    setDirection(Direction.Right);
  };

  // remove food 
  useEffect(() => {
    const removeFoods = () => {
      setFoods((currentFoods) =>
        currentFoods.filter((food) => Date.now() - food.createdAt <= 10 * 1000)
      );
    };
    const interval = setInterval(() => {
      removeFoods();
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, []); 

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
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        const newSnake = [newHead, ...snake];

        // remove tail
        if (!isFood(newHead)) {
          newSnake.pop();
        }
        if (isPoison(newHead)) {
          newSnake.pop();

          setPoisons((currentPoison) =>
            currentPoison.filter(
              (poison) => !(poison.x === newHead.x && poison.y === newHead.y)
            )
          );
        }

        if (isSnake(newHead)) {
          setEndGame(true);
        } else {
          setFoods((currentFoods) =>
            currentFoods.filter(
              (food) => !(food.x === newHead.x && food.y === newHead.y)
            )
          );
        }
        return newSnake;
      });
    };
    const interval = setInterval(() => {
      runSingleStep();
    }, 200);
    return () => {
      clearInterval(interval);
    };
  }, [direction, foods,]);

  // food add function
  const addNewFood = () => {
    let newFood = getRandomCell();
    while (isSnake(newFood) || isFood(newFood)) {
      newFood = getRandomCell();
    }
    setFoods((currentFood) => [...currentFood, newFood]);
  };

  // add poison function

  const addPoison = () => {
    let newPoison = getRandomCell();
    while (isSnake(newPoison) || isFood(newPoison) || isPoison(newPoison)) {
      newPoison = getRandomCell();
    }
    setPoisons((currentPoison) => [...currentPoison, newPoison]);
  };

  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      addNewFood();
    }
  }, [snake]);

  // Add new food after 5 sec
  useEffect(() => {
    const interval = setInterval(() => {
      addNewFood();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // add poison after 10 sec

  useEffect(() => {
    const interval = setInterval(() => {
      addPoison();
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          setDirection(Direction.Top);
          break;

        case "ArrowDown":
          setDirection(Direction.Bottom);
          break;

        case "ArrowLeft":
          setDirection(Direction.Left);
          break;

        case "ArrowRight":
          setDirection(Direction.Right);
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = ({ x, y }) =>
    foods.some((food) => food?.x === x && food?.y === y);

  const isPoison = ({ x, y }) =>
    poisons.some((poison) => poison?.x === x && poison?.y === y);

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
      } else if (isPoison({ x, y })) {
        type = CellType.Poison;
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
        {/* {cells} */}
        <div style={{ textAlign: "center", fontSize: "30px" }}>
          {endGame ? (
            <>
              <h5>Game Over</h5>
              <h5>your score is: {score}</h5>
            </>
          ) : (
            cells
          )}
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Snake), {
  ssr: false,
});
