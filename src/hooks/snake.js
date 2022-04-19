import { useEffect, useState, useCallback, useMemo } from "react";
import { getInitialDirection, getRandomCell } from "../helpers";
import { Config, Direction, CellType } from "../constants";
import Cell from "../components/cell";
import useInterval from "./interval";

const UseSnake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];

  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(getInitialDirection());

  // const [foods, setFoods] = useState([]);
  // const [poison, setPoison] = useState([]);
  const [objects, setObjects] = useState([]);

  const score = snake.length - 3;

  const resetGame = useCallback(() => {
    setSnake(getDefaultSnake());
    setDirection(getInitialDirection());
    // setFoods([]);
    // setPoison([]);
    setObjects([]);
  }, []);

  const isFood = useCallback(
    ({ x, y }) =>
      objects.some(
        (food) => food.x === x && food.y === y && food.type === "food"
      ),
    [objects]
  );

  const isSnake = useCallback(
    ({ x, y }) =>
      snake.find((position) => position.x === x && position.y === y),
    [snake]
  );

  //checking if it's a poison cell
  const isPoison = useCallback(
    ({ x, y }) =>
      objects.some((p) => p.x === x && p.y === y && p.type === "poison"),
    [objects]
  );

  //suggested addObject method for food and poison ---------------->
  const addObject = useCallback((type) => {
    let newObject = getRandomCell(type);
    while (isSnake(newObject) || isFood(newObject)) {
      newObject = getRandomCell(type);
    }
    setObjects((currentObjects) => [...currentObjects, newObject]);
    // if (type === "food") {
    //   setObjects((currentFoods) => [...currentFoods, newObject]);
    // } else {
    //   setObjects((currentPoison) => [...currentPoison, newObject]);
    // }
  }, []);
  //removeObject method for removing food or poison-------------->
  const removeObject = useCallback((type) => {
    if (type == "poison") {
      setObjects((currentPoisons) =>
        currentPoisons.filter(
          (poison) =>
            Date.now() - poison.createdAt <= 10 * 1000 &&
            poison.type === "poison"
        )
      );
    } else {
      setObjects((currentFoods) =>
        currentFoods.filter(
          (food) =>
            Date.now() - food.createdAt <= 10 * 1000 && food.type === "food"
        )
      );
    }
  }, []);
  //moving the snake
  const runSingleStep = useCallback(() => {
    setSnake((snake) => {
      const head = snake[0];
      const newHead = {
        x: (head.x + direction.x + Config.height) % Config.height,
        y: (head.y + direction.y + Config.width) % Config.width,
      };
      const newSnake = [newHead, ...snake];

      //reset the game if snake touches its own body
      if (isSnake(newHead) || isPoison(newHead)) {
        resetGame();
        return getDefaultSnake();
      }
      if (!isFood(newHead)) {
        newSnake.pop();
      } else {
        setObjects((currentFoods) =>
          currentFoods.filter(
            (food) =>
              !(
                food.x === newHead.x &&
                food.y === newHead.y &&
                food.type === "food"
              )
          )
        );
      }
      return newSnake;
    });
  }, [direction, isFood, isSnake, resetGame]);

  useInterval(runSingleStep, 200);
  useInterval(() => addObject("food"), 3000);
  useInterval(() => removeObject("food"), 100);
  useInterval(() => addObject("poison"), 15000);
  useInterval(() => removeObject("poison"), 100);

  useEffect(() => {
    const controlDirection = (direction, oppositeDirection) => {
      setDirection((currentDirection) => {
        if (currentDirection === oppositeDirection) {
          return currentDirection;
        } else return direction;
      });
    };
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          controlDirection(Direction.Top, Direction.Bottom);
          break;

        case "ArrowDown":
          controlDirection(Direction.Bottom, Direction.Top);
          break;

        case "ArrowLeft":
          controlDirection(Direction.Left, Direction.Right);
          break;

        case "ArrowRight":
          controlDirection(Direction.Right, Direction.Left);
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);
  const cells = useMemo(() => {
    const elements = [];
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
                objects.find(
                  (food) => food.x === x && food.y === y && food.type === "food"
                ).createdAt) /
                1000
            );
        } else if (isSnake({ x, y })) {
          type = CellType.Snake;
        } else if (isPoison({ x, y })) {
          type = CellType.Poison;
        }
        elements.push(
          <Cell
            key={`${x}-${y}`}
            x={x}
            y={y}
            type={type}
            remaining={remaining}
          />
        );
      }
    }
    return elements;
  }, [objects, isFood, isSnake]);

  return { snake, cells, score };
};
export default UseSnake;
