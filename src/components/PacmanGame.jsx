import React, { useEffect, useState } from "react";
import { useGameLoop } from "../hooks/useGameLoop.js";

const LAYOUT = [
  "###########",
  "#.........#",
  "#.###.###.#",
  "#.#.....#.#",
  "#.#.###.#.#",
  "#...#P#...#",
  "#.#.###.#.#",
  "#.#.....#.#",
  "#.###.###.#",
  "#.........#",
  "###########"
];

const ROWS = LAYOUT.length;
const COLS = LAYOUT[0].length;

function parseLayout() {
  let player = { x: 0, y: 0 };
  const pellets = new Set();

  LAYOUT.forEach((row, y) => {
    row.split("").forEach((ch, x) => {
      if (ch === "P") {
        player = { x, y };
        pellets.add(`${x},${y}`);
      } else if (ch === ".") {
        pellets.add(`${x},${y}`);
      }
    });
  });

  return { player, pellets };
}

const INITIAL_LAYOUT = parseLayout();

export default function PacmanGame({ isActive }) {
  const [player, setPlayer] = useState(INITIAL_LAYOUT.player);
  const [pellets, setPellets] = useState(INITIAL_LAYOUT.pellets);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const canMoveTo = (x, y) => {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return LAYOUT[y][x] !== "#";
  };

  const move = (dx, dy) => {
    setPlayer((prev) => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (!canMoveTo(nx, ny)) return prev;

      const key = `${nx},${ny}`;
      setPellets((prevPellets) => {
        if (!prevPellets.has(key)) return prevPellets;
        const next = new Set(prevPellets);
        next.delete(key);
        setScore((s) => s + 5);
        return next;
      });

      return { x: nx, y: ny };
    });
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (!isActive || isGameOver || !isStarted) return;
      let dx = 0;
      let dy = 0;
      switch (e.key) {
        case "ArrowLeft":
          dx = -1;
          break;
        case "ArrowRight":
          dx = 1;
          break;
        case "ArrowUp":
          dy = -1;
          break;
        case "ArrowDown":
          dy = 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      move(dx, dy);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, isGameOver, isStarted]);

  useGameLoop({
    tick: () => {
      if (!isActive || !isStarted || isGameOver) return;
      if (pellets.size === 0) {
        setIsGameOver(true);
      }
    },
    isPaused: !isActive || !isStarted || isGameOver,
    speedMs: 200
  });

  const handleRestart = () => {
    const { player: p, pellets: newPellets } = parseLayout();
    setPlayer(p);
    setPellets(newPellets);
    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);
  };

  const renderCell = (x, y) => {
    const ch = LAYOUT[y][x];
    const isPlayer = player.x === x && player.y === y;
    const key = `${x},${y}`;
    const hasPellet = pellets.has(key);

    let className = "mini-cell pac-cell";
    if (ch === "#") className += " pac-wall";

    return (
      <div key={key} className={className}>
        {isPlayer ? "😋" : hasPellet ? "·" : ""}
      </div>
    );
  };

  return (
    <div className="game-layout">
      <section className="board-wrapper">
        <div
          className="mini-board pac-board"
          style={{ gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
        >
          {Array.from({ length: ROWS }).map((_, y) => (
            <div key={y} className="mini-row pac-row">
              {Array.from({ length: COLS }).map((_, x) => renderCell(x, y))}
            </div>
          ))}
        </div>
      </section>

      <section className="info-panel">
        <div className="info-card">
          <div className="info-item">
            <span className="label">Puntos</span>
            <span className="value">{score}</span>
          </div>
          <div className="info-item">
            <span className="label">Bocados</span>
            <span className="value">
              {INITIAL_LAYOUT.pellets.size - pellets.size}
            </span>
          </div>
        </div>

        {!isStarted && !isGameOver && (
          <button
            className="primary-button"
            onClick={() => {
              setIsStarted(true);
            }}
          >
            ▶ Empezar partida
          </button>
        )}
        <button className="primary-button" onClick={handleRestart}>
          Reiniciar laberinto
        </button>

        <div className="controls-hint">
          <p className="controls-title">Controles</p>
          <ul>
            <li>Flechas: mover al come-corazones</li>
            <li>Come todos los puntitos del mapa</li>
          </ul>
        </div>

        <div className="touch-controls">
          <button className="touch-button" onClick={() => move(-1, 0)}>
            ◀
            <span>Izquierda</span>
          </button>
          <button className="touch-button" onClick={() => move(0, -1)}>
            ⬆
            <span>Arriba</span>
          </button>
          <button className="touch-button" onClick={() => move(0, 1)}>
            ⬇
            <span>Abajo</span>
          </button>
          <button className="touch-button" onClick={() => move(1, 0)}>
            ▶
            <span>Derecha</span>
          </button>
        </div>
      </section>

      {isGameOver && (
        <div className="overlay">
          <div className="overlay-card">
            <h2 className="overlay-title">Corazones devorados</h2>
            <p className="overlay-message">
              Te comiste todos los puntitos del laberinto. Nada mal para un
              come-corazones profesional.
            </p>
            <button className="primary-button" onClick={handleRestart}>
              Volver a jugar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

