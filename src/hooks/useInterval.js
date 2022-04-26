import { useRef, useEffect } from "react";
export const useInterval = (callback, duration) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const interval = setInterval(() => callbackRef.current(), duration);
    return () => clearInterval(interval);
  }, [duration]);
};
// const time = useRef(0);
// const wrappedCallback = useCallback(() => {
//   if (Date.now() - time.current >= duration) {
//     console.log("callback", callback);
//     time.current = Date.now();
//     callback();
//   }
