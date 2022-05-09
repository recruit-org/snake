import styles from "../../styles/Snake.module.css";
import { useCells } from "../hooks/snake";
// import { useContext } from "react";
// import { GameContext } from "../context/game";
import { Config } from "../constants";

// const Snake =() =>{const{score,isSnake,isFood}= useSnake()
const Snake = () => {
  //   const { score, cells } = useSnake();
  // const { score } = useContext(GameContext);
  const cells = useCells();
  // usePlay();

  return (
    <div
      className={styles.grid}
      style={{
        height: Config.height * Config.cellSize,
        width: Config.width * Config.cellSize,
      }}
    >
      {cells}
    </div>
  );
};
export default Snake;
