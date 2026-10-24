import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Sites from "@/pages/Sites";
import Scripts from "@/pages/Scripts";
import Traffic from "@/pages/Traffic";
import Users from "@/pages/Users";
import Credentials from "@/pages/Credentials";
import Dashboard from "@/pages/Dashboard";
import SensitiveRoutes from "@/pages/SensitiveRoutes";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/credentials" element={<Credentials />} />
            <Route path="/users" element={<Users />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/scripts" element={<Scripts />} />
            <Route path="/traffic" element={<Traffic />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sensitive-routes" element={<SensitiveRoutes />} />
          </Route>
          <Route path="*" element={<Navigate to="/sites" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);