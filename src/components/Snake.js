import styles from "../../styles/Snake.module.css";
import { usePlay, useCells } from "../hooks/snake";
import { useContext } from "react";
import { GameContext } from "../context/game";
import { Config } from "../constants";

// const Snake =() =>{const{score,isSnake,isFood}= useSnake()
const Snake = () => {
  //   const { score, cells } = useSnake();
  const { score } = useContext(GameContext);
  const cells = useCells();
  usePlay();

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
export default Snake;
