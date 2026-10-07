import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listScripts, saveScript, deleteScript } from "@/api/scripts";
import type { Script, ScriptLanguage } from "@/types/script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const decode = (b64?: string) => {
  if (!b64) return "";
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
  } catch {
    return "";
  }
};
const encode = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
};

const langOf = (name: string): ScriptLanguage =>
  name.endsWith(".php") ? "php" : name.endsWith(".js") ? "javascript" : "python";

const inputCls = "w-full rounded-md border px-3 py-2 text-sm";

export default function Scripts() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["scripts"], queryFn: listScripts });

  const [editing, setEditing] = useState<Script | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState("");
  const [siteId, setSiteId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const refresh = () => qc.invalidateQueries({ queryKey: ["scripts"] });
  const saveMut = useMutation({
    mutationFn: saveScript,
    onSuccess: () => {
      refresh();
      setEditing(null);
    },
  });
  const delMut = useMutation({ mutationFn: deleteScript, onSuccess: refresh });

  const openNew = () => {
    setIsNew(true);
    setName("");
    setSiteId("");
    setCode("def handle(request, response):\n    return response\n");
    setError("");
    setEditing({} as Script);
  };
  const openEdit = (s: Script) => {
    setIsNew(false);
    setName(s.script_name);
    setSiteId(s.site_id);
    setCode(decode(s.content_base64));
    setError("");
    setEditing(s);
  };

  const onSave = () => {
    if (!/^[A-Za-z0-9_]+\.(py|php|js)$/.test(name)) {
      setError("Tên file phải dạng ten_file.py / .php / .js");
      return;
    }
    if (!siteId.trim()) {
      setError("Cần nhập site_id");
      return;
    }
    const now = new Date().toISOString();
    saveMut.mutate({
      script_id: isNew ? `scr_${Date.now()}` : editing!.script_id,
      site_id: siteId.trim(),
      script_name: name,
      language: langOf(name),
      version: isNew ? 1 : editing!.version + 1,
      content_base64: encode(code),
      entry_point: "handle(request, response)",
      status: isNew ? "active" : editing!.status,
      created_at: isNew ? now : editing!.created_at,
      updated_at: now,
    });
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    f.text().then((t) => {
      setCode(t);
      if (isNew) setName(f.name);
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý Script</h2>
        <Button onClick={openNew}>+ Thêm script</Button>
      </div>

      {isLoading && <p>Đang tải...</p>}

      {data && (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Tên script</th>
                <th className="p-3">Site</th>
                <th className="p-3">Ngôn ngữ</th>
                <th className="p-3">Version</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Cập nhật</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.script_id} className="border-t">
                  <td className="p-3 font-mono">{s.script_name}</td>
                  <td className="p-3">{s.site_id}</td>
                  <td className="p-3">{s.language}</td>
                  <td className="p-3">v{s.version}</td>
                  <td className="p-3">
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>
                      {s.status === "active" ? "Hoạt động" : "Tắt"}
                    </Badge>
                  </td>
                  <td className="p-3">{new Date(s.updated_at).toLocaleString()}</td>
                  <td className="space-x-2 p-3">
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                      Xem / Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.confirm(`Xóa ${s.script_name}?`) && delMut.mutate(s.script_id)
                      }
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">
              {isNew ? "Thêm script" : `Sửa ${editing.script_name} (v${editing.version})`}
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Tên file</label>
                <input
                  className={inputCls}
                  disabled={!isNew}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="modify_google.py"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Site ID</label>
                <input
                  className={inputCls}
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  placeholder="site_google"
                />
              </div>
            </div>
            <div className="mb-2">
              <input type="file" accept=".py,.php,.js" onChange={onUpload} className="text-sm" />
            </div>
            <textarea
              className="h-72 w-full rounded-md border bg-gray-50 p-3 font-mono text-xs"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Hủy
              </Button>
              <Button onClick={onSave}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}