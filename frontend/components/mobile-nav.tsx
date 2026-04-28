"use client";

import Link from "next/link";
import { X, LayoutDashboard, BookOpen, Vote, Coins, Trophy, User, LogIn, UserPlus, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/dao", label: "DAO", icon: Vote },
  { href: "/currencies", label: "Currencies", icon: Coins },
  { href: "/rewards", label: "Rewards", icon: Trophy },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function MobileNav({ isOpen, onClose, onLoginClick, onSignupClick }: MobileNavProps) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-[#0a0a0a] border-r border-[#00ff88]/20 transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#00ff88]/20">
          <span className="text-[#00ff88] font-bold text-lg">ByteChain</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors" aria-label="Close menu">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-[#00ff88]/10 transition-colors"
            >
              <Icon className="w-5 h-5 text-[#00ff88]" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[#00ff88]/20 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-[#00ff88]/10 transition-colors"
              >
                <User className="w-5 h-5 text-[#00ff88]" />
                Profile
              </Link>
              <button
                onClick={() => { logout(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onLoginClick(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-[#00ff88]/10 transition-colors"
              >
                <LogIn className="w-5 h-5 text-[#00ff88]" />
                Log in
              </button>
              <button
                onClick={() => { onSignupClick(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/20 transition-colors font-medium"
              >
                <UserPlus className="w-5 h-5" />
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
