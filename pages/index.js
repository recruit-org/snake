import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/Snake.module.css";

const Config = {
  height: 25,
  width: 25,
  cellSize: 30,
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
const useSnake = () =>{
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];

  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);

  const [foods, setFoods] = useState([{ x: 9, y: 12 }]);
  const score = snake.length- 3;

  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        
        
        const newHead =  { 
        x: (head.x + direction.x + Config.width) % Config.width,
        y: (head.y + direction.y + Config.height) % Config.height
        };
        // check if the new head colide with the body of the snake

        
        
      

        // make a new snake by extending head
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        const newSnake = [newHead, ...snake];
        

        // remove tail
        if(!isFood(newHead))
          newSnake.pop();
                

        if(isSnake(newHead)){
          setSnake(getDefaultSnake());
          setDirection(Direction.Right);
        }
        
        
        return newSnake;
      });

    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 100);

    return () => clearInterval(timer);
  }, [direction, foods]);

  const addNewFood = () => {
    let newFood = getRandomCell();
    while (isSnake(newFood)) {
      newFood = getRandomCell();
    }

    setFoods((fs) => [...fs, newFood]);
  };
  const removeFood = () => {
    setFoods((foods) => foods.slice(1));
  };

  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      setFoods((foods) => foods.filter((food) => food.x !== head.x && food.y !== head.y));
      addNewFood();
    }
  }, [snake]);

  useEffect(() => {    const interval = setInterval(() => {
      addNewFood();
    }, 3*1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      removeFood();
    }, 10*1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
   const  handleDirection = (go_Direction, non_accessable_direcion) => {
     setDirection((current_direction) => {
      if(current_direction !== non_accessable_direcion)
        return go_Direction;
      return current_direction;
    });
  }

    
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":

          handleDirection(Direction.Top, Direction.Bottom);
        
          break;

        case "ArrowDown":
          handleDirection(Direction.Bottom, Direction.Top)
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
  
const {score,isFood,isSnake} = useSnake();

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
