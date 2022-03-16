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
  y: Math.floor(Math.random() * Config.height),
});


const useSnake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];

  // timestamp is an additional property to keep track of the time elapsed
  // so that we can remove the food after a time interval 
  const getInitialFood = () => [ {x: 4, y: 10 , timestamp: Date.now()}];

  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);

  const [foods, setFoods] = useState(getInitialFood());
  const score = snake.length - getDefaultSnake().length;

  const resetGame = () => {
    setSnake(getDefaultSnake());
    setDirection(Direction.Right);
    setFoods(getInitialFood());
  }
  
  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];

        // x: 0 .. Config.width
        // y: 0 .. Config.height
        const newHead = { 
          x: (head.x + direction.x + Config.width) % Config.width,
          y: (head.y + direction.y + Config.height) % Config.height 
        };

        // make a new snake by extending head
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        const newSnake = [newHead, ...snake];

        // remove tail only when head is not food
        if (!isFood(newHead)) {
          newSnake.pop();
        }

        // reset game when head is snake
        if (isSnake(newHead)) {
          resetGame();
        }
        
        return newSnake;
      });
    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 500);

    return () => clearInterval(timer);
  }, [direction, foods]);



  // remove food whenever head touches a food
  const removeFood = (foodToRemove) => {
    setFoods((foods) => foods.filter((food) => food.x != foodToRemove.x || food.y != foodToRemove.y ));
  }

  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      removeFood(head);
    }
  }, [snake]);




  // add food after a time interval (3s)
  const addNewFood = () => {
    let newFood = getRandomCell();
    while (isSnake(newFood) || isFood(newFood)) {
      newFood = getRandomCell();
    }
    setFoods( (foods) => [{...newFood, timestamp: Date.now()}, ...foods]);
  }
  
  useEffect(() => {
    const interval = setInterval(addNewFood, 3 * 1000);

    return () => clearInterval(interval);
  }, [])



  // remove food after a time interval (10s)
  const removeFoodAfterInterval = (timeInMiliSec) => {
    setFoods(foods => {
      return foods.filter(food => {
        return Date.now() - food.timestamp <= timeInMiliSec
      })
    });
  }

  useEffect(() => {
    removeFoodAfterInterval(10 * 1000);

    // call the removeFood function after each second to remove foods that existed more than or equal to 10s
    const interval = setInterval(() => removeFoodAfterInterval(10 * 1000), 1000);

    return () => clearInterval(interval);
  }, [])



  useEffect(() => {

    // handle direction so that snake can't change direction to the opposite direction
    const handleDirection = (newDirection, oppositeDirection) => {
      setDirection((direction) => { 
        if(direction != oppositeDirection) 
          return newDirection;
        return direction;
      })
    }
    
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

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = ({ x, y }) => foods.some(food => food.x == x && food.y == y);

  const isSnake = ({ x, y }) =>
    snake.find((position) => position.x === x && position.y === y);
 
    return {score, isFood, isSnake};

}


const Snake = () => {
  const {score, isFood, isSnake} = useSnake();

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
