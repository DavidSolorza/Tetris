import { useEffect } from "react";

export function useGameLoop({ tick, isPaused, speedMs }) {
  useEffect(() => {
    if (isPaused) return;
    const interval = speedMs ?? 700;
    const id = setInterval(() => {
      tick();
    }, interval);
    return () => clearInterval(id);
  }, [tick, isPaused, speedMs]);
}

