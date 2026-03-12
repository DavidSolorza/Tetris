import React, { useEffect, useState } from "react";
import GameBoard from "./components/GameBoard.jsx";
import FinalScreen from "./components/FinalScreen.jsx";
import SnakeGame from "./components/SnakeGame.jsx";
import ChickenGame from "./components/ChickenGame.jsx";
import MinesweeperGame from "./components/MinesweeperGame.jsx";
import SolitaireGame from "./components/SolitaireGame.jsx";

import { useTetris } from "./hooks/useTetris.js";
import { useGameLoop } from "./hooks/useGameLoop.js";

function App() {
  const [currentGame, setCurrentGame] = useState("menu"); // menu | tetris | snake | chicken | mines | solitaire
  const [isTetrisStarted, setIsTetrisStarted] = useState(false);

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

  // Cada vez que cambias de juego, sube al inicio de la página
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [currentGame]);

  useGameLoop({
    tick: softDrop,
    isPaused:
      currentGame !== "tetris" || isGameOver || isFinalMessage || !isTetrisStarted,
    speedMs: fallSpeedMs
  });

  useEffect(() => {
    const handleKey = (e) => {
      if (
        currentGame !== "tetris" ||
        isGameOver ||
        isFinalMessage ||
        !isTetrisStarted
      )
        return;
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
  }, [
    currentGame,
    isTetrisStarted,
    moveLeft,
    moveRight,
    rotate,
    softDrop,
    hardDrop,
    isGameOver,
    isFinalMessage
  ]);

  const renderHeaderTitle = () => {
    if (currentGame === "menu") {
      return (
        <>
          <span className="heart-icon">♥</span>
          <div>
            <h1>Arcade de besos</h1>
            <p className="subtitle">
              Un pequeño salón de juegos solo para ti
            </p>
          </div>
        </>
      );
    }

    const titleMap = {
      tetris: {
        title: "Tetris de amor",
        subtitle: "Un tetris sin límites de besos"
      },
      snake: {
        title: "Snake de corazones",
        subtitle: "Una serpiente que solo quiere más amor"
      },
      chicken: {
        title: "Gallinita enamorada",
        subtitle: "Ayúdala a cruzar la calle para su cita"
      },
      mines: {
        title: "Buscaminas dulce",
        subtitle: "Descubre casillas sin explotar corazones"
      },
      solitaire: {
        title: "Solitario de corazones",
        subtitle: "Empareja cartas llenas de amor"
      }
    };

    const info = titleMap[currentGame] ?? titleMap.tetris;

    return (
      <>
        <button
          className="ghost-button back-button"
          type="button"
          onClick={() => setCurrentGame("menu")}
        >
          ← Arcade
        </button>
        <div className="app-title-main">
          <span className="heart-icon">♥</span>
          <div>
            <h1>{info.title}</h1>
            <p className="subtitle">{info.subtitle}</p>
          </div>
        </div>
      </>
    );
  };

  const renderMenu = () => (
    <main className="app-main menu-main">
      <section className="menu-intro">
        <p>
          Elige uno cuando estés aburrida: piezas, serpientes,
          gallinitas, buscaminas o un solitario de corazones.
        </p>
      </section>
      <section className="game-menu">
        <div
          className="game-card"
          onClick={() => {
            setCurrentGame("tetris");
            setIsTetrisStarted(false);
          }}
        >
          <div className="game-avatar tetris-face">
            <span>▩</span>
          </div>
          <h2>Tetris de amor</h2>
          <p>El clásico de piezas, pero lleno de besos.</p>
          <div className="game-tags">
            <span className="tag-pill">Piezas</span>
            <span className="tag-pill">Besitos</span>
          </div>
          <button className="primary-button game-button">Jugar</button>
        </div>

        <div
          className="game-card"
          onClick={() => {
            setCurrentGame("snake");
          }}
        >
          <div className="game-avatar snake-face">
            <span>🐍</span>
          </div>
          <h2>Snake de corazones</h2>
          <p>Una serpiente que crece con cada corazón.</p>
          <div className="game-tags">
            <span className="tag-pill">Reflejos</span>
            <span className="tag-pill">Corazones</span>
          </div>
          <button className="primary-button game-button">Jugar</button>
        </div>

        <div
          className="game-card"
          onClick={() => {
            setCurrentGame("chicken");
          }}
        >
          <div className="game-avatar chicken-face">
            <span>🐥</span>
          </div>
          <h2>Gallinita enamorada</h2>
          <p>Crúzala entre coches para que llegue a su cita.</p>
          <div className="game-tags">
            <span className="tag-pill">Timing</span>
            <span className="tag-pill">Aventuras</span>
          </div>
          <button className="primary-button game-button">Jugar</button>
        </div>

        <div
          className="game-card"
          onClick={() => {
            setCurrentGame("mines");
          }}
        >
          <div className="game-avatar mines-face">
            <span>💣</span>
          </div>
          <h2>Buscaminas dulce</h2>
          <p>Evita las bombas y limpia el campo de corazones.</p>
          <div className="game-tags">
            <span className="tag-pill">Estrategia</span>
            <span className="tag-pill">Calma</span>
          </div>
          <button className="primary-button game-button">Jugar</button>
        </div>

        <div
          className="game-card"
          onClick={() => {
            setCurrentGame("solitaire");
          }}
        >
          <div className="game-avatar solitaire-face">
            <span>🃏</span>
          </div>
          <h2>Solitario de corazones</h2>
          <p>Un memory de cartas románticas para jugar en calma.</p>
          <div className="game-tags">
            <span className="tag-pill">Relax</span>
            <span className="tag-pill">Memoria</span>
          </div>
          <button className="primary-button game-button">Jugar</button>
        </div>

      </section>
      <p className="tiny-note">
        Hecho con amor solo para ti 💗 · Elige un juego para empezar.
      </p>
    </main>
  );

  const renderTetris = () => (
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
        {!isTetrisStarted && (
          <button
            className="primary-button"
            onClick={() => {
              setIsTetrisStarted(true);
              restart();
            }}
          >
            ▶ Empezar partida
          </button>
        )}
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
        <p className="tiny-note">
          Hecho con amor solo para ti 💗 · Gracias por jugar.
        </p>
      </section>

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
    </main>
  );

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className={currentGame === "menu" ? "app-header menu-header" : "app-header"}>
          <div className="app-title">{renderHeaderTitle()}</div>
        </header>

        {currentGame === "menu" && renderMenu()}
        {currentGame === "tetris" && renderTetris()}
        {currentGame === "snake" && <SnakeGame isActive={currentGame === "snake"} />}
        {currentGame === "chicken" && (
          <ChickenGame isActive={currentGame === "chicken"} />
        )}
        {currentGame === "mines" && <MinesweeperGame isActive={currentGame === "mines"} />}
        {currentGame === "solitaire" && (
          <SolitaireGame isActive={currentGame === "solitaire"} />
        )}
      </div>
    </div>
  );
}

export default App;

