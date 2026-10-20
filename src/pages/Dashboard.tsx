import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listSites } from "@/api/sites";
import { listScripts } from "@/api/scripts";
import { listUsers } from "@/api/rbac";
import { useTrafficSocket } from "@/hooks/useTrafficSocket";

function StatCard({ label, value, to }: { label: string; value: number | string; to?: string }) {
  const body = (
    <div className="rounded-lg border p-4 hover:bg-gray-50">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

export default function Dashboard() {
  const { data: sites } = useQuery({ queryKey: ["sites"], queryFn: listSites });
  const { data: scripts } = useQuery({ queryKey: ["scripts"], queryFn: listScripts });
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const { messages } = useTrafficSocket();

  const activeSites = sites?.filter((s) => s.status === "active").length ?? 0;

  // Đếm request theo site để vẽ biểu đồ cột
  const counts: Record<string, number> = {};
  messages.forEach((m) => {
    counts[m.site_id] = (counts[m.site_id] ?? 0) + 1;
  });
  const maxCount = Math.max(1, ...Object.values(counts));

  const recentScripts = [...(scripts ?? [])]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tổng quan hệ thống</h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Site đang hoạt động" value={`${activeSites}/${sites?.length ?? 0}`} to="/sites" />
        <StatCard label="Script" value={scripts?.length ?? 0} to="/scripts" />
        <StatCard label="Người dùng" value={users?.length ?? 0} to="/users" />
        <StatCard label="Request (phiên này)" value={messages.length} to="/traffic" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Request theo site</h3>
          {Object.keys(counts).length === 0 ? (
            <p className="text-sm text-gray-500">Đang chờ dữ liệu...</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(counts).map(([site, n]) => (
                <div key={site}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-mono">{site}</span>
                    <span>{n}</span>
                  </div>
                  <div className="h-3 rounded bg-gray-100">
                    <div
                      className="h-3 rounded bg-gray-900"
                      style={{ width: `${(n / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Script cập nhật gần đây</h3>
          <ul className="space-y-2 text-sm">
            {recentScripts.map((s) => (
              <li key={s.script_id} className="flex justify-between">
                <span className="font-mono">{s.script_name} <span className="text-gray-500">v{s.version}</span></span>
                <span className="text-gray-500">{new Date(s.updated_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Request mới nhất</h3>
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">Đang chờ dữ liệu...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-1">Giờ</th>
                <th>Site</th>
                <th>Method</th>
                <th>Status</th>
                <th>ms</th>
              </tr>
            </thead>
            <tbody>
              {messages.slice(0, 5).map((m) => (
                <tr key={m.event_id} className="border-t">
                  <td className="py-1">{new Date(m.timestamp).toLocaleTimeString()}</td>
                  <td>{m.site_id}</td>
                  <td>{m.request.method}</td>
                  <td>{(m.modified_response ?? m.original_response).status_code}</td>
                  <td>{m.duration_ms ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}