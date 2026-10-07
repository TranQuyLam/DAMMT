import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSites, createSite, updateSite, deleteSite } from "@/api/sites";
import type { Site } from "@/types/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SiteForm from "@/components/SiteForm";

function matchText(s: Site) {
  const parts: string[] = [];
  if (s.path_prefix) parts.push(`Path: ${s.path_prefix}`);
  if (s.host) parts.push(`Host: ${s.host}`);
  if (s.port) parts.push(`Port: ${s.port}`);
  return parts.join(" | ") || "-";
}

export default function Sites() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sites"],
    queryFn: listSites,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Site | undefined>();

  const refresh = () => qc.invalidateQueries({ queryKey: ["sites"] });

  const saveMut = useMutation({
    mutationFn: (s: Site) => (editing ? updateSite(s) : createSite(s)),
    onSuccess: () => {
      refresh();
      setOpen(false);
    },
  });

  const delMut = useMutation({
    mutationFn: deleteSite,
    onSuccess: refresh,
  });

  const openAdd = () => {
    setEditing(undefined);
    setOpen(true);
  };
  const openEdit = (s: Site) => {
    setEditing(s);
    setOpen(true);
  };
  const onDelete = (s: Site) => {
    if (window.confirm(`Xóa site "${s.name}"?`)) delMut.mutate(s.site_id);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý Site</h2>
        <Button onClick={openAdd}>+ Thêm site</Button>
      </div>

      {isLoading && <p>Đang tải...</p>}
      {isError && <p className="text-red-600">Không tải được danh sách site.</p>}

      {data && (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Site ID</th>
                <th className="p-3">Tên</th>
                <th className="p-3">Điều kiện khớp</th>
                <th className="p-3">Target URL</th>
                <th className="p-3">Scripts</th>
                <th className="p-3">Auth</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.site_id} className="border-t">
                  <td className="p-3 font-mono">{s.site_id}</td>
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{matchText(s)}</td>
                  <td className="p-3">{s.target_url}</td>
                  <td className="p-3">
                    {s.assigned_scripts.join(", ") || "-"}
                  </td>
                  <td className="p-3">{s.auth_required ? "Có" : "Không"}</td>
                  <td className="p-3">
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>
                      {s.status === "active" ? "Hoạt động" : "Tắt"}
                    </Badge>
                  </td>
                  <td className="space-x-2 p-3">
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                      Sửa
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDelete(s)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">
              {editing ? "Sửa site" : "Thêm site"}
            </h3>
            <SiteForm
              key={editing?.site_id ?? "new"}
              initial={editing}
              onSubmit={(s) => saveMut.mutate(s)}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}