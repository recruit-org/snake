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

const customHook = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];

  const getInitialFood = () => [{ x: 4, y: 10, counter: 0 }];
  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);

  const [foods, setFoods] = useState(getInitialFood());

  const resetGame = () => {
    setSnake(getDefaultSnake());
    setDirection(Direction.Right);
    setFoods(getInitialFood());
  }

  const addNewFood = () => {
    let newFood = getRandomCell();
    while (isSnake(newFood) && isFood(newFood)) {
        newFood = getRandomCell();
    }
    newFood.counter = 0;

    setFoods(prev => {
      return [newFood, ...prev.filter(item => !isSnake(item))];
    });
  }

  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        const newHead = { 
          x: (head.x + direction.x + Config.width) % Config.width, 
          y: (head.y + direction.y + Config.height) % Config.height
        };

        // make a new snake by extending head
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        const newSnake = [newHead, ...snake];

        // remove tail
        if(!isFood(newHead))
        newSnake.pop();

        if(isSnake(newHead)) {
          resetGame();
        }

        return newSnake;
      });
    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 500);

    return () => clearInterval(timer);
  }, [direction, foods]);

  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      addNewFood();
    }
  }, [snake]);

  useEffect(() => {
    const handleSetDirection = (opposite, curr) => {
      setDirection(prev => {
        if(prev !== opposite) return curr;
        return prev;
      });
    }
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          handleSetDirection(Direction.Bottom, Direction.Top);
          break;

        case "ArrowDown":
          handleSetDirection(Direction.Top, Direction.Bottom);
          break;

        case "ArrowLeft":
          handleSetDirection(Direction.Right, Direction.Left);
          break;

        case "ArrowRight":
          handleSetDirection(Direction.Left, Direction.Right);
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  // add food after every 3 sec
  useEffect(() => {
    const interval = setInterval(() => {
      addNewFood();
    }, 3000)

    return () => clearInterval(interval);
  }, []);

  // remove food after 10 second it created
  useEffect(() => {
    const interval = setInterval(() => {
      setFoods(
        foods => {
          return foods.map(food => ({...food, counter: food.counter + 1})).filter(food => food.counter < 10);
        }
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = ({ x, y }) => foods.some(food => food.x === x && food.y === y);

  const isSnake = ({ x, y }) =>
    snake.find((position) => position.x === x && position.y === y);

  return {
    isFood, 
    isSnake, 
    score: snake.length - getDefaultSnake().length
  }
}

const Snake = () => {
  const { isFood, isSnake, score } = customHook();
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