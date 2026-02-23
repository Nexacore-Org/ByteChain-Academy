"use client"

import { useState } from "react"
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignup: () => void
}

export function LoginModal({ open, onOpenChange, onSwitchToSignup }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      setError("")
      await login(email, password)
      onOpenChange(false)
      // Reset form
      setEmail("")
      setPassword("")
      // Navigate to dashboard page
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      if (!window.navigator.onLine) {
        setError("Unable to connect. Please check your connection and try again")
      } else if (err.status === 401 || err.message?.includes("401")) {
        setError("Incorrect email or password")
      } else {
        setError("Something went wrong. Please try again")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-[#00ff88]/20 flex items-center justify-center border border-[#00ff88]/30">
              <Lock className="w-8 h-8 text-[#00ff88]" />
            </div>
          </div>
          <DialogTitle>Welcome Back</DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign in to continue your learning journey
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[#c7d5e3]">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[#c7d5e3]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#02c177]"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-[#02c177] hover:underline font-medium"
          >
            Sign up
          </button>
        </div>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </DialogContent>
    </Dialog>
  )
}
