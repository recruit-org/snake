import { Config } from "../constants";

import styles from "../../styles/Snake.module.css";
import { useCells, usePlay } from "../hooks/snake";
import { useContext } from "react";
import { GameContext } from "../context/game";

const Snake = () => {
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
