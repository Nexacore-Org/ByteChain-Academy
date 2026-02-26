"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Award,
  Gift,
  FileCheck,
  Shield,
  LayoutDashboard
} from "lucide-react";

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push("/");
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 hover:border-white/20 transition-all duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d88b] flex items-center justify-center text-[#002E20] text-sm font-bold">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(user?.fullName || "User")
          )}
        </div>

        {/* Name (hidden on mobile) */}
        <span className="text-sm font-medium text-white hidden sm:block max-w-[120px] truncate">
          {user?.fullName || "User"}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f1629] border border-white/10 shadow-xl shadow-black/30 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold text-white truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleNavigate("/profile")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              role="menuitem"
            >
              <User className="w-4 h-4" />
              View Profile
            </button>

            <button
              onClick={() => handleNavigate("/certificates")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              role="menuitem"
            >
              <Award className="w-4 h-4" />
              My Certificates
            </button>

            <button
              onClick={() => handleNavigate("/rewards")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              role="menuitem"
            >
              <Gift className="w-4 h-4" />
              Rewards
            </button>

            <button
              onClick={() => handleNavigate("/verify-certificate")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              role="menuitem"
            >
              <FileCheck className="w-4 h-4" />
              Verify Certificate
            </button>

            <button
              onClick={() => handleNavigate("/settings")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              role="menuitem"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            <button
              onClick={() => handleNavigate("/admin/courses")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              role="menuitem"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </button>
            {user?.role === "Admin" && (
              <button
                onClick={() => handleNavigate("/admin/certificates")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                role="menuitem"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-white/10 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
