import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuth((s) => s.setUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      setUser(user);
      navigate("/sites", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-md border px-3 py-2 text-sm";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-6 shadow">
        <h1 className="text-xl font-bold">Proxy Admin</h1>
        <div>
          <label className="mb-1 block text-sm font-medium">Tên đăng nhập</label>
          <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
          <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
        <p className="text-xs text-gray-500">Thử: admin / admin123</p>
      </form>
    </div>
  );
}