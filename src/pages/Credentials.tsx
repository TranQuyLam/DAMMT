import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listCredentials,
  createCredential,
  deleteCredential,
  toggleCredential,
} from "@/api/credentials";
import { listUsers } from "@/api/rbac";
import { listSites } from "@/api/sites";
import { useAuth } from "@/store/auth";
import type { CredentialType } from "@/types/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const inputCls = "w-full rounded-md border px-3 py-2 text-sm";

const typeLabel: Record<CredentialType, string> = {
  api_key: "API Key",
  basic_auth: "Basic Auth",
  session_cookie: "Session Cookie",
};

const defaultHeader: Record<CredentialType, string> = {
  api_key: "X-API-Key",
  basic_auth: "Authorization",
  session_cookie: "Cookie",
};

export default function Credentials() {
  const me = useAuth((s) => s.user);
  const qc = useQueryClient();
  const { data: creds } = useQuery({ queryKey: ["creds"], queryFn: listCredentials });
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const { data: sites } = useQuery({ queryKey: ["sites"], queryFn: listSites });

  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [type, setType] = useState<CredentialType>("api_key");
  const [headerName, setHeaderName] = useState("X-API-Key");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const refresh = () => qc.invalidateQueries({ queryKey: ["creds"] });
  const createMut = useMutation({
    mutationFn: createCredential,
    onSuccess: () => {
      refresh();
      setOpen(false);
    },
  });
  const delMut = useMutation({ mutationFn: deleteCredential, onSuccess: refresh });
  const toggleMut = useMutation({ mutationFn: toggleCredential, onSuccess: refresh });

  const username = (id: string) => users?.find((u) => u.user_id === id)?.username ?? id;

  const openNew = () => {
    setUserId(users?.[0]?.user_id ?? "");
    setSiteId(sites?.[0]?.site_id ?? "");
    setType("api_key");
    setHeaderName("X-API-Key");
    setValue("");
    setError("");
    setOpen(true);
  };

  const onTypeChange = (t: CredentialType) => {
    setType(t);
    setHeaderName(defaultHeader[t]);
  };

  const onSave = () => {
    if (!userId || !siteId) return setError("Chọn user và site");
    if (!headerName.trim()) return setError("Cần tên header");
    if (value.length < 4) return setError("Giá trị tối thiểu 4 ký tự");
    createMut.mutate({
      user_id: userId,
      site_id: siteId,
      type,
      header_name: headerName.trim(),
      value,
    });
    setValue(""); // xóa secret khỏi state ngay sau khi gửi
  };

  if (me && me.role_name !== "admin") return <Navigate to="/sites" replace />;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Credential Injection</h2>
        <Button onClick={openNew}>+ Thêm credential</Button>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Proxy tự chèn credential này vào header khi user truy cập site đích. Giá trị thật
        không bao giờ được hiển thị lại.
      </p>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Site</th>
              <th className="p-3">Loại</th>
              <th className="p-3">Header</th>
              <th className="p-3">Giá trị</th>
              <th className="p-3">Hết hạn</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {creds?.map((c) => (
              <tr key={c.credential_id} className="border-t">
                <td className="p-3">{username(c.user_id)}</td>
                <td className="p-3 font-mono">{c.site_id}</td>
                <td className="p-3">{typeLabel[c.type]}</td>
                <td className="p-3 font-mono">{c.header_name}</td>
                <td className="p-3 font-mono">{c.value_masked}</td>
                <td className="p-3">
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "-"}
                </td>
                <td className="p-3">
                  <Badge variant={c.status === "active" ? "default" : "secondary"}>
                    {c.status === "active" ? "Hoạt động" : "Tắt"}
                  </Badge>
                </td>
                <td className="space-x-2 p-3">
                  <Button size="sm" variant="outline" onClick={() => toggleMut.mutate(c.credential_id)}>
                    {c.status === "active" ? "Tắt" : "Bật"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.confirm("Xóa credential này?") && delMut.mutate(c.credential_id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {creds?.length === 0 && <p className="p-4 text-sm text-gray-500">Chưa có credential nào.</p>}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">Thêm credential</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">User</label>
                  <select className={inputCls} value={userId} onChange={(e) => setUserId(e.target.value)}>
                    {users?.map((u) => (
                      <option key={u.user_id} value={u.user_id}>{u.username}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Site</label>
                  <select className={inputCls} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                    {sites?.map((s) => (
                      <option key={s.site_id} value={s.site_id}>{s.site_id}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Loại</label>
                <select
                  className={inputCls}
                  value={type}
                  onChange={(e) => onTypeChange(e.target.value as CredentialType)}
                >
                  <option value="api_key">API Key</option>
                  <option value="basic_auth">Basic Auth</option>
                  <option value="session_cookie">Session Cookie</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tên header</label>
                <input className={inputCls} value={headerName} onChange={(e) => setHeaderName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Giá trị (secret)</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={inputCls}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button onClick={onSave}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}