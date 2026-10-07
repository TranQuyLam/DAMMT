import type { User } from "@/types/auth";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const users = [
  { user_id: "u1", username: "admin", email: "admin@proxy.local", role_name: "admin", password: "admin123" },
  { user_id: "u2", username: "user", email: "user@proxy.local", role_name: "user", password: "user123" },
];

export async function login(username: string, password: string): Promise<User> {
  await delay();
  const found = users.find((u) => u.username === username && u.password === password);
  if (!found) throw new Error("Sai tên đăng nhập hoặc mật khẩu");
  const { password: _pw, ...user } = found;
  return user;
}