import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSiteVersions, rollbackSite } from "@/api/sites";
import type { Site } from "@/types/site";
import { Button } from "@/components/ui/button";

const FIELDS: { key: keyof Site; label: string }[] = [
  { key: "name", label: "Tên" },
  { key: "target_url", label: "Target URL" },
  { key: "path_prefix", label: "Path prefix" },
  { key: "host", label: "Host" },
  { key: "port", label: "Port" },
  { key: "auth_required", label: "Yêu cầu đăng nhập" },
  { key: "assigned_scripts", label: "Scripts" },
  { key: "status", label: "Trạng thái" },
];

const show = (v: unknown) =>
  v === undefined || v === "" ? "-" : Array.isArray(v) ? v.join(", ") || "-" : String(v);

export default function SiteVersionHistory({ site, onClose }: { site: Site; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: versions, isLoading } = useQuery({
    queryKey: ["siteVersions", site.site_id],
    queryFn: () => listSiteVersions(site.site_id),
  });
  const [picked, setPicked] = useState<number | null>(null);

  const rbMut = useMutation({
    mutationFn: (v: number) => rollbackSite(site.site_id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      qc.invalidateQueries({ queryKey: ["siteVersions", site.site_id] });
      setPicked(null);
    },
  });

  const current = versions?.[0];
  const selected = versions?.find((v) => v.version === picked);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Lịch sử cấu hình: {site.site_id}</h3>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
        {isLoading && <p>Đang tải...</p>}
        <div className="flex gap-4">
          <div className="w-1/3 overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr><th className="p-2">Ver</th><th className="p-2">Ghi chú</th><th className="p-2">Thời gian</th></tr>
              </thead>
              <tbody>
                {versions?.map((v, i) => (
                  <tr
                    key={v.version}
                    onClick={() => setPicked(v.version)}
                    className={`cursor-pointer border-t hover:bg-gray-100 ${v.version === picked ? "bg-blue-50" : ""}`}
                  >
                    <td className="p-2 font-mono">
                      v{v.version}
                      {i === 0 && <span className="ml-1 text-xs text-green-600">(hiện tại)</span>}
                    </td>
                    <td className="p-2">{v.note}</td>
                    <td className="p-2 text-xs">{new Date(v.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-2/3">
            {!selected || !current ? (
              <p className="text-sm text-gray-500">Bấm một phiên bản để so sánh với bản hiện tại.</p>
            ) : selected.version === current.version ? (
              <p className="text-sm text-gray-500">Đây là phiên bản hiện tại.</p>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm">So sánh <b>v{selected.version}</b> với bản hiện tại</p>
                  <Button
                    size="sm"
                    disabled={rbMut.isPending}
                    onClick={() =>
                      window.confirm(`Rollback về v${selected.version}?`) && rbMut.mutate(selected.version)
                    }
                  >
                    Rollback về v{selected.version}
                  </Button>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr><th className="py-1">Trường</th><th>v{selected.version}</th><th>Hiện tại</th></tr>
                  </thead>
                  <tbody>
                    {FIELDS.map(({ key, label }) => {
                      const a = show(selected.snapshot[key]);
                      const b = show(current.snapshot[key]);
                      const diff = a !== b;
                      return (
                        <tr key={key} className={`border-t ${diff ? "bg-yellow-50" : ""}`}>
                          <td className="py-1 font-medium">{label}</td>
                          <td className={diff ? "text-red-700" : ""}>{a}</td>
                          <td className={diff ? "text-green-700" : ""}>{b}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}