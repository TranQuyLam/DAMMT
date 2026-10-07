import { useEffect, useRef, useState } from "react";
import type { TrafficMessage } from "@/types/traffic";
import { makeMockTraffic } from "@/mocks/data";

const MAX_ROWS = 500;

export function useTrafficSocket() {
  const [messages, setMessages] = useState<TrafficMessage[]>([]);
  const [paused, setPaused] = useState(false);
  const counter = useRef(0);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  useEffect(() => {
    // Sau này thay đoạn setInterval bằng: new WebSocket("ws://.../ws/traffic")
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      counter.current += 1;
      const msg = makeMockTraffic(counter.current);
      setMessages((prev) => [msg, ...prev].slice(0, MAX_ROWS));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const clear = () => setMessages([]);

  return { messages, paused, setPaused, clear };
}