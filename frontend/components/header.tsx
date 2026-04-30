"use client";

import { useState } from "react";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { LoginModal } from "./auth/login-modal";
import { SignUpModal } from "./auth/signup-modal";
import { AccountDropdown } from "./account-dropdown";
import { NavCounters } from "./nav-counters";
import { NotificationDropdown } from "./notifications/notification-dropdown";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";
import { Menu } from "lucide-react";

export function Header() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { user } = useUser();

  const handleSwitchToSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };

  const handleSwitchToLogin = () => {
    setSignupOpen(false);
    setLoginOpen(true);
  };

  return (
    <>
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <Logo />
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role === "Admin" && (
                <Link href="/admin">
                  <Button variant="outline">Admin</Button>
                </Link>
              )}
              <NavCounters />
              <NotificationDropdown />
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/courses">
                <Button>Start Learning</Button>
              </Link>
              <AccountDropdown />
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setLoginOpen(true)}>
                Log in
              </Button>
              <Button onClick={() => setSignupOpen(true)}>
                Start Learning
              </Button>
            </>
          )}
        </div>

        {/* Mobile: show notification bell + account if authenticated */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <>
              <NotificationDropdown />
              <AccountDropdown />
            </>
          )}
        </div>
      </header>

      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLoginClick={() => setLoginOpen(true)}
        onSignupClick={() => setSignupOpen(true)}
      />

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignUpModal
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
}
