import type { Script, ScriptVersion } from "@/types/script";
import { mockScripts } from "@/mocks/data";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

let scripts: Script[] = [...mockScripts];

// Lịch sử: khởi tạo từ bản hiện tại của mỗi script
let versions: ScriptVersion[] = mockScripts.map((s) => ({
  script_id: s.script_id,
  version: s.version,
  content_base64: s.content_base64 ?? "",
  note: "Bản ban đầu",
  created_at: s.updated_at,
}));

export async function listScripts(): Promise<Script[]> {
  await delay();
  return [...scripts];
}

// Lưu script: bản mới được ghi vào lịch sử
export async function saveScript(s: Script, note = "Sửa"): Promise<Script> {
  await delay();
  const exists = scripts.some((x) => x.script_id === s.script_id);
  scripts = exists
    ? scripts.map((x) => (x.script_id === s.script_id ? s : x))
    : [...scripts, s];
  versions = [
    ...versions,
    {
      script_id: s.script_id,
      version: s.version,
      content_base64: s.content_base64 ?? "",
      note: exists ? note : "Tạo mới",
      created_at: s.updated_at,
    },
  ];
  return s;
}

export async function deleteScript(id: string): Promise<void> {
  await delay();
  scripts = scripts.filter((x) => x.script_id !== id);
  versions = versions.filter((v) => v.script_id !== id);
}

export async function listVersions(scriptId: string): Promise<ScriptVersion[]> {
  await delay(200);
  return versions
    .filter((v) => v.script_id === scriptId)
    .sort((a, b) => b.version - a.version);
}

// Rollback = tạo version mới có nội dung của version cũ
export async function rollbackScript(scriptId: string, toVersion: number): Promise<Script> {
  await delay();
  const target = versions.find((v) => v.script_id === scriptId && v.version === toVersion);
  const current = scripts.find((s) => s.script_id === scriptId);
  if (!target || !current) throw new Error("Không tìm thấy phiên bản");
  const now = new Date().toISOString();
  const next: Script = {
    ...current,
    version: current.version + 1,
    content_base64: target.content_base64,
    updated_at: now,
  };
  scripts = scripts.map((x) => (x.script_id === scriptId ? next : x));
  versions = [
    ...versions,
    {
      script_id: scriptId,
      version: next.version,
      content_base64: next.content_base64 ?? "",
      note: `Rollback về v${toVersion}`,
      created_at: now,
    },
  ];
  return next;
}