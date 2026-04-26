"use client";

import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, _password: string) => Promise<void>;
  signup: (name: string, email: string, _password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    typeof window !== "undefined" ? !!localStorage.getItem("auth_token") : false
  );

  const login = async (email: string, _password: string) => {
    // Mock login - in production, this would call your API
    localStorage.setItem("auth_token", "mock_token_" + Date.now());
    localStorage.setItem("user_email", email);
    setIsAuthenticated(true);
  };

  const signup = async (name: string, email: string, _password: string) => {
    // Mock signup - in production, this would call your API
    localStorage.setItem("auth_token", "mock_token_" + Date.now());
    localStorage.setItem("user_email", email);
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, logout }}>
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
