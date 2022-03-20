import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/Snake.module.css";
// game area
const Config = {
  height: 25,
  width: 25,
  cellSize: 32, // possibly sqpx area of each cell
};

const CellType = {
  Snake: "snake",
  Food: "foods",
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
          backgroundColor: "purple",
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
        left: x * Config.cellSize , // position of the game area
        top: y * Config.cellSize,
        width: Config.cellSize,
        height: Config.cellSize,
      }}
    >
      <div className={styles.cell} style={getStyles()}></div>
    </div>
  );
};

//self-explanatory, returns random x,y within game area 
const getRandomCell = () => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
});

const useSnake = () => {
  const getDefaultSnake = () => [ // ah yes ... three of them because three starting cells and they are each one cell behind the other contiguously  
  { x: 8, y: 12 },
  { x: 7, y: 12 },
  { x: 6, y: 12 },
];
const grid = useRef();

// snake[0] is head and snake[snake.length - 1] is tail
const [snake, setSnake] = useState(getDefaultSnake());
// console.log("snake: ", snake)
const [direction, setDirection] = useState(Direction.Right);

const [foods, setFood] = useState([{ x: 4, y: 10 }]);
const [score, setScore] = useState(0);

const prevCountRef = useRef();


useEffect(() => {
  //assign the ref's current value to the count Hook on direction change
  prevCountRef.current = direction;
}, [direction]); // the parameter in the square bracket basically represents the trigger to activate a hook

const resetGame = () => {
  setSnake(getDefaultSnake())
  setDirection(Direction.Right)
  setFood({x : 4, y: 12})
}
// move the snake 
// Similar to componentDidMount and componentDidUpdate:
useEffect(() => {
  const runSingleStep = () => {
    setSnake((snake) => {
      const head = snake[0];
      // we want the x and y to be within the game field
      // which is why we mod the position 
      const newHead = { x: (head.x + direction.x + Config.width) % Config.width, 
        y: (head.y + direction.y + Config.height) % Config.height };
      // console.log("newHead: ", newHead)
      // console.log("snake: ", snake)
      // make a new snake by extending head
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
      const newSnake = [newHead, ...snake];
      // console.log("newsnake: ", newSnake)
      // remove tail
      newSnake.pop();

      if (isSnake(newHead)) {
        resetGame()
      }
      //OH
      return newSnake;
    });
  };

  runSingleStep();
  const timer = setInterval(runSingleStep, 500);

  return () => clearInterval(timer);
}, [direction, foods]);




// add new food every 3 seconds and give them a lifespan of 10 seconds
useEffect(() => {
  const interval = setInterval(() => {
    let newFood = getRandomCell()

    while (isFood(newFood) && isSnake(newFood)) {
      newFood = getRandomCell()   // making sure that new food ain't generated on an oldfood or snake body
    }

    setFood(currentFoods => [...currentFoods, newFood])
  }, 3*1000)

  return () => {
    clearInterval(interval)
  }
}, [])

// update score whenever head touches a foods
useEffect(() => {
  const head = snake[0];
  if (isFood(head)) {
    setScore((score) => {
      return score + 1;
    });
  
    setSnake((snake) => {
      // console.log("TRYNNA SET NEW SNAKE HERE")
      const head = snake[0];
      const newHead = { x: head.x + direction.x, y: head.y + direction.y };
      const newSnake = [newHead, ...snake];
      return newSnake;
    })
    let newFood = getRandomCell();
    while (isSnake(newFood) || isFood(newFood)) {
      newFood = getRandomCell();
    }

    setFood((foods) => {
      let newFood = getRandomCell();
      while (isSnake(newFood) && isFood(newFood)) {
        newFood = getRandomCell();
      }

      const newFoodArray = [...foods.filter((food) => food.x!=head.x && food.y!=head.y), newFood];
      return newFoodArray;
    })


  }
}, [snake]);

useEffect(() => {

  const helperDirection = (direction, oppositeDirection) => {
    setDirection((currentDirection) => {
      if (currentDirection !== oppositeDirection){
        return direction
      }

      return currentDirection
    })
  }

  const handleNavigation = (event) => {
    // console.log("curr: "+ prevCountRef.current.x + " " + prevCountRef.current.y); 
    switch (event.key) {
      case "ArrowUp":  
        setDirection ((direction) => {   // DJ's approach
          if (direction !== Direction.Bottom) {
            return Direction.Top
          }

          return direction
        })
        break;

      case "ArrowDown":
        // dj's approach but with helper function
        helperDirection(Direction.Bottom, Direction.Top)
        break;

      case "ArrowLeft":  // my approach
        if (prevCountRef.current ==  Direction.Right) {
          console.log("LEFT E JAITESILAM")
          break
        }
        setDirection(Direction.Left);
        break;

      case "ArrowRight":
      if (prevCountRef.current == Direction.Left) {
          console.log("RIGHT E JAITESILAM")
          break
        }
        setDirection(Direction.Right);

        break;
    }
  };
  window.addEventListener("keydown", handleNavigation);

  return () => window.removeEventListener("keydown", handleNavigation);
}, []);

// ?. is called optional chaining
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
const isFood = ({ x, y }) => {
  for(let food of foods)
    if(food?.x === x && food?.y === y) return true;
}

const isSnake = ({ x, y }) =>
  snake.find((position) => position.x === x && position.y === y); // i know what this does, but i dont understand how



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
  // VIEW
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