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
  const [direction, setDirection] = useState(Direction.Right);

  const [food, setFood] = useState([]);
  const [score, setScore] = useState(0);

  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // make a new snake by extending head
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        
        let newSnake = [newHead, ...snake];
        for (let index in newSnake){
          if(direction===Direction.Right){
            if(newSnake[index].x===Config.width){
              newSnake[index].x=0
            }
          }
          if(direction===Direction.Left){
            if(newSnake[index].x===-1){
              newSnake[index].x=Config.width-1
            }
          }
          if(direction===Direction.Top){
            if(newSnake[index].y===-1){
              newSnake[index].y=Config.height-1
            }
          }
          if(direction===Direction.Bottom){
            if(newSnake[index].y===Config.height){
              newSnake[index].y=0
            }
          }
        }
        const tempSnake = [...snake]
        // remove tail
        !isFood(newHead) && newSnake.pop() && tempSnake.pop();

        for(let index in tempSnake){
           if(tempSnake[index].x===newHead.x && tempSnake[index].y === newHead.y){  
            setSnake(getDefaultSnake());
            setDirection(Direction.Right);
            setFood([ { x: 4, y: 10 ,time: Date.now() } ]);
            setScore(0);
          }
        }
        return newSnake;
      });
    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 500);

    return () => clearInterval(timer);
  }, [direction, food]);

  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];
      if (isFood(head)) {
      setScore((score) => {
        return score + 1;
      });

      const filteredFood = food.filter((f)=>f.x!==head.x || f.y!==head.y);
      setFood(()=>[...filteredFood])
    }
    
  }, [snake]);

  useEffect(() => {
    const showFood = () => {

      let newFood = getRandomCell();
      while (isSnake(newFood)) {
        newFood = getRandomCell();
      }

      setFood((prevFood)=> [{ ...newFood, time: Date.now() }, ...prevFood] );
    }     
    showFood();
    const timer = setInterval(showFood, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const removeFood = () => {

    setFood((prevFood)=>{
        const filteredFood = prevFood.filter((f)=>(Math.abs(Date.now()-f.time))<=10000);
        return [...filteredFood]
    });
    } 
    removeFood();
    const timer = setInterval(removeFood, 1000);

    return () => clearInterval(timer);
  }, []);


const handleDirection = (currentDirection,revCurrentDirection) =>{

  setDirection(prevDirection=>{
    if(prevDirection === revCurrentDirection)
      return prevDirection;
    return currentDirection;
  })
}
  useEffect(() => {
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          handleDirection(Direction.Top, Direction.Bottom)            
          break;

        case "ArrowDown":
          handleDirection(Direction.Bottom, Direction.Top) 
          break;

        case "ArrowLeft":
          handleDirection(Direction.Left, Direction.Right) 
          break;

        case "ArrowRight":
          handleDirection(Direction.Right, Direction.Left) 
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = ({ x, y }) => food.some((f)=>f?.x === x && f?.y === y)   

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
