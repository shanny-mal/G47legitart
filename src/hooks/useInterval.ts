import { useEffect, useRef } from "react";

/**
 * useInterval - runs callback every delay ms.
 * If delay is null, interval is paused/cleared.
 */
export default function useInterval(
  callback: () => void,
  delay: number | null
) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
