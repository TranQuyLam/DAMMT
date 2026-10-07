import type { Site } from "@/types/site";
import type { Script } from "@/types/script";
import type { TrafficMessage } from "@/types/traffic";

export const mockSites: Site[] = [
  {
    site_id: "site_google",
    name: "Google Search Proxy",
    target_url: "https://www.google.com",
    path_prefix: "/google",
    host: "google.proxy.local",
    port: 8080,
    auth_required: true,
    assigned_scripts: ["modify_google.py"],
    status: "active",
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-05T10:00:00Z",
  },
  {
    site_id: "site_github",
    name: "GitHub Proxy",
    target_url: "https://github.com",
    path_prefix: "/github",
    auth_required: true,
    assigned_scripts: ["modify_github.js"],
    status: "active",
    created_at: "2026-10-04T09:00:00Z",
    updated_at: "2026-10-04T09:30:00Z",
  },
];

export const mockScripts: Script[] = [
  {
    script_id: "scr_001",
    site_id: "site_google",
    script_name: "modify_google.py",
    language: "python",
    version: 3,
    content_base64:
      "ZGVmIGhhbmRsZShyZXF1ZXN0LCByZXNwb25zZSk6CiAgICByZXR1cm4gcmVzcG9uc2UK",
    entry_point: "handle(request, response)",
    status: "active",
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-05T10:00:00Z",
  },
  {
    script_id: "scr_002",
    site_id: "site_github",
    script_name: "modify_github.js",
    language: "javascript",
    version: 1,
    content_base64:
      "ZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZShyZXF1ZXN0LCByZXNwb25zZSkgeyByZXR1cm4gcmVzcG9uc2U7IH0=",
    entry_point: "handle(request, response)",
    status: "active",
    created_at: "2026-10-04T09:00:00Z",
    updated_at: "2026-10-04T09:30:00Z",
  },
];

const b64 = (s: string) => btoa(unescape(encodeURIComponent(s)));

export function makeMockTraffic(n: number): TrafficMessage {
  const site = n % 2 === 0 ? "site_google" : "site_github";
  return {
    event_id: `t_${n}`,
    timestamp: new Date().toISOString(),
    status: "success",
    site_id: site,
    script_name: site === "site_google" ? "modify_google.py" : "modify_github.js",
    request: {
      url: `https://target.example/path?q=${n}`,
      method: n % 3 === 0 ? "POST" : "GET",
      headers: { "User-Agent": "Mozilla/5.0" },
    },
    original_response: {
      status_code: 200,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
      body_base64: b64("<html>Trang gốc " + n + "</html>"),
    },
    modified_response: {
      status_code: 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "X-Proxied-By": "My-MultiSite-Proxy",
      },
      body_base64: b64("<html>Trang đã sửa " + n + "</html>"),
    },
    duration_ms: 20 + (n % 50),
  };
}