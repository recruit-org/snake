import { useEffect, useCallback, useRef } from "react";
const useInterval = (callback, duration) => {
  const time = useRef(0);

  const wrappedCallback = useCallback(() => {
    if (Date.now() - time.current >= duration) {
      time.current = Date.now();
      callback();
    }
  }, [callback, duration]);

  useEffect(() => {
    const interval = setInterval(wrappedCallback, 1000 / 60);
    return () => clearInterval(interval);
  }, [wrappedCallback, duration]);
};

export default useInterval;
