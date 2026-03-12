import React, { useEffect, useState } from "react";
import { useGameLoop } from "../hooks/useGameLoop.js";

const COLS = 7;
const ROWS = 9;

// Menos carriles para empezar fácil
const ROAD_ROWS = [3, 5, 7];

function createInitialPlayer() {
  return { x: Math.floor(COLS / 2), y: ROWS - 1 };
}

function createCarsForLevel(level) {
  // A más nivel, más coches y patrones algo distintos
  const cars = [];
  const density = level === 1 ? 2 : level === 2 ? 3 : 4;

  ROAD_ROWS.forEach((row, index) => {
    const dir = (index + level) % 2 === 0 ? 1 : -1;
    const spacing = Math.max(2, Math.floor(COLS / density));

    for (let i = 0; i < density; i++) {
      const start = (i * spacing + index + level) % COLS;
      const speed = level >= 3 && index % 2 === 0 ? 2 : 1;
      cars.push({ x: start, y: row, dir, speed });
    }
  });

  return cars;
}

const LEVEL_LABELS = [
  "Paseo tranquilo",
  "Tráfico suave",
  "Tráfico animado",
  "Tráfico intenso",
  "Caos romántico"
];

export default function ChickenGame({ isActive }) {
  const [player, setPlayer] = useState(() => createInitialPlayer());
  const [level, setLevel] = useState(1);
  const [cars, setCars] = useState(() => createCarsForLevel(1));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const movePlayer = (dx, dy) => {
    setPlayer((prev) => {
      const nx = Math.min(Math.max(prev.x + dx, 0), COLS - 1);
      const ny = Math.min(Math.max(prev.y + dy, 0), ROWS - 1);
      return { x: nx, y: ny };
    });
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (!isActive || isGameOver || !isStarted) return;

      switch (e.key) {
        case "ArrowLeft":
          movePlayer(-1, 0);
          break;
        case "ArrowRight":
          movePlayer(1, 0);
          break;
        case "ArrowUp":
          movePlayer(0, -1);
          break;
        case "ArrowDown":
          movePlayer(0, 1);
          break;
        default:
          return;
      }

      e.preventDefault();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, isGameOver, isStarted]);

  const resetRun = () => {
    setPlayer(createInitialPlayer());
    setCars(createInitialCars());
  };

  const handleTick = () => {
    if (!isActive || isGameOver || !isStarted) return;

    setCars((prevCars) => {
      const nextCars = prevCars.map((car) => {
        const step = car.speed || 1;
        let nx = car.x + car.dir * step;
        while (nx < 0) nx += COLS;
        while (nx >= COLS) nx -= COLS;
        return { ...car, x: nx };
      });

      setPlayer((prevPlayer) => {
        const collision = nextCars.some(
          (car) => car.y === prevPlayer.y && car.x === prevPlayer.x
        );

        if (collision) {
          setLives((l) => {
            const remaining = l - 1;
            if (remaining <= 0) {
              setIsGameOver(true);
            }
            return remaining;
          });
          return createInitialPlayer();
        }

        if (prevPlayer.y === 0) {
          setScore((s) => s + 1);
          setLevel((prevLevel) => {
            const nextLevel = Math.min(prevLevel + 1, LEVEL_LABELS.length);
            setCars(createCarsForLevel(nextLevel));
            return nextLevel;
          });
          return createInitialPlayer();
        }

        return prevPlayer;
      });

      return nextCars;
    });
  };

  useGameLoop({
    tick: handleTick,
    isPaused: !isActive || isGameOver || !isStarted,
    speedMs: 380
  });

  const handleRestart = () => {
    setScore(0);
    setLives(5);
    setIsGameOver(false);
    setLevel(1);
    setCars(createCarsForLevel(1));
    resetRun();
    setIsStarted(true);
  };

  const isCarAt = (x, y) =>
    cars.some((car) => {
      return car.x === x && car.y === y;
    });

  return (
    <div className="game-layout">
      <section className="board-wrapper">
        <div className="mini-board road-board">
          {Array.from({ length: ROWS }).map((_, y) => (
            <div key={y} className="mini-row">
              {Array.from({ length: COLS }).map((_, x) => {
                const isGoal = y === 0;
                const isStart = y === ROWS - 1;
                const isRoad = ROAD_ROWS.includes(y);
                const isPlayer = player.x === x && player.y === y;
                const hasCar = isCarAt(x, y);

                let className = "mini-cell";
                if (isGoal) className += " road-goal";
                else if (isStart) className += " road-start";
                else if (isRoad) className += " road-lane";

                if (hasCar) className += " road-car-cell";
                if (isPlayer) className += " road-chicken-cell";

                return (
                  <div key={x} className={className}>
                    {isPlayer ? "🐥" : hasCar ? "🚗" : isGoal ? "💒" : null}
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
            <span className="label">Citas cruzadas</span>
            <span className="value">{score}</span>
          </div>
          <div className="info-item">
            <span className="label">Vidas</span>
            <span className="value">{lives}</span>
          </div>
          <div className="info-item">
            <span className="label">Dificultad</span>
            <span className="value">
              {LEVEL_LABELS[level - 1] ?? LEVEL_LABELS[LEVEL_LABELS.length - 1]}
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
          Volver a empezar
        </button>

        <div className="controls-hint">
          <p className="controls-title">Controles</p>
          <ul>
            <li>Flechas: mover la gallinita</li>
            <li>Llega a la parte de arriba sin chocar</li>
          </ul>
        </div>

        <div className="touch-controls">
          <button
            className="touch-button"
            onClick={() => movePlayer(-1, 0)}
          >
            ◀
            <span>Izquierda</span>
          </button>
          <button className="touch-button" onClick={() => movePlayer(0, -1)}>
            ⬆
            <span>Arriba</span>
          </button>
          <button className="touch-button" onClick={() => movePlayer(0, 1)}>
            ⬇
            <span>Abajo</span>
          </button>
          <button className="touch-button" onClick={() => movePlayer(1, 0)}>
            ▶
            <span>Derecha</span>
          </button>
        </div>
      </section>

      {isGameOver && (
        <div className="overlay">
          <div className="overlay-card">
            <h2 className="overlay-title">La gallinita se cansó</h2>
            <p className="overlay-message">
              Se acabaron las vidas, pero podemos cruzar la calle otra vez.
            </p>
            <div className="overlay-stats">
              <div className="info-item">
                <span className="label">Citas cruzadas</span>
                <span className="value">{score}</span>
              </div>
            </div>
            <button className="primary-button" onClick={handleRestart}>
              Jugar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

