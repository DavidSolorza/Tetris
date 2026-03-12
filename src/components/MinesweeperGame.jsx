import React, { useMemo, useState } from "react";

const ROWS = 8;
const COLS = 8;
const MINES = 10;

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      hasMine: false,
      adjacent: 0,
      revealed: false
    }))
  );
}

function inBounds(x, y) {
  return x >= 0 && x < COLS && y >= 0 && y < ROWS;
}

function withGeneratedMines(firstX, firstY) {
  const board = createEmptyBoard();
  let placed = 0;

  while (placed < MINES) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    if (x === firstX && y === firstY) continue;
    if (board[y][x].hasMine) continue;
    board[y][x].hasMine = true;
    placed += 1;
  }

  const dirs = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1]
  ];

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x].hasMine) continue;
      let count = 0;
      dirs.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (inBounds(nx, ny) && board[ny][nx].hasMine) {
          count += 1;
        }
      });
      board[y][x].adjacent = count;
    }
  }

  return board;
}

function revealSafeArea(board, x, y) {
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  const stack = [[x, y]];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    if (!inBounds(cx, cy)) continue;
    const cell = next[cy][cx];
    if (cell.revealed) continue;
    cell.revealed = true;
    if (cell.adjacent !== 0 || cell.hasMine) continue;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        if (inBounds(nx, ny) && !next[ny][nx].revealed) {
          stack.push([nx, ny]);
        }
      }
    }
  }

  return next;
}

export default function MinesweeperGame({ isActive }) {
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const revealedCount = useMemo(
    () =>
      board.reduce(
        (acc, row) => acc + row.filter((c) => c.revealed && !c.hasMine).length,
        0
      ),
    [board]
  );

  const totalSafeCells = ROWS * COLS - MINES;

  const handleCellClick = (x, y) => {
    if (!isActive || isGameOver) return;

    let nextBoard = board;
    if (!isStarted) {
      nextBoard = withGeneratedMines(x, y);
      setBoard(nextBoard);
      setIsStarted(true);
    }

    const cell = nextBoard[y][x];
    if (cell.revealed) return;

    if (cell.hasMine) {
      const exploded = nextBoard.map((row) =>
        row.map((c, colIndex) => ({
          ...c,
          revealed: c.revealed || (c.hasMine && colIndex === x && row === nextBoard[y])
        }))
      );
      setBoard(
        nextBoard.map((row) =>
          row.map((c) => ({
            ...c,
            revealed: c.hasMine ? true : c.revealed
          }))
        )
      );
      setIsGameOver(true);
      setIsWin(false);
      return;
    }

    const updated = revealSafeArea(nextBoard, x, y);
    setBoard(updated);

    const newlyRevealed = updated.reduce(
      (acc, row) => acc + row.filter((c) => c.revealed && !c.hasMine).length,
      0
    );
    if (newlyRevealed === totalSafeCells) {
      setIsGameOver(true);
      setIsWin(true);
    }
  };

  const handleRestart = () => {
    setBoard(createEmptyBoard());
    setIsStarted(false);
    setIsGameOver(false);
    setIsWin(false);
  };

  return (
    <div className="game-layout">
      <section className="board-wrapper">
        <div
          className="mini-board mines-board"
          style={{ gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
        >
          {board.map((row, y) => (
            <div key={y} className="mini-row">
              {row.map((cell, x) => {
                const key = `${x}-${y}`;
                let className = "mini-cell mines-cell";
                if (cell.revealed) className += " mines-cell-revealed";
                if (cell.hasMine && isGameOver) className += " mines-cell-mine";

                return (
                  <button
                    key={key}
                    type="button"
                    className={className}
                    onClick={() => handleCellClick(x, y)}
                  >
                    {cell.revealed
                      ? cell.hasMine
                        ? "💣"
                        : cell.adjacent > 0
                        ? cell.adjacent
                        : ""
                      : " "}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="info-panel">
        <div className="info-card">
          <div className="info-item">
            <span className="label">Casillas seguras</span>
            <span className="value">
              {revealedCount} / {totalSafeCells}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Mines</span>
            <span className="value">{MINES}</span>
          </div>
        </div>

        {!isStarted && !isGameOver && (
          <button className="primary-button" onClick={handleRestart}>
            ▶ Empezar partida
          </button>
        )}

        <button className="primary-button" onClick={handleRestart}>
          Reiniciar tablero
        </button>

        <div className="controls-hint">
          <p className="controls-title">Cómo jugar</p>
          <ul>
            <li>Tap en una casilla para descubrirla.</li>
            <li>Evita las bombas, descubre todas las casillas seguras.</li>
          </ul>
        </div>
      </section>

      {isGameOver && (
        <div className="overlay">
          <div className="overlay-card">
            <h2 className="overlay-title">
              {isWin ? "¡Campo despejado!" : "Boom de corazones"}
            </h2>
            <p className="overlay-message">
              {isWin
                ? "Descubriste todas las casillas sin explotar un solo corazón."
                : "Pisaste una bomba de amor, pero siempre podemos intentarlo de nuevo."}
            </p>
            <button className="primary-button" onClick={handleRestart}>
              Jugar otra vez
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

