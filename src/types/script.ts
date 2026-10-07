export type ScriptLanguage = "python" | "php" | "javascript";
export type ScriptStatus = "active" | "inactive";

export interface Script {
  script_id: string;
  site_id: string;
  script_name: string;
  language: ScriptLanguage;
  version: number;
  content_base64?: string; 
  entry_point: string;
  status: ScriptStatus;
  created_at: string;
  updated_at: string;
}