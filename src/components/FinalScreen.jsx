import React, { useState } from "react";

function FinalScreen({ score, lines, kissesLabel, message, isGameOver, onRestart }) {
  const [musicOn, setMusicOn] = useState(false);

  const toggleMusic = () => {
    setMusicOn((prev) => !prev);
    const audio = document.getElementById("bg-music");
    if (!audio) return;
    if (!musicOn) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  return (
    <div className="overlay">
      <div className="overlay-card">
        <h2 className="overlay-title">Tetris</h2>
        <p className="overlay-message">{message}</p>

        <div className="overlay-stats">
          <div>
            <span className="label">{kissesLabel}</span>
            <span className="value">{score}</span>
          </div>
          <div>
            <span className="label">Líneas</span>
            <span className="value">{lines}</span>
          </div>
        </div>

        <button className="primary-button" onClick={onRestart}>
          Jugar de nuevo
        </button>

        <button className="ghost-button" onClick={toggleMusic}>
          {musicOn ? "Pausar música" : "Reproducir música"}
        </button>

        <p className="tiny-note">Este juego es solo para ti 💕</p>

        <audio
          id="bg-music"
          loop
          src="https://cdn.pixabay.com/download/audio/2021/09/30/audio_3d791e81f4.mp3?filename=romantic-ambient-110624.mp3"
        />
      </div>
    </div>
  );
}

export default FinalScreen;

