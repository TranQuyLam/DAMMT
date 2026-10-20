import type { Role, AppUser, SitePermission } from "@/types/rbac";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
const now = "2026-10-01T08:00:00Z";

let roles: Role[] = [
  { role_id: "role_admin", role_name: "admin", permissions: ["*"] },
  { role_id: "role_user", role_name: "user", permissions: ["site:read"] },
];

let users: AppUser[] = [
  { user_id: "u1", role_id: "role_admin", username: "admin", email: "admin@proxy.local", auth_provider: "local", status: "active", created_at: now, updated_at: now },
  { user_id: "u2", role_id: "role_user", username: "user", email: "user@proxy.local", auth_provider: "local", status: "active", created_at: now, updated_at: now },
];

let perms: SitePermission[] = [
  { permission_id: "p1", role_id: "role_admin", site_id: "site_google", can_access: true },
  { permission_id: "p2", role_id: "role_admin", site_id: "site_github", can_access: true },
  { permission_id: "p3", role_id: "role_user", site_id: "site_google", can_access: true },
  { permission_id: "p4", role_id: "role_user", site_id: "site_github", can_access: false },
];

export async function listRoles(): Promise<Role[]> {
  await delay();
  return [...roles];
}

export async function listUsers(): Promise<AppUser[]> {
  await delay();
  return [...users];
}

export async function saveUser(u: AppUser): Promise<AppUser> {
  await delay();
  users = users.some((x) => x.user_id === u.user_id)
    ? users.map((x) => (x.user_id === u.user_id ? u : x))
    : [...users, u];
  return u;
}

export async function deleteUser(id: string): Promise<void> {
  await delay();
  users = users.filter((x) => x.user_id !== id);
}

export async function listPermissions(): Promise<SitePermission[]> {
  await delay();
  return [...perms];
}

export async function setPermission(role_id: string, site_id: string, can_access: boolean): Promise<void> {
  await delay(150);
  const found = perms.find((p) => p.role_id === role_id && p.site_id === site_id);
  perms = found
    ? perms.map((p) => (p === found ? { ...p, can_access } : p))
    : [...perms, { permission_id: `p_${Date.now()}`, role_id, site_id, can_access }];
}