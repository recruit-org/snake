import { useCallback, useRef, useEffect } from "react";

export const useInterval = (callback, duration) => {
    const time = useRef(0);
  
    const wrappedCallback = useCallback(() => {
      // don't call callback() more than once within `duration`
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