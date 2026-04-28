"use client";

import React, { createContext, useContext, useState } from "react";
import { apiFetch } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    typeof window !== "undefined" ? !!localStorage.getItem("auth_token") : false
  );

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ accessToken: string; user: { email: string; id: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }), headers: { "Content-Type": "application/json" } }
    );
    localStorage.setItem("auth_token", data.accessToken);
    localStorage.setItem("user_email", data.user.email);
    setIsAuthenticated(true);
  };

  const signup = async (name: string, email: string, password: string) => {
    const data = await apiFetch<{ accessToken: string; user: { email: string; id: string } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ name, email, password }), headers: { "Content-Type": "application/json" } }
    );
    localStorage.setItem("auth_token", data.accessToken);
    localStorage.setItem("user_email", data.user.email);
    localStorage.setItem("user_name", name);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_profile");
    localStorage.removeItem("notification_preferences");
    localStorage.removeItem("learning_stats");
    setIsAuthenticated(false);
  };

  const forgotPassword = async (email: string) => {
    await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const resetPassword = async (email: string, token: string, password: string) => {
    await apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, token, newPassword: password }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
