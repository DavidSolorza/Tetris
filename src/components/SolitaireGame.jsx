import React, { useMemo, useState } from "react";

// Más emojis para tener más filas de cartas (14 parejas = 28 cartas)
const EMOJIS = [
  "💗",
  "💘",
  "💕",
  "💞",
  "💖",
  "💝",
  "💓",
  "💌",
  "💟",
  "💙",
  "💚",
  "💛",
  "🧡",
  "🤍"
];

function createDeck() {
  const base = [...EMOJIS, ...EMOJIS];
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.map((value, index) => ({
    id: index,
    value,
    revealed: false,
    matched: false
  }));
}

export default function SolitaireGame({ isActive }) {
  const [cards, setCards] = useState(() => createDeck());
  const [flipped, setFlipped] = useState([]);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const matchedCount = useMemo(
    () => cards.filter((c) => c.matched).length / 2,
    [cards]
  );

  const allMatched = matchedCount === EMOJIS.length && matchedCount > 0;

  const handleCardClick = (card) => {
    if (!isActive || lock || card.matched || card.revealed) return;
    setIsStarted(true);

    const nextCards = cards.map((c) =>
      c.id === card.id ? { ...c, revealed: true } : c
    );
    const nextFlipped = [...flipped, card.id];
    setCards(nextCards);
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setLock(true);
      setMoves((m) => m + 1);
      const [aId, bId] = nextFlipped;
      const a = nextCards.find((c) => c.id === aId);
      const b = nextCards.find((c) => c.id === bId);

      if (a && b && a.value === b.value) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === aId || c.id === bId
                ? { ...c, matched: true }
                : c
            )
          );
          setFlipped([]);
          setLock(false);
        }, 350);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === aId || c.id === bId
                ? { ...c, revealed: false }
                : c
            )
          );
          setFlipped([]);
          setLock(false);
        }, 550);
      }
    }
  };

  const handleRestart = () => {
    setCards(createDeck());
    setFlipped([]);
    setLock(false);
    setMoves(0);
    setIsStarted(false);
  };

  return (
    <div className="game-layout">
      <section className="board-wrapper">
        <div className="mini-board solitaire-board">
          <div className="solitaire-grid">
            {cards.map((card) => {
              const show = card.revealed || card.matched;
              let className = "card-tile";
              if (card.matched) className += " card-tile-matched";

              return (
                <button
                  key={card.id}
                  type="button"
                  className={className}
                  onClick={() => handleCardClick(card)}
                  disabled={lock || card.matched}
                >
                  {show ? (
                    <span className="card-emoji">{card.value}</span>
                  ) : (
                    <span className="card-back">♥</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="info-panel">
        <div className="info-card">
          <div className="info-item">
            <span className="label">Parejas</span>
            <span className="value">
              {matchedCount} / {EMOJIS.length}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Movimientos</span>
            <span className="value">{moves}</span>
          </div>
        </div>

        {!isStarted && (
          <button className="primary-button" onClick={handleRestart}>
            ▶ Empezar partida
          </button>
        )}
        <button className="primary-button" onClick={handleRestart}>
          Barajar de nuevo
        </button>

        <div className="controls-hint">
          <p className="controls-title">Cómo jugar</p>
          <ul>
            <li>Tap en dos cartas para voltearlas.</li>
            <li>Si coinciden, se quedan descubiertas.</li>
          </ul>
        </div>
      </section>

      {allMatched && (
        <div className="overlay">
          <div className="overlay-card">
            <h2 className="overlay-title">Corazones emparejados</h2>
            <p className="overlay-message">
              Encontraste todas las parejas. Claramente tienes muy buena memoria
              para las cosas bonitas.
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

