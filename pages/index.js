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
  Poison: "poison",
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
          backgroundColor: "tomato",
          borderRadius: 20,
          width: 32,
          height: 32,
          transform: `scale(${0.5 + remaining / 20})`,
        };
      
      case CellType.Poison:
        return {
          backgroundColor: "black",
          borderRadius: 5,
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

const getRandomCellOfType = (cellType) => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
  createdAt: Date.now(),
  type: cellType, 
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


/* 
hook structure:
  1. define the states - useState
  2. define useMemo, useCallback
  3. define useEffect
*/
const useSnake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(getInitialDirection());

  // food, and poison are stored as objects
  const [objects, setObjects] = useState([]);

  const defaultSnakeSize = 3
  const score = snake.length - defaultSnakeSize;

  // useCallback() prevents instantiation of a function on each rerender
  // based on the dependency array

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = useCallback(
    ({ x, y }) => objects.some((object) => object.x === x && object.y === y && object.type === CellType.Food),
    [objects]
  );

  const isPoison = useCallback(
    ({ x, y }) => objects.some((object) => object.x === x && object.y === y && object.type === CellType.Poison),
    [objects]
  )

  const isSnake = useCallback(
    ({ x, y }) =>
      snake.find((position) => position.x === x && position.y === y),
    [snake]
  );

  const isOccupied = useCallback((cell) => isSnake(cell) || isFood(cell) || isPoison(cell),
    [isFood, isPoison, isSnake]);


  const addObject = useCallback((type) => {
    // adds object of given type (food or poison)
    let newObject = getRandomCellOfType(type);
    while (isOccupied(newObject)) {
      newObject = getRandomCellOfType(type);
    }
    setObjects((currentObjects) => [...currentObjects, newObject]);
  }, [isOccupied]);

  const removeObject = useCallback( () => {
    // only keep those objects which were created within last 10s.
    setObjects((currentObjects) =>
    currentObjects.filter((object) => Date.now() - object.createdAt < 10 * 1000)
    );
  }, []);

  const resetGame = useCallback(() => {
    // resets the snake ,objects, and direction to initial values
    setObjects([]);
    setDirection(getInitialDirection());
  }, []);


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

      // reset the game if the snake hits itself
      if (isSnake(newHead)) {
        resetGame();
        return getDefaultSnake();
      }
      
      // when the snake is bigger than it's default size, decrease snake size if it hits poison 
      // otherwise, reset the game
      if (isPoison(newHead)) {
        if (newSnake.length - 1 <= defaultSnakeSize ) {
          resetGame();
          return getDefaultSnake();
        } else {
          newSnake.pop();
          setObjects((currentObjects) => 
          currentObjects.filter(
            (object) => !(object.x === newHead.x && object.y === newHead.y)
          ));
        }
      }

      // remove tail from the increased size snake
      // only if the newHead isn't a food
      if (!isFood(newHead)) {
        newSnake.pop();
      } else {
        setObjects((currentObjects) =>
          currentObjects.filter(
            (object) => !(object.x === newHead.x && object.y === newHead.y)
          )
        );
      }

      return newSnake;
    });
  }, [direction, isFood, isSnake, isPoison, resetGame]);

  useInterval(runSingleStep, 200);
  useInterval(() => addObject(CellType.Food), 3000);
  useInterval(() => addObject(CellType.Poison), 5000);
  useInterval(removeObject, 100);


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
              // find the object on (x, y) co-ordinate to access it's 'createdAt' property
              objects.find((object) => object.x === x && object.y === y).createdAt) /
              1000
          );
      } else if (isSnake({ x, y })) {
        type = CellType.Snake;
      } else if (isPoison({x, y})) {
        type = CellType.Poison;
        remaining = 
          10 - 
          Math.round(
            (Date.now() - 
              objects.find((object) => object.x === x && object.y === y).createdAt) /
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
