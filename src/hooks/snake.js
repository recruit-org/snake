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

  const [objects, setObjects] = useState([]);

  const score = snake.length - 3;

  const resetGame = useCallback(() => {
    setSnake(getDefaultSnake());
    setDirection(getInitialDirection());
    setObjects([]);
  }, []);

  //checking if the object is of the given type-------------------->
  const isObjectOfType = useCallback(
    ({ x, y }, type) =>
      objects.some((obj) => obj.x === x && obj.y === y && obj.type === type),
    [objects]
  );

  const isSnake = useCallback(
    ({ x, y }) =>
      snake.find((position) => position.x === x && position.y === y),
    [snake]
  );

  //suggested addObject method for food and poison ---------------->
  const addObject = useCallback((type) => {
    let newObject = getRandomCell(type);
    while (
      isSnake(newObject) ||
      isObjectOfType(newObject, CellType.Food) ||
      isObjectOfType(newObject, CellType.Poison)
    ) {
      newObject = getRandomCell(type);
    }
    setObjects((currentObjects) => [...currentObjects, newObject]);
  }, []);

  //removeObject method for removing food or poison-------------->
  const removeObject = useCallback(() => {
    setObjects((currentObjects) =>
      currentObjects.filter(
        (object) => Date.now() - object.createdAt <= 10 * 1000
      )
    );
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
      if (isSnake(newHead) || isObjectOfType(newHead, CellType.Poison)) {
        resetGame();
        return getDefaultSnake();
      }
      if (!isObjectOfType(newHead, CellType.Food)) {
        newSnake.pop();
      } else {
        setObjects((currentFoods) =>
          currentFoods.filter(
            (food) =>
              !(
                food.x === newHead.x &&
                food.y === newHead.y &&
                food.type === CellType.Food
              )
          )
        );
      }
      return newSnake;
    });
  }, [direction, isObjectOfType, isSnake, resetGame]);

  useInterval(runSingleStep, 200);
  useInterval(() => addObject(CellType.Food), 3000);
  useInterval(() => addObject(CellType.Poison), 15000);
  useInterval(removeObject, 100);

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
        if (isObjectOfType({ x, y }, CellType.Food)) {
          type = CellType.Food;
          remaining =
            10 -
            Math.round(
              (Date.now() -
                objects.find(
                  (food) =>
                    food.x === x && food.y === y && food.type === CellType.Food
                ).createdAt) /
                1000
            );
        } else if (isSnake({ x, y })) {
          type = CellType.Snake;
        } else if (isObjectOfType({ x, y }, CellType.Poison)) {
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
  }, [objects, isObjectOfType, isSnake]);

  return { snake, cells, score };
};
export default UseSnake;
