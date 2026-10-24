import type { SensitiveRoute, RouteType } from "@/types/site";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const now = "2026-10-01T08:00:00Z";

let routes: SensitiveRoute[] = [
  { route_id: "r1", site_id: "site_google", path: "/login", type: "login", created_at: now },
  { route_id: "r2", site_id: "site_google", path: "/admin", type: "admin", created_at: now },
  { route_id: "r3", site_id: "site_github", path: "/session", type: "login", created_at: now },
];

export async function listRoutes(siteId: string): Promise<SensitiveRoute[]> {
  await delay();
  return routes.filter((r) => r.site_id === siteId);
}

export async function addRoute(siteId: string, path: string, type: RouteType): Promise<SensitiveRoute> {
  await delay();
  const r: SensitiveRoute = {
    route_id: `r_${Date.now()}`,
    site_id: siteId,
    path,
    type,
    created_at: new Date().toISOString(),
  };
  routes = [...routes, r];
  return r;
}

export async function deleteRoute(routeId: string): Promise<void> {
  await delay();
  routes = routes.filter((r) => r.route_id !== routeId);
}