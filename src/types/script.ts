export type ScriptLanguage = "python" | "php" | "javascript";
export type ScriptStatus = "active" | "inactive";


export interface Script {
  script_id: string;
  site_id: string;
  script_name: string;
  language: ScriptLanguage;
  version: number;
  entry_point: string;
  status: ScriptStatus;
  content_base64?: string; 
  created_at: string;
  updated_at: string;
}

export interface ScriptVersion {
  script_id: string;
  site_id?: string;
  script_name?: string;
  version: number;
  content_base64?: string; 
  note: string;
  created_at: string;
}