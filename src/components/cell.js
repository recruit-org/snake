import { Config, CellType, Direction } from "../constants";
import styles from "../../styles/Snake.module.css";

const Cell = ({ x, y, type, remaining }) => {
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
          transform: `scale(${0.5 + remaining / 20})`,
        };
      case CellType.Poison:
        return {
          backgroundColor: "red",
          borderRadius: 20,
          width: 32,
          height: 32,
        };
      default:
        return {};
    }
  };
  return (
    // eslint-disable-next-line react/react-in-jsx-scope
    <div
      key={`${x}-${y}`}
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

export default Cell;
