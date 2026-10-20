import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listVersions, rollbackScript } from "@/api/scripts";
import type { Script } from "@/types/script";
import { Button } from "@/components/ui/button";

const decode = (b64?: string) => {
  if (!b64) return "";
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
  } catch {
    return "";
  }
};

// Diff đơn giản theo dòng: dòng chỉ có ở bản cũ (đỏ) / chỉ có ở bản hiện tại (xanh)
function lineDiff(oldText: string, newText: string) {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const setA = new Set(a);
  const setB = new Set(b);
  const out: { type: "same" | "add" | "del"; text: string }[] = [];
  a.forEach((l) => out.push({ type: setB.has(l) ? "same" : "del", text: l }));
  b.forEach((l) => {
    if (!setA.has(l)) out.push({ type: "add", text: l });
  });
  return out;
}

interface Props {
  script: Script;
  onClose: () => void;
}

export default function VersionHistory({ script, onClose }: Props) {
  const qc = useQueryClient();
  const { data: versions, isLoading } = useQuery({
    queryKey: ["versions", script.script_id],
    queryFn: () => listVersions(script.script_id),
  });
  const [picked, setPicked] = useState<number | null>(null);

  const rbMut = useMutation({
    mutationFn: (v: number) => rollbackScript(script.script_id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scripts"] });
      qc.invalidateQueries({ queryKey: ["versions", script.script_id] });
      setPicked(null);
    },
  });

  const current = versions?.[0];
  const selected = versions?.find((v) => v.version === picked);
  const diff =
    selected && current
      ? lineDiff(decode(selected.content_base64), decode(current.content_base64))
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            Lịch sử phiên bản: {script.script_name}
          </h3>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>

        {isLoading && <p>Đang tải...</p>}

        <div className="flex gap-4">
          <div className="w-1/3 overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-2">Ver</th>
                  <th className="p-2">Ghi chú</th>
                  <th className="p-2">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {versions?.map((v, i) => (
                  <tr
                    key={v.version}
                    onClick={() => setPicked(v.version)}
                    className={`cursor-pointer border-t hover:bg-gray-100 ${
                      v.version === picked ? "bg-blue-50" : ""
                    }`}
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
            {!selected ? (
              <p className="text-sm text-gray-500">Bấm một phiên bản để so sánh với bản hiện tại.</p>
            ) : selected.version === current?.version ? (
              <p className="text-sm text-gray-500">Đây là phiên bản hiện tại.</p>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm">
                    So sánh <b>v{selected.version}</b> với bản hiện tại{" "}
                    <span className="text-red-600">(đỏ: chỉ có ở v{selected.version}</span>,{" "}
                    <span className="text-green-600">xanh: chỉ có ở bản hiện tại)</span>
                  </p>
                  <Button
                    size="sm"
                    disabled={rbMut.isPending}
                    onClick={() =>
                      window.confirm(`Rollback về v${selected.version}?`) &&
                      rbMut.mutate(selected.version)
                    }
                  >
                    Rollback về v{selected.version}
                  </Button>
                </div>
                <pre className="max-h-96 overflow-auto rounded border bg-gray-50 p-2 text-xs">
                  {diff.map((d, i) => (
                    <div
                      key={i}
                      className={
                        d.type === "add"
                          ? "bg-green-100 text-green-800"
                          : d.type === "del"
                          ? "bg-red-100 text-red-800"
                          : ""
                      }
                    >
                      {d.type === "add" ? "+ " : d.type === "del" ? "- " : "  "}
                      {d.text}
                    </div>
                  ))}
                </pre>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}