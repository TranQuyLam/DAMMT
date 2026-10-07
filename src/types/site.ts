export type SiteStatus = "active" | "inactive";

export interface Site {
  site_id: string;
  name: string;
  target_url: string;
  path_prefix?: string;
  host?: string;
  port?: number;
  auth_required: boolean;
  assigned_scripts: string[];
  status: SiteStatus;
  created_at: string;
  updated_at: string;
}