export const TETROMINOES = {
  I: {
    shape: [
      [1, 1, 1, 1]
    ],
    type: "I"
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    type: "O"
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    type: "T"
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    type: "S"
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    type: "Z"
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    type: "J"
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    type: "L"
  }
};

const T_KEYS = Object.keys(TETROMINOES);

export function randomTetromino() {
  const key = T_KEYS[Math.floor(Math.random() * T_KEYS.length)];
  const base = TETROMINOES[key];
  return {
    shape: base.shape.map((row) => row.slice()),
    type: base.type
  };
}

export function rotateMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const res = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      res[x][rows - 1 - y] = matrix[y][x];
    }
  }
  return res;
}

