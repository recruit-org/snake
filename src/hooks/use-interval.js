import { useRef, useEffect } from "react";

const useInterval = (callback, duration) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const interval = setInterval(() => callbackRef.current(), duration);
    return () => clearInterval(interval);
  }, [duration]);
};

export default useInterval;
