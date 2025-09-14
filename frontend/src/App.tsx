import React, { type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Board from "@/pages/Board";
import Calendar from "@/pages/Calendar";
import Analyst from "@/pages/Analyst";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");
  return (user || hasToken) ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/analyst" element={<ProtectedRoute><Analyst /></ProtectedRoute>} />

          {/* Redirects */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}