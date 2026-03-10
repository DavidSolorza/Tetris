import React, { useRef } from "react";
import Tetromino from "./Tetromino.jsx";
import PopupMessage from "./PopupMessage.jsx";

const COLS = 10;
const ROWS = 20;

function GameBoard({
  board,
  currentPiece,
  ghostY,
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  tempPopup
}) {
  const touchStartRef = useRef(null);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const swipeThreshold = 25;
    const maxTapTime = 250;

    if (absDx < swipeThreshold && absDy < swipeThreshold && dt < maxTapTime) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isLeftSide = touch.clientX < rect.left + rect.width / 2;
      if (isLeftSide) onMoveLeft();
      else onMoveRight();
      touchStartRef.current = null;
      return;
    }

    if (absDx > absDy && absDx > swipeThreshold) {
      if (dx > 0) onMoveRight();
      else onMoveLeft();
    } else if (absDy > swipeThreshold) {
      if (dy < 0) onRotate();
      else onHardDrop();
    }

    touchStartRef.current = null;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  return (
    <section className="board-wrapper">
      <div
        className="board"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {board.map((row, y) => (
          <div className="board-row" key={y}>
            {row.map((cell, x) => {
              const isGhost =
                currentPiece &&
                ghostY !== null &&
                y >= ghostY &&
                y < ghostY + currentPiece.shape.length &&
                x >= currentPiece.x &&
                x < currentPiece.x + currentPiece.shape[0].length &&
                currentPiece.shape[y - ghostY][x - currentPiece.x];

              return (
                <div
                  key={x}
                  className={`cell ${
                    cell
                      ? `cell-filled cell-${cell}`
                      : isGhost
                      ? "cell-ghost"
                      : ""
                  }`}
                />
              );
            })}
          </div>
        ))}

        {currentPiece && (
          <Tetromino
            piece={currentPiece}
            cols={COLS}
            rows={ROWS}
          />
        )}

        {tempPopup && <PopupMessage text={tempPopup} />}
      </div>
    </section>
  );
}

export default GameBoard;

