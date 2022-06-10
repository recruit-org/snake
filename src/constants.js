export const Config = {
    height: 25,
    width: 25,
    cellSize: 32,
  };
  
export const CellType = {
    Snake: "snake",
    Food: "food",
    Poison: "poison",
    Empty: "empty",
  };
  
export const Direction = {
    Left: { x: -1, y: 0 },
    Right: { x: 1, y: 0 },
    Top: { x: 0, y: -1 },
    Bottom: { x: 0, y: 1 },
  };