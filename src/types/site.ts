export type SiteStatus = "active" | "inactive";

export interface Site {
  site_id: string;
  name: string;
  target_url: string;
  path_prefix?: string;
  host?: string;
  port?: number;
  auth_required: boolean;
  status: SiteStatus;
  created_at: string;
  updated_at: string;
}

export type RouteType = "login" | "admin" | "api" | "other";

export interface SiteVersion {
  site_id: string;
  version: number;
  snapshot: Site; 
  note: string;
  created_at: string;
}