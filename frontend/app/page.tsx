"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { SignUpModal } from "@/components/auth/signup-modal"
import { LoginModal } from "@/components/auth/login-modal"
import { Play, Book, Zap, BookOpenIcon } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [signupOpen, setSignupOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  const handleSwitchToSignup = () => {
    setLoginOpen(false)
    setSignupOpen(true)
  }

  const handleSwitchToLogin = () => {
    setSignupOpen(false)
    setLoginOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00443a] bg-[#020f1d] text-[#88f5cc] text-sm">
              <Zap className="w-4 h-4" />
              Learn Web3 in 5-10 minute sessions
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Master <span className="bg-gradient-to-r from-blue-400 to-[#00ff88] bg-clip-text text-transparent">Web3</span> at Your Own Pace
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From Bitcoin basics to DeFi protocols. Interactive lessons, instant quizzes, and verifiable certificates. Built for busy professionals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={() => setSignupOpen(true)}
              className="bg-[#02C177] text-[#002E20] px-8 py-6 text-lg flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Free Course
              <span className="ml-1">&gt;</span>
            </Button>
            <Link href="/courses">
              <Button
                variant="outline"
                className="px-8 py-6 text-lg flex items-center gap-2"
              >
                <BookOpenIcon className="w-5 h-5" />
                Browse Courses
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#00d88b]">4,200+</div>
              <div className="text-gray-400">Active Learners</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#01bfff]">24</div>
              <div className="text-gray-400">Expert Courses</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#7986ff]">98%</div>
              <div className="text-gray-400">Completion Rate</div>
            </div>
          </div>
        </div>
      </main>

      <SignUpModal
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignup={handleSwitchToSignup}
      />
    </div>
  )
}
