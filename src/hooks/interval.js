import { useCallback, useRef, useEffect } from "react";
export const useInterval = (callback, delay) => {
  const time = useRef(0);
  const wrappedCallback = useCallback(() => {
    if (Date.now() - time.current >= delay) {
      time.current = Date.now();
      callback();
    }
  }, [callback, delay]);
  useEffect(() => {
    const interval = setInterval(wrappedCallback, 1000 / 60);
    return () => clearInterval(interval);
  }, [wrappedCallback]);
};
