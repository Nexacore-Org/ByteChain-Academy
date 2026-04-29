"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "@/lib/api";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: "Student" | "Instructor" | "Admin";
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

export interface LearningStats {
  experiencePoints: number;
  badgesCount: number;
  certificatesCount: number;
  streakDays: number;
}

export interface UserStats {
  courseCount: number;
  completedCourseCount: number;
  certificateCount: number;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveAt: string | null;
  badgesCount: number;
  rank: number;
}

export interface NotificationPreferences {
  courseUpdates: boolean;
  newLessonsAvailable: boolean;
  achievementAlerts: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  stats: LearningStats;
  userStats: UserStats | null;
  userStatsLoading: boolean;
  userStatsError: boolean;
  notificationPreferences: NotificationPreferences;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateNotificationPreferences: (
    updates: Partial<NotificationPreferences>,
  ) => Promise<void>;
  loadUserData: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
  invalidateUserStats: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const emptyStats: LearningStats = {
  experiencePoints: 0,
  badgesCount: 0,
  certificatesCount: 0,
  streakDays: 0,
};

const defaultNotificationPreferences: NotificationPreferences = {
  courseUpdates: true,
  newLessonsAvailable: true,
  achievementAlerts: false,
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<LearningStats>(emptyStats);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userStatsLoading, setUserStatsLoading] = useState(false);
  const [userStatsError, setUserStatsError] = useState(false);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(defaultNotificationPreferences);

  const getLocalFallbackUser = useCallback((): UserProfile => {
    if (typeof window === "undefined") {
      return {
        id: "loading",
        fullName: "Loading...",
        email: "",
        role: "Student",
        createdAt: new Date(),
      };
    }
    const email = localStorage.getItem("user_email") || "student@bytechain.edu";
    const name =
      localStorage.getItem("user_name") || email.split("@")[0] || "Student";
    const avatar = localStorage.getItem("user_avatar") || undefined;
    const bio = localStorage.getItem("user_bio") || undefined;

    return {
      id: `local-${email}`,
      fullName: name,
      email,
      role: "Student",
      avatar,
      bio,
      createdAt: new Date(),
    };
  }, []);

  // Initialize user from fallback if token exists
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token && !user) {
      setUser(getLocalFallbackUser());
    }
  }, [createDefaultUser]);
  }, [getLocalFallbackUser, user]);

  type RawUser = {
    id: string;
    email: string;
    username?: string;
    fullName?: string;
    role?: string;
    avatar?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    notificationPreferences?: Partial<NotificationPreferences> | null;
    createdAt?: string;
  };

  const toRole = (role?: string): UserProfile["role"] => {
    const normalized = (role ?? "Student").toLowerCase();
    if (normalized === "admin") return "Admin";
    if (normalized === "instructor") return "Instructor";
    return "Student";
  };

  const mapUser = useCallback((raw: RawUser): UserProfile => {
    return {
      id: raw.id,
      fullName: raw.fullName ?? raw.username ?? "",
      email: raw.email,
      role: toRole(raw.role),
      avatar: raw.avatar ?? raw.avatarUrl ?? undefined,
      bio: raw.bio ?? undefined,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    };
  }, []);

  const loadUserData = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setUser(null);
      setStats(emptyStats);
      setNotificationPreferences(defaultNotificationPreferences);
      return;
    }

    try {
      const profile = await api.get<RawUser>("/users/me");
      const mapped = mapUser(profile);
      setUser(mapped);

      // Update local storage cache
      localStorage.setItem("user_name", mapped.fullName);
      if (mapped.avatar) localStorage.setItem("user_avatar", mapped.avatar);
      if (mapped.bio) localStorage.setItem("user_bio", mapped.bio);

      setNotificationPreferences({
        ...defaultNotificationPreferences,
        ...(profile.notificationPreferences ?? {}),
      });
    } catch (err) {
      console.error("Failed to load user data:", err);
      // Ensure we have at least a fallback user if token exists
      setUser((prev) => prev ?? getLocalFallbackUser());
    }
  }, [getLocalFallbackUser, mapUser]);

  useEffect(() => {
    void loadUserData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "user_email") {
        void loadUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadUserData]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return;

      if (
        updates.avatar !== undefined &&
        updates.fullName === undefined &&
        updates.email === undefined &&
        updates.bio === undefined
      ) {
        setUser((prev) => (prev ? { ...prev, avatar: updates.avatar } : prev));
        return;
      }

      const payload: {
        username?: string;
        fullName?: string;
        email?: string;
        bio?: string;
        notificationPreferences?: NotificationPreferences;
      } = {};

      if (updates.fullName !== undefined) {
        payload.username = updates.fullName;
      }
      if (updates.email !== undefined) {
        payload.email = updates.email;
      }
      if (updates.bio !== undefined) {
        payload.bio = updates.bio;
      }

      if (Object.keys(payload).length === 0) {
        return;
      }

      const updated = await api.patch<RawUser>("/users/me", payload);
      setUser(mapUser(updated));
      if (updated.notificationPreferences) {
        setNotificationPreferences({
          ...defaultNotificationPreferences,
          ...updated.notificationPreferences,
        });
      }
    },
    [mapUser, user],
  );

  const updateNotificationPreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      const updatedPrefs = { ...notificationPreferences, ...updates };
      const updated = await api.patch<RawUser>("/users/me", {
        notificationPreferences: updatedPrefs,
      });
      setNotificationPreferences({
        ...defaultNotificationPreferences,
        ...(updated.notificationPreferences ?? updatedPrefs),
      });
      setUser((prev) => {
        if (!prev) return prev;
        return mapUser({
          ...updated,
          id: updated.id ?? prev.id,
          email: updated.email ?? prev.email,
          role: updated.role ?? prev.role,
          fullName: updated.fullName ?? updated.username ?? prev.fullName,
          avatar: updated.avatar ?? prev.avatar,
          bio: updated.bio ?? prev.bio,
          createdAt: updated.createdAt ?? prev.createdAt.toISOString(),
        });
      });
    },
    [mapUser, notificationPreferences],
  );

  const fetchUserStats = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setUserStats(null);
      setStats(emptyStats);
      return;
    }
    setUserStatsLoading(true);
    setUserStatsError(false);
    try {
      const data = await api.get<UserStats>("/users/me/stats");
      setUserStats(data);
      setStats({
        experiencePoints: data.xp ?? 0,
        badgesCount: data.badgesCount ?? 0,
        certificatesCount: data.certificateCount ?? 0,
        streakDays: data.streak ?? 0,
      });
    } catch {
      setUserStatsError(true);
      setUserStats(null);
      setStats(emptyStats);
    } finally {
      setUserStatsLoading(false);
    }
  }, []);

  const invalidateUserStats = useCallback(() => {
    setUserStats(null);
    void fetchUserStats();
  }, [fetchUserStats]);

  useEffect(() => {
    if (user) {
      void fetchUserStats();
    } else {
      setUserStats(null);
      setUserStatsError(false);
      setStats(emptyStats);
    }
  }, [user, fetchUserStats]);

  return (
    <UserContext.Provider
      value={{
        user,
        stats,
        userStats,
        userStatsLoading,
        userStatsError,
        notificationPreferences,
        updateProfile,
        updateNotificationPreferences,
        loadUserData,
        fetchUserStats,
        invalidateUserStats,
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
