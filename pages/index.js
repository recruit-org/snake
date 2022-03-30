import dynamic from "next/dynamic";
import { useEffect, useState, useRef, useCallback } from "react";
// import { useCallback } from "react/cjs/react.production.min";
import styles from "../styles/Snake.module.css";

const Config = {
  height: 25,
  width: 25,
  cellSize: 32,
};

const CellType = {
  Snake: "snake",
  GoodFood: "goodfood",
  BadFood: "badfood",
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

      case CellType.GoodFood:
        return {
          backgroundColor: "darkorange",
          borderRadius: 20,
          width: 32,
          height: 32,
        };
      case CellType.BadFood:
        return {
          backgroundColor: "red",
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
  createTime: Date.now(),
});

const useInterval = (callback, duration) => {
  const time = useRef(0);
  const wrappedCallback = useCallback(() => {
    if (Date.now() - time.current >= duration) {
      console.log("callback", callback);
      time.current = Date.now();
      callback();
    }
  }, [callback, duration]);
  useEffect(() => {
    const interval = setInterval(wrappedCallback, 1000 / 60);
    return () => clearInterval(interval);
  }, [wrappedCallback, duration]);
};

const useSnake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);

  const [foods, setFoods] = useState([{ x: 4, y: 10, createTime: Date.now() }]);
  const [poisons, setPoisons] = useState([
    { x: 5, y: -10, createTime: Date.now() },
  ]);
  const score = snake.length - 3;

  // console.log("snake", snake);

  const resetGame = useCallback(() => {
    setSnake(getDefaultSnake());
    setDirection(Direction.Right);
  }, []);
  // usecallback prevent initialization of  function on each re- render
  const addNewFood = useCallback(() => {
    let newFood = getRandomCell();
    while (isSnake(newFood) || isFood(newFood)) {
      newFood = getRandomCell();
    }

    setFoods((CurrentFoods) => [...CurrentFoods, newFood]);
    //  spread will hold all existing food then add current new food
  }, [isFood, isSnake]);

  const addPoison = useCallback(() => {
    let newPoison = getRandomCell();
    while (isSnake(newPoison) || isPoison(newPoison)) {
      newPoison = getRandomCell();
    }

    setPoisons((CurrentPoisons) => [...CurrentPoisons, newPoison]);
  }, [isPoison, isSnake]);

  const isFood = useCallback(
    ({ x, y }) => foods.some((food) => food.x === x && food.y === y),
    [foods]
  );
  const isPoison = useCallback(
    ({ x, y }) => poisons.some((poison) => poison.x === x && poison.y === y),
    [poisons]
  );

  // console.log(isFood)
  const isSnake = useCallback(
    ({ x, y }) =>
      snake.find((position) => position.x === x && position.y === y),
    [snake]
  );

  const removeEachFood = useCallback(() => {
    setFoods((currentFoods) =>
      currentFoods.filter((food) =>
        Math.floor(Date.now() - food.createTime <= 10 * 1000)
      )
    );
  }, []);
  const removePoison = useCallback(() => {
    setPoisons((CurrentPoisons) =>
      CurrentPoisons.filter((poison) =>
        Math.floor(Date.now() - poison.createTime <= 5 * 1000)
      )
    );
  }, []);

  // move the snake

  const runSingleStep = useCallback(() => {
    setSnake((snake) => {
      const head = snake[0];
      const newHead = {
        x: (head.x + direction.x + Config.width) % Config.width,
        y: (head.y + direction.y + Config.height) % Config.height,
      };

      // make a new snake by extending head
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
      const newSnake = [newHead, ...snake];

      // remove tail when head is not in the food
      // if(!isFood(newHead)){
      // newSnake.pop();}
      if (!isFood(newHead)) {
        newSnake.pop();
      } else {
        //   let gameHasBeenReset = false;
        //   foods.forEach(
        //     // (food) => !(food.x == newHead.x && food.y === newHead.y)
        //     (food) => {
        //       if (gameHasBeenReset) {
        //         return;
        //       }
        //       if (
        //         food.x == newHead.x &&
        //         food.y === newHead.y &&
        //         food.type === "badFood"
        //       ) {
        //         gameHasBeenReset = true;
        //         resetGame();
        //       }
        //     }
        //     // it will remove that food which is matched with the position of snake
        //   );
        //   if (gameHasBeenReset) {
        //     return;
        //   }
        setFoods((currentFoods) =>
          currentFoods.filter(
            (food) => !(food.x == newHead.x && food.y === newHead.y)
            // it will remove that food which is matched with the position of snake
          )
        );
      }
      if (isPoison(newHead)) {
        resetGame();
      }

      if (isSnake(newHead)) {
        resetGame();
      }

      return newSnake;
    });

    // const timer = setInterval(runSingleStep, 1000);

    // return () => clearInterval(timer);
  }, [direction, isFood, isSnake, isPoison, resetGame]);

  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      // setScore((score) => {
      //   return score + 1;
      // });

      addNewFood();
    }
    //   let newFood = getRandomCell();
    //   while (isSnake(newFood)) {
    //     newFood = getRandomCell();
    //   }
    //   setFoods(newFood)
    // }
  }, [addNewFood, isFood, snake]);
  // difference between setinerval and set timeout ....and  array.find and some

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     addNewFood();
  //   }, 3 * 1000);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [addNewFood]);

  // useEffect(() => {
  //   const disappearFood = setInterval(() => {
  //     removeEachFood();
  //   }, 1000);
  //   return () => clearInterval(disappearFood);
  // }, []);

  useInterval(addNewFood, 3 * 1000);
  useInterval(removeEachFood, 100);
  useInterval(runSingleStep, 100);
  useInterval(addPoison, 5 * 1000);
  useInterval(removePoison, 100);

  useEffect(() => {
    const handleDirection = (direction, oppositeDirection) => {
      setDirection((currentDirection) => {
        if (currentDirection !== oppositeDirection) {
          return direction;
        }
        return currentDirection;
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

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  // const isFood = ({ x, y }) => foods.some((food)=>food.x === x && food.y === y);
  // console.log(isFood)
  // const isSnake = ({ x, y }) =>
  // snake.find((position) => position.x === x && position.y === y);
  //  console.log(isSnake,snake)
  return { score, isSnake, isFood, isPoison };
};
// update score whenever head touches a food

const Snake = () => {
  const { score, isSnake, isFood, isPoison } = useSnake();

  const cells = [];
  for (let x = 0; x < Config.width; x++) {
    for (let y = 0; y < Config.height; y++) {
      let type = CellType.Empty;
      if (isFood({ x, y })) {
        type = CellType.GoodFood;
      }
      if (isPoison({ x, y })) {
        type = CellType.BadFood;
      } else if (isSnake({ x, y })) {
        type = CellType.Snake;
      }
      cells.push(<Cell key={`${x}-${y}`} x={x} y={y} type={type} />);
    }
    // return{snake,cells,score}
  }
  // const Snake =() =>{const{score,isSnake,isFood}= useSnake()

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
