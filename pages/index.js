import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/Snake.module.css";
import { isReturnStatement } from "@babel/types";

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
  Left: { x: -1, y: 0, str:"L" },
  Right: { x: 1, y: 0, str:"R" },
  Top: { x: 0, y: -1, str:"T" },
  Bottom: { x: 0, y: 1, str:"B" },
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


const useSnake = () => {

  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());

  const [direction, setDirection] = useState(Direction.Right);
  const [foodArray, setFood] = useState([{ x: 4, y: 10}]); 

  const score = snake.length - 3;
  
  
  // move the snake
  useEffect(() => {

    const runSingleStep = () => {

      const resetSnake = () => {
        setSnake(getDefaultSnake());
        setDirection(Direction.Right);
        setFood([{ x: 4, y: 10}]);
      }

      setSnake((snake) => {
        const head = snake[0];
        const newHead = { 
          x: (head.x + direction.x + Config.width) % Config.width, 
          y: (head.y + direction.y + Config.height) % Config.height 
        };
        
        
        if(snake.map((part) => newHead.x==part.x && newHead.y==part.y)
                .reduce((ans, cur) => ans || cur)
        ){
          resetSnake();       
        }
          
        const newSnake = [newHead, ...snake];
        newSnake.pop();

        return newSnake;
      });
    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 500);

    return () => clearInterval(timer);
  }, [direction, foodArray]);

  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      
      setFood((foodArray) => {
        let newFood = getRandomCell();
        while (isSnake(newFood) && isFood(newFood)) {
          newFood = getRandomCell();
        }
      
        const newFoodArray = [...foodArray.filter((food) => food.x!=head.x && food.y!=head.y), newFood];
        return newFoodArray;
      })

      setSnake((snake) => {
        // Add a new tail when food gets eaten
        const tail = snake[snake.length-1];
        const newSnake = [...snake, tail];

        return newSnake;
      });

    }
  }, [snake]);

  useEffect(() => {
    const setDirectionHelper = (newDirection, reverseDirection) => {
      setDirection((direction) => {
        if(direction != reverseDirection)
          return newDirection;
        return direction
      })
    }
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          setDirectionHelper(Direction.Top, Direction.Bottom);
          break;

        case "ArrowDown":
          setDirectionHelper(Direction.Bottom, Direction.Top);
          break;

        case "ArrowLeft":
          setDirectionHelper(Direction.Left, Direction.Right);
          break;

        case "ArrowRight":
          setDirectionHelper(Direction.Right, Direction.Left);
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);
  
  useEffect(() => {
    const addFood = () => {
      // add new food after 3 seconds
      setFood((foodArray) => {
        let newFood = getRandomCell();
        while (isSnake(newFood) && isFood(newFood)) {
          newFood = getRandomCell();
        }
        const newFoodArray = [...foodArray, newFood];
        
        return newFoodArray;
      });
      
    }
    
    const timer = setInterval(addFood, 3 * 1000);

    return () => clearInterval(timer);
  }, []);

  
  useEffect(() => {
    const deleteFood = () => {
      // delete food after 10 seconds
      setFood((foodArray) => {
        foodArray.shift();
        return foodArray;
      });
    }
    
    const timer = setInterval(deleteFood, 10 * 1000);

    return () => clearInterval(timer);
  }, []);


  const isFood = ({ x, y }) => {
    for(let food of foodArray)
      if(food?.x === x && food?.y === y) return true;
  }

  const isSnake = ({ x, y }) => {
      return snake.find((position) => position.x === x && position.y === y);
  }

  return {score, isFood, isSnake}
}


const Snake = () => {

  const {score, isFood, isSnake} = useSnake()

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
