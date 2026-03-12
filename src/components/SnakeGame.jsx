import React, { useEffect, useMemo, useState } from "react";
import { useGameLoop } from "../hooks/useGameLoop.js";

const WIDTH = 12;
const HEIGHT = 18;
const INITIAL_LENGTH = 4;

function createInitialSnake() {
  const startX = Math.floor(WIDTH / 2);
  const startY = Math.floor(HEIGHT / 2);
  return Array.from({ length: INITIAL_LENGTH }, (_, i) => ({
    x: startX - i,
    y: startY
  }));
}

function randomFood(excludeCells) {
  while (true) {
    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);
    const conflict = excludeCells.some((c) => c.x === x && c.y === y);
    if (!conflict) return { x, y };
  }
}

const DIRS = {
  ArrowUp: { x: 0, y: -1, name: "up" },
  ArrowDown: { x: 0, y: 1, name: "down" },
  ArrowLeft: { x: -1, y: 0, name: "left" },
  ArrowRight: { x: 1, y: 0, name: "right" }
};

function canChangeDirection(current, next) {
  if (!current) return true;
  if (current.name === "up" && next.name === "down") return false;
  if (current.name === "down" && next.name === "up") return false;
  if (current.name === "left" && next.name === "right") return false;
  if (current.name === "right" && next.name === "left") return false;
  return true;
}

export default function SnakeGame({ isActive }) {
  const [snake, setSnake] = useState(() => createInitialSnake());
  const [direction, setDirection] = useState(DIRS.ArrowRight);
  const [pendingDirection, setPendingDirection] = useState(null);
  const [food, setFood] = useState(() => randomFood(createInitialSnake()));
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const snakeCells = useMemo(
    () => new Set(snake.map((c) => `${c.x},${c.y}`)),
    [snake]
  );

  const requestDirection = (key) => {
    const next = DIRS[key];
    if (!next) return;
    if (canChangeDirection(direction, next)) {
      setPendingDirection(next);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (!isActive || isGameOver || !isStarted) return;
      e.preventDefault();
      requestDirection(e.key);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction, isActive, isGameOver, isStarted]);

  const tick = () => {
    if (!isActive || isGameOver || !isStarted) return;

    setSnake((prevSnake) => {
      const currentDir = pendingDirection || direction;
      if (pendingDirection) {
        setDirection(pendingDirection);
        setPendingDirection(null);
      }

      const head = prevSnake[0];
      const nextHead = {
        x: head.x + currentDir.x,
        y: head.y + currentDir.y
      };

      if (
        nextHead.x < 0 ||
        nextHead.x >= WIDTH ||
        nextHead.y < 0 ||
        nextHead.y >= HEIGHT
      ) {
        setIsGameOver(true);
        return prevSnake;
      }

      const bodyWithoutTail = prevSnake.slice(0, -1);
      const collision = bodyWithoutTail.some(
        (c) => c.x === nextHead.x && c.y === nextHead.y
      );
      if (collision) {
        setIsGameOver(true);
        return prevSnake;
      }

      const ateFood = nextHead.x === food.x && nextHead.y === food.y;
      const newSnake = [nextHead, ...prevSnake];

      if (ateFood) {
        setScore((s) => s + 10);
        const occupied = [...newSnake];
        setFood(randomFood(occupied));
        return newSnake;
      }

      return newSnake.slice(0, newSnake.length - 1);
    });
  };

  useGameLoop({
    tick,
    isPaused: !isActive || isGameOver || !isStarted,
    speedMs: 220
  });

  const handleRestart = () => {
    const initial = createInitialSnake();
    setSnake(initial);
    setDirection(DIRS.ArrowRight);
    setPendingDirection(null);
    setFood(randomFood(initial));
    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);
  };

  return (
    <div className="game-layout">
      <section className="board-wrapper">
        <div className="mini-board snake-board">
          {Array.from({ length: HEIGHT }).map((_, y) => (
            <div key={y} className="mini-row">
              {Array.from({ length: WIDTH }).map((_, x) => {
                const key = `${x},${y}`;
                const isHead = snake[0].x === x && snake[0].y === y;
                const isBody = !isHead && snakeCells.has(key);
                const isFood = food.x === x && food.y === y;

                let className = "mini-cell";
                if (isBody) className += " mini-cell-snake";
                if (isHead) className += " mini-cell-snake-head";
                if (isFood) className += " mini-cell-food";

                return (
                  <div key={x} className={className}>
                    {isHead ? "🐍" : isFood ? "💘" : null}
                  </div>
                );
              })}
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
            <span className="label">Modo</span>
            <span className="value">Serpiente de besos</span>
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
          Jugar de nuevo
        </button>

        <div className="controls-hint">
          <p className="controls-title">Controles</p>
          <ul>
            <li>Flechas: mover la serpiente</li>
            <li>Come corazones, evita chocarte</li>
          </ul>
        </div>

        <div className="touch-controls">
          <button
            className="touch-button"
            onClick={() => requestDirection("ArrowLeft")}
          >
            ◀
            <span>Izquierda</span>
          </button>
          <button
            className="touch-button"
            onClick={() => requestDirection("ArrowUp")}
          >
            ⬆
            <span>Arriba</span>
          </button>
          <button
            className="touch-button"
            onClick={() => requestDirection("ArrowDown")}
          >
            ⬇
            <span>Abajo</span>
          </button>
          <button
            className="touch-button"
            onClick={() => requestDirection("ArrowRight")}
          >
            ▶
            <span>Derecha</span>
          </button>
        </div>
      </section>

      {isGameOver && (
        <div className="overlay">
          <div className="overlay-card">
            <h2 className="overlay-title">La serpiente se hizo bolita</h2>
            <p className="overlay-message">
              Chocaste, pero siempre podemos intentarlo otra vez.
            </p>
            <div className="overlay-stats">
              <div className="info-item">
                <span className="label">Puntos</span>
                <span className="value">{score}</span>
              </div>
            </div>
            <button className="primary-button" onClick={handleRestart}>
              Volver a intentarlo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

