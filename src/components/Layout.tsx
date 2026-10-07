import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Globe, FileCode, Activity } from "lucide-react";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/sites", label: "Sites", icon: Globe },
  { to: "/scripts", label: "Scripts", icon: FileCode },
  { to: "/traffic", label: "Live Traffic", icon: Activity },
];

export default function Layout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen">
      <aside className="flex w-56 flex-col border-r bg-muted/30 p-4">
        <h1 className="mb-6 text-lg font-bold">Proxy Admin</h1>
        <nav className="flex-1 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t pt-3 text-sm">
          <p className="font-medium">{user.username}</p>
          <p className="mb-2 text-xs text-gray-500">Vai trò: {user.role_name}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}