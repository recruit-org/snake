import { useEffect, useContext, useCallback, useMemo } from "react";
import { Config, CellType, Direction } from "../constants";
import {
  getDefaultSnake,
  getInitialDirection,
  getRandomCell,
} from "../helpers";
import Cell from "../components/Cell";
import { useInterval } from "./useInterval";
import { GameContext } from "../context/game";

const useSnakeController = () => {
  // const grid = useRef();
  const { snake, objects, setObjects, setDirection, setSnake, direction } =
    useContext(GameContext);

    console.log("direction", direction)

  // snake[0] is head and snake[snake.length - 1] is tail
  // usecallback prevent initialization of  function on each re- render

  const isObject = useCallback(
    ({ x, y }) => objects.find((object) => object.x === x && object.y === y),
    [objects]
  );
  const isObjectOfType = useCallback(
    ({ x, y, type }) => {
      const object = isObject({ x, y });
      return object && object.type === type;
    },
    [isObject]
  );

  // console.log("snake", snake);

  const resetGame = useCallback(() => {
    setSnake(getDefaultSnake());
    setDirection(getInitialDirection());
    // setObjects([]);
  }, [setDirection, setSnake]);

  //   const isContained = useCallback(isObject(cells) || isSnake(cells), [
  //     isObject,
  //     isSnake,
  //   ]);

  const addNewObject = useCallback(
    (type) => {
      let newObject = getRandomCell();
      while (isSnake(newObject) || isObject(newObject)) {
        newObject = getRandomCell();
      }

      newObject.type = type;

      setObjects((CurrentObjects) => [...CurrentObjects, newObject]);
      //  spread will hold all existing food then add current new food
    },
    [isObject, isSnake, setObjects]
  );

  const isSnake = useCallback(
    ({ x, y }) =>
      snake.find((position) => position.x === x && position.y === y),
    [snake]
  );

  const removeObject = useCallback(
    (type) => {
      setObjects((CurrentObjects) =>
        CurrentObjects.filter(
          (object) =>
            object.type !== type ||
            Math.floor(Date.now() - object.createTime <= 10 * 1000)
        )
      );
    },
    [setObjects]
  );

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
      //   const foodType = { x: newHead.x, y: newHead.y, type: "food" };

      // remove tail when head is not in the food
      if (!isObjectOfType({ x: newHead.x, y: newHead.y, type: "food" })) {
        newSnake.pop();
      } else {
        setObjects((currentObject) =>
          currentObject.filter(
            (object) => !(object.x === newHead.x && object.y === newHead.y)
          )
        );
      }

      if (isObjectOfType({ x: newHead.x, y: newHead.y, type: "poison" })) {
        resetGame();
      }

      if (isSnake(newHead)) {
        resetGame();
        return getDefaultSnake();
      }

      return newSnake;
    });
  }, [
    direction.x,
    direction.y,
    isObjectOfType,
    setSnake,
    isSnake,
    setObjects,
    resetGame,
  ]);
  return {
    objects,
    isObject,
    runSingleStep,
    addNewObject,
    removeObject,
    isSnake,
    isObjectOfType,
  };
};
//   useEffect(() => {
//     const head = snake[0];
//     if (isObject(head)) {
//       ("food");
//     }
//   }, [addNewObject, isObject, snake]);
//   // difference between setinerval and set timeout ....and  array.find and some
export const usePlay = () => {
  const { setDirection } = useContext(GameContext);
  const { addNewObject, removeObject, runSingleStep } = useSnakeController();

  useInterval(() => addNewObject("food"), 3 * 1000);
  useInterval(() => removeObject("food"), 100);
  useInterval(() => addNewObject("poison"), 5 * 1000);
  useInterval(() => removeObject("poison"), 200);
  useInterval(runSingleStep, 100);

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
  }, [setDirection]);
};
// ?. is called optional chaining
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chai.ning
export const useCells = () => {
  const { objects, isObjectOfType, isSnake } = useSnakeController();
  const cells = useMemo(() => {
    const elements = [];
    for (let x = 0; x < Config.width; x++) {
      for (let y = 0; y < Config.height; y++) {
        let type = CellType.Empty,
          remaining = undefined;
        if (isObjectOfType({ x, y, type: "food" })) {
          type = CellType.GoodFood;
          remaining =
            10 -
            Math.round(
              (Date.now() -
                objects.find((object) => object.x === x && object.y === y)
                  .createTime) /
                1000
            );
        }
        if (isObjectOfType({ x, y, type: "poison" })) {
          type = CellType.BadFood;
          remaining =
            10 -
            Math.round(
              (Date.now() -
                objects.find((object) => object.x === x && object.y === y)
                  .createTime) /
                1000
            );
        } else if (isSnake({ x, y })) {
          type = CellType.Snake;
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
  }, [isObjectOfType, objects, isSnake]);
  return cells;
};

// export default useSnakeController;
