import { useCallback, useMemo, useState } from "react";
import { TETROMINOES, randomTetromino, rotateMatrix } from "../utils/tetrominoes.js";

const COLS = 10;
const ROWS = 20;

const ROMANTIC_MESSAGES = [
  "Eres increíble ❤️",
  "Me haces muy feliz",
  "Eres mi persona favorita",
  "Gracias por existir 💕",
  "Tu sonrisa ilumina todo"
];

export function useTetris() {
  const [board, setBoard] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState(createPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isFinalMessage, setIsFinalMessage] = useState(false);
  const [specialMessage, setSpecialMessage] = useState("");
  const [tempPopup, setTempPopup] = useState("");

  const numericLevel = useMemo(() => Math.floor(lines / 10), [lines]);

  const levelLabel = useMemo(() => {
    if (numericLevel >= 4) return "Amor Infinito";
    if (numericLevel >= 3) return "Amor Intenso";
    if (numericLevel >= 2) return "Muchos besos";
    return "Comenzando";
  }, [numericLevel]);

  const kissesLabel = useMemo(
    () => (lines >= 20 ? "Besos entregados" : "Besos ganados"),
    [lines]
  );

  const [ghostY, setGhostY] = useState(0);

  function createPiece() {
    const tet = randomTetromino();
    return {
      ...tet,
      x: Math.floor(COLS / 2) - Math.ceil(tet.shape[0].length / 2),
      y: 0
    };
  }

  const insideBoard = (x, y) => x >= 0 && x < COLS && y < ROWS;

  const isValidPosition = (piece, offsetX, offsetY) => {
    return piece.shape.every((row, dy) =>
      row.every((cell, dx) => {
        if (!cell) return true;
        const newX = piece.x + dx + offsetX;
        const newY = piece.y + dy + offsetY;
        if (newY < 0) return true;
        if (!insideBoard(newX, newY)) return false;
        return !board[newY][newX];
      })
    );
  };

  const updateGhost = useCallback(
    (piece) => {
      let testY = piece.y;
      while (isValidPosition(piece, 0, testY - piece.y + 1)) {
        testY += 1;
      }
      setGhostY(testY);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board]
  );

  const mergePiece = (piece) => {
    const newBoard = board.map((row) => row.slice());
    piece.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (!cell) return;
        const x = piece.x + dx;
        const y = piece.y + dy;
        if (insideBoard(x, y) && y >= 0) {
          newBoard[y][x] = piece.type;
        }
      });
    });
    return newBoard;
  };

  const clearLines = (mergedBoard) => {
    let cleared = 0;
    const newBoard = mergedBoard.filter((row) => {
      const full = row.every((cell) => cell !== 0);
      if (full) cleared += 1;
      return !full;
    });

    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(0));
    }

    if (cleared > 0) {
      const baseByLines = {
        1: 100,
        2: 300,
        3: 500,
        4: 800
      };
      const base = baseByLines[cleared] ?? 100 * cleared;
      const levelMultiplier = 1 + numericLevel * 0.25;
      const gained = Math.round(base * levelMultiplier);
      setScore((s) => s + gained);
      setLines((l) => l + cleared);

      const randomMessage =
        ROMANTIC_MESSAGES[Math.floor(Math.random() * ROMANTIC_MESSAGES.length)];
      setTempPopup(randomMessage);
      setTimeout(() => setTempPopup(""), 2200);
    }

    return { newBoard, cleared };
  };

  const checkSpecialMessages = (totalLines) => {
    if (totalLines >= 20) {
      setIsFinalMessage(true);
      setSpecialMessage(
        "Este juego es solo una excusa para decirte que te amo ❤️"
      );
    } else if (totalLines >= 10) {
      setSpecialMessage("Eres la mejor parte de mi vida ❤️");
    } else {
      setSpecialMessage("");
    }
  };

  const spawnNewPiece = (mergedBoard, currentLines) => {
    const nextPiece = createPiece();
    if (!isValidPosition(nextPiece, 0, 0)) {
      setBoard(mergedBoard);
      setIsGameOver(true);
      if (!isFinalMessage) {
        setSpecialMessage("Juego terminado, pero mi amor sigue 💗");
      }
      return;
    }
    setBoard(mergedBoard);
    setCurrentPiece(nextPiece);
    updateGhost(nextPiece);
    checkSpecialMessages(currentLines);
  };

  const moveHorizontal = (dir) => {
    if (!currentPiece || isGameOver || isFinalMessage) return;
    const moved = { ...currentPiece, x: currentPiece.x + dir };
    if (isValidPosition(moved, 0, 0)) {
      setCurrentPiece(moved);
      updateGhost(moved);
    }
  };

  const moveLeft = () => moveHorizontal(-1);
  const moveRight = () => moveHorizontal(1);

  const rotate = () => {
    if (!currentPiece || isGameOver || isFinalMessage) return;
    const rotatedShape = rotateMatrix(currentPiece.shape);
    const rotated = { ...currentPiece, shape: rotatedShape };

    const kicks = [0, -1, 1, -2, 2];
    for (const dx of kicks) {
      const testPiece = { ...rotated, x: currentPiece.x + dx };
      if (isValidPosition(testPiece, 0, 0)) {
        setCurrentPiece(testPiece);
        updateGhost(testPiece);
        return;
      }
    }
  };

  const softDrop = useCallback(() => {
    if (!currentPiece || isGameOver || isFinalMessage) return;
    const moved = { ...currentPiece, y: currentPiece.y + 1 };
    if (isValidPosition(moved, 0, 0)) {
      setCurrentPiece(moved);
      updateGhost(moved);
    } else {
      const merged = mergePiece(currentPiece);
      const { newBoard, cleared } = clearLines(merged);
      const totalLines = lines + cleared;
      spawnNewPiece(newBoard, totalLines);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPiece, board, lines, isGameOver, isFinalMessage]);

  const hardDrop = () => {
    if (!currentPiece || isGameOver || isFinalMessage) return;
    let testPiece = { ...currentPiece };
    while (isValidPosition(testPiece, 0, 1)) {
      testPiece = { ...testPiece, y: testPiece.y + 1 };
      setScore((s) => s + 5);
    }
    const merged = mergePiece(testPiece);
    const { newBoard, cleared } = clearLines(merged);
    const totalLines = lines + cleared;
    spawnNewPiece(newBoard, totalLines);
  };

  const restart = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    const piece = createPiece();
    setCurrentPiece(piece);
    setScore(0);
    setLines(0);
    setIsGameOver(false);
    setIsFinalMessage(false);
    setSpecialMessage("");
    updateGhost(piece);
  };

  const fallSpeedMs = useMemo(() => {
    const base = 850;
    const faster = base - numericLevel * 60;
    return Math.max(260, faster);
  }, [numericLevel]);

  return {
    board,
    currentPiece,
    ghostY,
    score,
    lines,
    isGameOver,
    isFinalMessage,
    specialMessage,
    tempPopup,
    moveLeft,
    moveRight,
    rotate,
    softDrop,
    hardDrop,
    restart,
    levelLabel,
    kissesLabel,
    fallSpeedMs,
    numericLevel
  };
}

