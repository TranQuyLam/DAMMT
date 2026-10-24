import axios from "axios";

export const http = axios.create({ baseURL: "/api" });


http.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.error ?? err.message;
    return Promise.reject(new Error(msg));
  }
);