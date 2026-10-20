export interface Role {
  role_id: string;
  role_name: string;
  permissions: string[];
}

export type UserStatus = "active" | "inactive";

export interface AppUser {
  user_id: string;
  role_id: string;
  username: string;
  email: string;
  auth_provider: string; // "local" | "google" | "github"
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface SitePermission {
  permission_id: string;
  role_id: string;
  site_id: string;
  can_access: boolean;
}

export type CredentialType = "api_key" | "basic_auth" | "session_cookie";

export interface Credential {
  credential_id: string;
  user_id: string;
  site_id: string;
  type: CredentialType;
  header_name: string; // ví dụ "Authorization", "X-API-Key", "Cookie"
  value_masked: string; // UI chỉ nhận bản đã che, ví dụ "••••1234"
  status: "active" | "inactive";
  expires_at?: string;
}