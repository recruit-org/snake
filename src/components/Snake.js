import {useSnake} from "../hooks/snake";
import {Config} from "../constants";
import styles from "../../styles/Snake.module.css";

const Snake = () => {
    const { cells, score } = useSnake();
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