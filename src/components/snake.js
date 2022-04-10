import UseSnake from "../hooks/snake";
import styles from "../../styles/Snake.module.css";
import { Config } from "../constants";

const Snake = () => {
  const { cells, score } = UseSnake();
  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{
          width: Config.width * Config.cellSize,
        }}
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
