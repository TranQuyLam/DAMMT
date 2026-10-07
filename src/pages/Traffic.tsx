import { useState } from "react";
import { useTrafficSocket } from "@/hooks/useTrafficSocket";
import type { HttpResponseData } from "@/types/traffic";
import { Button } from "@/components/ui/button";

function decodeBody(b64: string): string {
  try {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return "(không giải mã được body)";
  }
}

function ResponsePanel({ title, res }: { title: string; res?: HttpResponseData }) {
  return (
    <div className="flex-1 rounded-md border p-3">
      <h4 className="mb-2 font-semibold">{title}</h4>
      {!res ? (
        <p className="text-sm text-gray-500">Không có dữ liệu</p>
      ) : (
        <>
          <p className="mb-2 text-sm">Status: {res.status_code}</p>
          <p className="text-xs font-semibold">Headers</p>
          <pre className="mb-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
            {Object.entries(res.headers)
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n")}
          </pre>
          <p className="text-xs font-semibold">Body</p>
          <pre className="max-h-64 overflow-auto rounded bg-gray-100 p-2 text-xs whitespace-pre-wrap">
            {decodeBody(res.body_base64)}
          </pre>
        </>
      )}
    </div>
  );
}

export default function Traffic() {
  const { messages, paused, setPaused, clear } = useTrafficSocket();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [siteFilter, setSiteFilter] = useState("");

  const shown = siteFilter
    ? messages.filter((m) => m.site_id === siteFilter)
    : messages;
  const selected = messages.find((m) => m.event_id === selectedId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Traffic Inspector</h2>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
          >
            <option value="">Tất cả site</option>
            <option value="site_google">site_google</option>
            <option value="site_github">site_github</option>
          </select>
          <Button variant="outline" onClick={() => setPaused(!paused)}>
            {paused ? "Tiếp tục" : "Tạm dừng"}
          </Button>
          <Button variant="outline" onClick={clear}>
            Xóa
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="max-h-[75vh] w-1/2 overflow-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-left">
              <tr>
                <th className="p-2">Giờ</th>
                <th className="p-2">Site</th>
                <th className="p-2">Method</th>
                <th className="p-2">Status</th>
                <th className="p-2">ms</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => (
                <tr
                  key={m.event_id}
                  onClick={() => setSelectedId(m.event_id)}
                  className={`cursor-pointer border-t hover:bg-gray-100 ${
                    m.event_id === selectedId ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="p-2">
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-2">{m.site_id}</td>
                  <td className="p-2">{m.request.method}</td>
                  <td className="p-2">
                    {(m.modified_response ?? m.original_response).status_code}
                  </td>
                  <td className="p-2">{m.duration_ms ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && (
            <p className="p-4 text-sm text-gray-500">Chưa có request nào...</p>
          )}
        </div>

        <div className="w-1/2">
          {!selected ? (
            <p className="text-sm text-gray-500">
              Bấm một dòng bên trái để xem chi tiết.
            </p>
          ) : (
            <>
              <p className="mb-2 break-all text-sm">
                <b>{selected.request.method}</b> {selected.request.url}
              </p>
              <div className="flex gap-3">
                <ResponsePanel title="Gốc" res={selected.original_response} />
                <ResponsePanel title="Sau khi sửa" res={selected.modified_response} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}