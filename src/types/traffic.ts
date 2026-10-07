export interface HttpResponseData {
  status_code: number;
  headers: Record<string, string>;
  body_base64: string;
}

export interface TrafficMessage {
  event_id: string;
  site_id: string;
  script_name?: string;
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body_base64?: string;
  };
  original_response: HttpResponseData;
  modified_response?: HttpResponseData;
  status: string;
  timestamp: string;
  duration_ms?: number;
}