import { useEffect } from "react";

export function usePollingInterval(callback, delayMs) {
  useEffect(() => {
    const controller = new AbortController();
    callback(controller);
    const timer = window.setInterval(() => callback(controller), delayMs);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [callback, delayMs]);
}
