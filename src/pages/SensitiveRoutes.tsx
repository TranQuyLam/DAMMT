import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listRoutes, addRoute, deleteRoute } from "@/api/sensitiveRoutes";
import { listSites } from "@/api/sites";
import { useAuth } from "@/store/auth";
import type { RouteType } from "@/types/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const inputCls = "rounded-md border px-3 py-2 text-sm";

const typeLabel: Record<RouteType, string> = {
  login: "Đăng nhập",
  admin: "Quản trị",
  api: "API",
  other: "Khác",
};

export default function SensitiveRoutes() {
  const me = useAuth((s) => s.user);
  const qc = useQueryClient();
  const { data: sites } = useQuery({ queryKey: ["sites"], queryFn: listSites });

  const [siteId, setSiteId] = useState("");
  const [path, setPath] = useState("");
  const [type, setType] = useState<RouteType>("login");
  const [error, setError] = useState("");

  // Mặc định chọn site đầu tiên khi đã tải xong danh sách
  const currentSite = siteId || sites?.[0]?.site_id || "";

  const { data: routes, isLoading } = useQuery({
    queryKey: ["routes", currentSite],
    queryFn: () => listRoutes(currentSite),
    enabled: !!currentSite,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["routes", currentSite] });

  const addMut = useMutation({
    mutationFn: () => addRoute(currentSite, path.trim(), type),
    onSuccess: () => {
      refresh();
      setPath("");
    },
  });
  const delMut = useMutation({ mutationFn: deleteRoute, onSuccess: refresh });

  const onAdd = () => {
    if (!path.startsWith("/")) return setError("Đường dẫn phải bắt đầu bằng /");
    if (routes?.some((r) => r.path === path.trim())) return setError("Đường dẫn đã tồn tại");
    setError("");
    addMut.mutate();
  };

  if (me && me.role_name !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <div>
      <h2 className="text-2xl font-bold">Đường dẫn nhạy cảm</h2>
      <p className="mb-4 text-sm text-gray-500">
        Danh sách đường dẫn (đăng nhập, quản trị...) mà hệ thống phát hiện tấn công (Module 4)
        dùng để nhận diện brute-force.
      </p>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Site</label>
          <select className={inputCls} value={currentSite} onChange={(e) => setSiteId(e.target.value)}>
            {sites?.map((s) => (
              <option key={s.site_id} value={s.site_id}>{s.site_id}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Đường dẫn</label>
          <input className={inputCls} placeholder="/login" value={path} onChange={(e) => setPath(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Loại</label>
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as RouteType)}>
            {Object.entries(typeLabel).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <Button onClick={onAdd} disabled={addMut.isPending}>+ Thêm</Button>
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {isLoading && <p>Đang tải...</p>}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Đường dẫn</th>
              <th className="p-3">Loại</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {routes?.map((r) => (
              <tr key={r.route_id} className="border-t">
                <td className="p-3 font-mono">{r.path}</td>
                <td className="p-3"><Badge variant="secondary">{typeLabel[r.type]}</Badge></td>
                <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.confirm(`Xóa ${r.path}?`) && delMut.mutate(r.route_id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {routes?.length === 0 && <p className="p-4 text-sm text-gray-500">Chưa có đường dẫn nào.</p>}
      </div>
    </div>
  );
}