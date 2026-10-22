import { useTraffic } from "@/store/traffic";

export function useTrafficSocket() {
  const messages = useTraffic((s) => s.messages);
  const paused = useTraffic((s) => s.paused);
  const setPaused = useTraffic((s) => s.setPaused);
  const clear = useTraffic((s) => s.clear);
  return { messages, paused, setPaused, clear };
}