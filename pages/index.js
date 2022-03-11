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
  Food1: "food1",
  Food2:"food2",
  Food3:"food3",
  Empty: "empty",
};

const Direction = {
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
  Top: { x: 0, y: -1 },
  Bottom: { x: 0, y: 1 },
};

var checkDirection=0;
var keepCount=0;

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
       case CellType.Food1:
        return {
          backgroundColor: "darkorange",
          borderRadius: 20,
          width: 32,
          height: 32,
        };
         case CellType.Food2:
        return {
          backgroundColor: "darkorange",
          borderRadius: 20,
          width: 32,
          height: 32,
        };   
         case CellType.Food3:
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
const getRandomWrongCell = () => ({
  x: Math.floor(Math.random() * Config.width)+24,
  y: Math.floor(Math.random() * Config.width)+24,
});
const Snake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  const getDefaultFoodArray = () => [
    { x: 20,y: 40 }
  ]
    
  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);

  const [food, setFood] = useState({x:4,y:10});
  const [food1,setFood1]=useState({x:10,y:4});
  const [food2,setFood2]=useState({x:14,y:15});
  const [food3,setFood3]=useState({x:18,y:21});
  const [score, setScore] = useState(0);

  const isDead=(newHead)=>{
    const head=newHead;
    if(isSnake(head.x,head.y)){
         return Snake.getDefaultSnake();
        }
  }

  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        var dumX=head.x + direction.x;
        var dumY=head.y + direction.y;
        if(head.x + direction.x>24){
          dumX=0;
        }
        else if(head.x + direction.x<0){
          dumX=24;
        }
        else if(head.y + direction.y>24){
          dumY=0;
        }
        else if(head.y + direction.y<0){
          dumY=24;
        }
        const newHead = { x: dumX, y: dumY};
        if(isSnake(newHead)){
         return getDefaultSnake();
        }
        // make a new snake by extending head
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        const newSnake=[newHead,...snake];

        // remove tail
        newSnake.pop();

        return newSnake;
      });
      
    };

    runSingleStep();
    const timer = setInterval(runSingleStep, 500);

    return () => clearInterval(timer);
  }, [direction, food ,food1,food2]);

 

  const increaseSize = () =>{
    const tail = snake[snake.length-1];
      const prevTail=snake[snake.length-2];
      var newTail;
      if(tail.x==prevTail.x && prevTail.y>tail.y){
         newTail = { x: tail.x , y: tail.y-1 };
      }
      else if(tail.x==prevTail.x && prevTail.y<tail.y){
         newTail = { x: tail.x , y: tail.y+1 };
      }
      else if(prevTail.x>tail.x){
       newTail = { x: tail.x-1, y: tail.y };
      }
      else{
         newTail = { x: tail.x+1, y: tail.y };
      }
         snake.push(newTail);
        return snake;
  }
 
  

  useEffect(() => {
  const interval = setInterval(() => {
    if(keepCount==0){
       let newFood = getRandomCell();
      while (isSnake(newFood)) {
        newFood = getRandomCell();
      }
      setFood(newFood);
      keepCount++;
    }
    else if(keepCount==1){
       let newFood1 = getRandomCell();
      while (isSnake(newFood1) || isFood(newFood1) || isFood2(newFood1)) {
        newFood1 = getRandomCell();
      }
      setFood1(newFood1);
      keepCount++;
    }
    else if(keepCount==2){
       let newFood3 = getRandomCell();
      while (isSnake(newFood3) || isFood(newFood3) || isFood2(newFood3)|| isFood1(newFood3)) {
        newFood3 = getRandomCell();
      }
      setFood3(newFood3);
      keepCount++;
    }  
    else {
       let newFood2 = getRandomCell();
      while (isSnake(newFood2) || isFood(newFood2) || isFood1(newFood2)||isFood3(newFood2)) {
        newFood2 = getRandomCell();
      }
      setFood2(newFood2);
      keepCount=0;
    }   
  }, 3000);
  return () => clearInterval(interval);
  }, []);

  // update score whenever head touches a food
  useEffect(() => {
    const head=snake[0]
      
    if (isFood(head)) {
      increaseSize();
      setScore((score) => {
        return score + 1;
      });

     let newFood = getRandomWrongCell();
     /* while (isSnake(newFood)) {
        newFood = getRandomCell();
     }*/

      setFood(newFood); 
    }
    if (isFood1(head)) {
      increaseSize();
      setScore((score) => {
        return score + 1;
      });

      let newFood1 = getRandomWrongCell();
      setFood1(newFood1); 
      
    }
    if (isFood2(head)) {
      increaseSize();
      setScore((score) => {
        return score + 1;
      });

      let newFood2 = getRandomWrongCell();
     

      setFood2(newFood2); 
      
    }
    if (isFood3(head)) {
      increaseSize();
      setScore((score) => {
        return score + 1;
      });

      let newFood3 = getRandomWrongCell();
     

      setFood3(newFood3); 
      
    }
   
   
  }, [snake]);


  useEffect(() => {
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          if(checkDirection==0 || checkDirection!=2){
             setDirection(Direction.Top);
             checkDirection=1;
          }
         
          break;

        case "ArrowDown":
          if(checkDirection==0 || checkDirection!=1){
            setDirection(Direction.Bottom);
             checkDirection=2;
          }
          break;

        case "ArrowLeft":
          if(checkDirection==0 || checkDirection!=4){
            setDirection(Direction.Left);
            checkDirection=3;
          }
          
          break;

        case "ArrowRight":
          if(checkDirection==0 || checkDirection!=3){
            setDirection(Direction.Right);
            checkDirection=4;
          }
          
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = ({ x, y }) => food?.x === x && food?.y === y;
  const isFood1 = ({ x, y }) => food1?.x === x && food1?.y === y;
  const isFood2 = ({ x, y }) => food2?.x === x && food2?.y === y;
 const isFood3 = ({ x, y }) => food3?.x === x && food3?.y === y;  

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
      else if(isFood1({x,y})){
        type=CellType.Food1;
      }
       else if(isFood2({x,y})){
        type=CellType.Food2;
      }
      else if(isFood3({x,y})){
        type=CellType.Food3;
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
