import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listRoles, listUsers, saveUser, deleteUser, listPermissions, setPermission } from "@/api/rbac";
import { listSites } from "@/api/sites";
import type { AppUser } from "@/types/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth";

const inputCls = "w-full rounded-md border px-3 py-2 text-sm";

export default function Users() {
  const me = useAuth((s) => s.user);
  const qc = useQueryClient();
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: listRoles });
  const { data: sites } = useQuery({ queryKey: ["sites"], queryFn: listSites });
  const { data: perms } = useQuery({ queryKey: ["perms"], queryFn: listPermissions });

  const [editing, setEditing] = useState<AppUser | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");

  const saveMut = useMutation({
    mutationFn: saveUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setEditing(null);
    },
  });
  const delMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
  const permMut = useMutation({
    mutationFn: (a: { role_id: string; site_id: string; can: boolean }) =>
      setPermission(a.role_id, a.site_id, a.can),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["perms"] }),
  });

  const roleName = (id: string) => roles?.find((r) => r.role_id === id)?.role_name ?? id;
  const canAccess = (role_id: string, site_id: string) =>
    perms?.find((p) => p.role_id === role_id && p.site_id === site_id)?.can_access ?? false;

  const openNew = () => {
    setIsNew(true);
    setUsername("");
    setEmail("");
    setRoleId(roles?.[0]?.role_id ?? "");
    setActive(true);
    setError("");
    setEditing({} as AppUser);
  };
  const openEdit = (u: AppUser) => {
    setIsNew(false);
    setUsername(u.username);
    setEmail(u.email);
    setRoleId(u.role_id);
    setActive(u.status === "active");
    setError("");
    setEditing(u);
  };

  const onSave = () => {
    if (!/^[a-zA-Z0-9_]{3,}$/.test(username)) return setError("Username tối thiểu 3 ký tự (chữ, số, _)");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Email không hợp lệ");
    if (!roleId) return setError("Chọn role");
    const now = new Date().toISOString();
    saveMut.mutate({
      user_id: isNew ? `u_${Date.now()}` : editing!.user_id,
      role_id: roleId,
      username,
      email,
      auth_provider: isNew ? "local" : editing!.auth_provider,
      status: active ? "active" : "inactive",
      created_at: isNew ? now : editing!.created_at,
      updated_at: now,
    });
  };
  if (me && me.role_name !== "admin") return <Navigate to="/sites" replace />;
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Người dùng</h2>
          <Button onClick={openNew}>+ Thêm user</Button>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Đăng nhập qua</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.user_id} className="border-t">
                  <td className="p-3 font-mono">{u.username}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{roleName(u.role_id)}</td>
                  <td className="p-3">{u.auth_provider}</td>
                  <td className="p-3">
                    <Badge variant={u.status === "active" ? "default" : "secondary"}>
                      {u.status === "active" ? "Hoạt động" : "Khóa"}
                    </Badge>
                  </td>
                  <td className="space-x-2 p-3">
                    <Button size="sm" variant="outline" onClick={() => openEdit(u)}>Sửa</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.confirm(`Xóa ${u.username}?`) && delMut.mutate(u.user_id)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-2xl font-bold">Phân quyền theo site</h2>
        <p className="mb-4 text-sm text-gray-500">Tick để cho phép role truy cập site.</p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Role</th>
                {sites?.map((s) => (
                  <th key={s.site_id} className="p-3">{s.site_id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles?.map((r) => (
                <tr key={r.role_id} className="border-t">
                  <td className="p-3 font-medium">{r.role_name}</td>
                  {sites?.map((s) => (
                    <td key={s.site_id} className="p-3">
                      <input
                        type="checkbox"
                        checked={canAccess(r.role_id, s.site_id)}
                        onChange={(e) =>
                          permMut.mutate({ role_id: r.role_id, site_id: s.site_id, can: e.target.checked })
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">{isNew ? "Thêm user" : `Sửa ${editing.username}`}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Username</label>
                <input className={inputCls} disabled={!isNew} value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select className={inputCls} value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                  {roles?.map((r) => (
                    <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Đang hoạt động
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Hủy</Button>
              <Button onClick={onSave}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}