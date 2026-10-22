import { create } from "zustand";
import type { TrafficMessage } from "@/types/traffic";
import { makeMockTraffic } from "@/mocks/data";

const MAX_ROWS = 500;

interface TrafficState {
  messages: TrafficMessage[];
  paused: boolean;
  connected: boolean;
  setPaused: (p: boolean) => void;
  clear: () => void;
  start: () => void;
  stop: () => void;
}

let timer: ReturnType<typeof setInterval> | null = null;
let counter = 0;

export const useTraffic = create<TrafficState>((set, get) => ({
  messages: [],
  paused: false,
  connected: false,
  setPaused: (p) => set({ paused: p }),
  clear: () => set({ messages: [] }),

  start: () => {
    if (timer) return; // đã chạy rồi thì không tạo thêm
    set({ connected: true });
    // Sau này thay đoạn setInterval bằng: new WebSocket("ws://.../ws/traffic")
    // và trong onmessage gọi: push(JSON.parse(e.data))
    timer = setInterval(() => {
      if (get().paused) return;
      counter += 1;
      const msg = makeMockTraffic(counter);
      set((s) => ({ messages: [msg, ...s.messages].slice(0, MAX_ROWS) }));
    }, 1500);
  },

  stop: () => {
    if (timer) clearInterval(timer);
    timer = null;
    set({ connected: false });
  },
}));