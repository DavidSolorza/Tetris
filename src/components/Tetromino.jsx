import React from "react";

function Tetromino({ piece, cols, rows }) {
  const { shape, x, y, type } = piece;

  return (
    <div className="tetromino-layer">
      {shape.map((row, dy) =>
        row.map(
          (cell, dx) =>
            cell && (
              <div
                key={`${dx}-${dy}`}
                className={`cell cell-filled cell-${type} cell-live`}
                style={{
                  gridColumnStart: x + dx + 1,
                  gridRowStart: y + dy + 1
                }}
              />
            )
        )
      )}
    </div>
  );
}

export default Tetromino;

