import React, { useEffect } from "react";
import GameBoard from "./components/GameBoard.jsx";
import FinalScreen from "./components/FinalScreen.jsx";
import { useTetris } from "./hooks/useTetris.js";
import { useGameLoop } from "./hooks/useGameLoop.js";

function App() {
  const {
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
  } = useTetris();

  useGameLoop({
    tick: softDrop,
    isPaused: isGameOver || isFinalMessage,
    speedMs: fallSpeedMs
  });

  useEffect(() => {
    const handleKey = (e) => {
      if (isGameOver || isFinalMessage) return;
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          moveRight();
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case "x":
        case "X":
          e.preventDefault();
          rotate();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          softDrop();
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [moveLeft, moveRight, rotate, softDrop, hardDrop, isGameOver, isFinalMessage]);

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <div className="app-title">
            <span className="heart-icon">♥</span>
            <div>
              <h1>Tetris</h1>
              <p className="subtitle">Un tetris sin límites de besos</p>
            </div>
          </div>
        </header>

        <main className="app-main">
          <GameBoard
            board={board}
            currentPiece={currentPiece}
            ghostY={ghostY}
            onMoveLeft={moveLeft}
            onMoveRight={moveRight}
            onRotate={rotate}
            onSoftDrop={softDrop}
            onHardDrop={hardDrop}
            tempPopup={tempPopup}
          />

          {/* Controles táctiles grandes para móvil */}
          <div className="touch-controls">
            <button className="touch-button" onClick={moveLeft}>
              ◀
              <span>Izquierda</span>
            </button>
            <button className="touch-button" onClick={rotate}>
              ⟳
              <span>Girar</span>
            </button>
            <button className="touch-button" onClick={moveRight}>
              ▶
              <span>Derecha</span>
            </button>
            <button className="touch-button" onClick={hardDrop}>
              ⬇
              <span>Caída rápida</span>
            </button>
          </div>

          <section className="info-panel">
            <div className="info-card">
              <div className="info-item">
                <span className="label">Besos</span>
                <span className="value">{score}</span>
              </div>
              <div className="info-item">
                <span className="label">Líneas</span>
                <span className="value">{lines}</span>
              </div>
              <div className="info-item">
                <span className="label">Nivel</span>
                <span className="value">
                  {numericLevel} · {levelLabel}
                </span>
              </div>
            </div>
            <button className="primary-button" onClick={restart}>
              Jugar de nuevo
            </button>
            <div className="controls-hint">
              <p className="controls-title">Controles PC</p>
              <ul>
                <li>← / → : mover pieza</li>
                <li>↑ o X : girar</li>
                <li>↓ : caída suave</li>
                <li>Espacio : caída rápida</li>
              </ul>
              <p className="controls-title">Controles táctiles</p>
              <ul>
                <li>Tap izquierda / derecha: mover</li>
                <li>Swipe arriba: girar</li>
                <li>Swipe abajo: caída rápida</li>
              </ul>
            </div>
            <p className="tiny-note">Hecho con amor solo para ti 💗</p>
          </section>
        </main>

        {(isGameOver || isFinalMessage) && (
          <FinalScreen
            score={score}
            lines={lines}
            kissesLabel={kissesLabel}
            message={specialMessage}
            isGameOver={isGameOver}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
}

export default App;

