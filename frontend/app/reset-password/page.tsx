"use client"

import { useState, Suspense } from "react"
import { Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const email = searchParams.get("email") ?? ""
  const token = searchParams.get("token") ?? ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error("Passwords do not match.")
      return
    }
    if (!email || !token) {
      toast.error("Invalid reset link.")
      return
    }
    setIsLoading(true)
    try {
      await resetPassword(email, token, password)
      toast.success("Password reset successfully. Please log in.")
      router.push("/")
    } catch {
      toast.error("Reset link is invalid or expired. Please request a new one.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-[#c7d5e3]">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="confirm" className="text-sm font-medium text-[#c7d5e3]">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="confirm"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-[#02c177]" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-[#00ff88]/20 flex items-center justify-center border border-[#00ff88]/30">
              <Lock className="w-8 h-8 text-[#00ff88]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-gray-400 mt-2">Enter your new password below.</p>
        </div>

        <Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center text-sm text-gray-400">
          <Link href="/" className="text-[#02c177] hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
