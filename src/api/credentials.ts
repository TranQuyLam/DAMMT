import type { Credential, CredentialType } from "@/types/rbac";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

let creds: Credential[] = [
  {
    credential_id: "c1",
    user_id: "u2",
    site_id: "site_github",
    type: "api_key",
    header_name: "X-API-Key",
    value_masked: "••••a91f",
    status: "active",
    expires_at: "2026-12-31T00:00:00Z",
  },
];

export interface NewCredential {
  user_id: string;
  site_id: string;
  type: CredentialType;
  header_name: string;
  value: string; // chỉ gửi đi, không lưu lại phía UI
  expires_at?: string;
}

const mask = (v: string) => "••••" + v.slice(-4);

export async function listCredentials(): Promise<Credential[]> {
  await delay();
  return [...creds];
}

export async function createCredential(n: NewCredential): Promise<Credential> {
  await delay();
  const c: Credential = {
    credential_id: `c_${Date.now()}`,
    user_id: n.user_id,
    site_id: n.site_id,
    type: n.type,
    header_name: n.header_name,
    value_masked: mask(n.value),
    status: "active",
    expires_at: n.expires_at,
  };
  creds = [...creds, c];
  return c;
}

export async function deleteCredential(id: string): Promise<void> {
  await delay();
  creds = creds.filter((c) => c.credential_id !== id);
}

export async function toggleCredential(id: string): Promise<void> {
  await delay(150);
  creds = creds.map((c) =>
    c.credential_id === id
      ? { ...c, status: c.status === "active" ? "inactive" : "active" }
      : c
  );
}