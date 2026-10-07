import type { Script } from "@/types/script";
import { mockScripts } from "@/mocks/data";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
let scripts: Script[] = [...mockScripts];

export async function listScripts(): Promise<Script[]> {
  await delay();
  return [...scripts];
}

export async function saveScript(s: Script): Promise<Script> {
  await delay();
  const exists = scripts.some((x) => x.script_id === s.script_id);
  scripts = exists
    ? scripts.map((x) => (x.script_id === s.script_id ? s : x))
    : [...scripts, s];
  return s;
}

export async function deleteScript(id: string): Promise<void> {
  await delay();
  scripts = scripts.filter((x) => x.script_id !== id);
}