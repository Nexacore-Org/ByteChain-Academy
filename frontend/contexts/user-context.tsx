"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: "Student" | "Instructor" | "Admin";
  avatar?: string;
  createdAt: Date;
}

export interface LearningStats {
  experiencePoints: number;
  badgesCount: number;
  certificatesCount: number;
  streakDays: number;
}

export interface NotificationPreferences {
  courseUpdates: boolean;
  newLessonsAvailable: boolean;
  achievementAlerts: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  stats: LearningStats;
  notificationPreferences: NotificationPreferences;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateNotificationPreferences: (
    updates: Partial<NotificationPreferences>,
  ) => void;
  loadUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Default mock data
const defaultStats: LearningStats = {
  experiencePoints: 2450,
  badgesCount: 7,
  certificatesCount: 2,
  streakDays: 14,
};

const defaultNotificationPreferences: NotificationPreferences = {
  courseUpdates: true,
  newLessonsAvailable: true,
  achievementAlerts: false,
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<LearningStats>(defaultStats);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(defaultNotificationPreferences);

  const loadUserData = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        // Load user profile from localStorage or use defaults
        const savedProfile = localStorage.getItem("user_profile");
        const savedPrefs = localStorage.getItem("notification_preferences");
        const savedStats = localStorage.getItem("learning_stats");

        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            setUser({
              ...parsed,
              createdAt: new Date(parsed.createdAt),
            });
          } catch {
            // Use default user from localStorage data
            createDefaultUser();
          }
        } else {
          createDefaultUser();
        }

        if (savedPrefs) {
          try {
            setNotificationPreferences(JSON.parse(savedPrefs));
          } catch {
            setNotificationPreferences(defaultNotificationPreferences);
          }
        }

        if (savedStats) {
          try {
            setStats(JSON.parse(savedStats));
          } catch {
            setStats(defaultStats);
          }
        }
      } else {
        setUser(null);
      }
    }
  };

  const createDefaultUser = () => {
    const email = localStorage.getItem("user_email") || "student@bytechain.edu";
    const name = localStorage.getItem("user_name") || "Alex Johnson";

    const defaultUser: UserProfile = {
      id: "user_" + Date.now(),
      fullName: name,
      email: email,
      role: "Student",
      createdAt: new Date(),
    };
    setUser(defaultUser);
    localStorage.setItem("user_profile", JSON.stringify(defaultUser));
  };

  useEffect(() => {
    loadUserData();

    // Listen for storage changes (for auth state updates)
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user_profile", JSON.stringify(updatedUser));

      // Also update individual localStorage items for compatibility
      if (updates.fullName) {
        localStorage.setItem("user_name", updates.fullName);
      }
      if (updates.email) {
        localStorage.setItem("user_email", updates.email);
      }
    }
  };

  const updateNotificationPreferences = (
    updates: Partial<NotificationPreferences>,
  ) => {
    const updatedPrefs = { ...notificationPreferences, ...updates };
    setNotificationPreferences(updatedPrefs);
    localStorage.setItem(
      "notification_preferences",
      JSON.stringify(updatedPrefs),
    );
  };

  return (
    <UserContext.Provider
      value={{
        user,
        stats,
        notificationPreferences,
        updateProfile,
        updateNotificationPreferences,
        loadUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
