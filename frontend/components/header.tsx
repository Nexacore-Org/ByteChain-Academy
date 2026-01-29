"use client"

import { useState } from "react"
import { Logo } from "./logo"
import { Button } from "./ui/button"
import { LoginModal } from "./auth/login-modal"
import { SignUpModal } from "./auth/signup-modal"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export function Header() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  const handleSwitchToSignup = () => {
    setLoginOpen(false)
    setSignupOpen(true)
  }

  const handleSwitchToLogin = () => {
    setSignupOpen(false)
    setLoginOpen(true)
  }

  return (
    <>
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button variant="outline" onClick={logout}>
                Log out
              </Button>
              <Link href="/courses">
                <Button>Start Learning</Button>
              </Link>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setLoginOpen(true)}>
                Log in
              </Button>
              <Button onClick={() => setSignupOpen(true)}>Start Learning</Button>
            </>
          )}
        </div>
      </header>
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
  )
}
