"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { BookOpen, Zap, TrendingUp, Shield } from "lucide-react"

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Complete beginner", description: "I'm new to crypto and blockchain" },
  { value: "some", label: "Some knowledge", description: "I know the basics but want to go deeper" },
  { value: "experienced", label: "Already investing", description: "I trade/invest and want to learn more" },
]

const LEARNING_GOALS = [
  { value: "understand_crypto", label: "Understand crypto basics", icon: BookOpen },
  { value: "learn_defi", label: "Learn DeFi & yield", icon: TrendingUp },
  { value: "build_web3", label: "Build Web3 apps", icon: Zap },
  { value: "secure_assets", label: "Secure my assets", icon: Shield },
]

interface Course {
  id: string
  title: string
  description: string
  difficulty?: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [experience, setExperience] = useState("")
  const [goal, setGoal] = useState("")
  const [enrolling, setEnrolling] = useState<string | null>(null)

  const difficulty =
    experience === "beginner" ? "Beginner" : experience === "some" ? "Intermediate" : "Advanced"

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["courses", difficulty],
    queryFn: async () => {
      const res = await api.get<Course[] | { data?: Course[] }>(`/courses?difficulty=${difficulty}`)
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    enabled: step === 4,
  })

  const saveAndFinish = async (courseId?: string) => {
    try {
      await api.patch("/users/me", { onboardingCompleted: true, learningGoal: goal })
      if (courseId) {
        setEnrolling(courseId)
        await api.post(`/courses/${courseId}/enroll`, {})
      }
      router.push("/dashboard")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress bar */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#00ff88]" : "bg-white/10"}`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-[#00ff88]/20 flex items-center justify-center border border-[#00ff88]/30">
                <BookOpen className="w-10 h-10 text-[#00ff88]" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-3">Welcome to ByteChain Academy</h1>
              <p className="text-gray-400">
                Short, practical lessons on crypto, DeFi, and Web3. Earn XP, collect badges, and get
                verifiable certificates — all at your own pace.
              </p>
            </div>
            <Button className="w-full bg-[#02c177]" onClick={() => setStep(2)}>
              Get Started
            </Button>
          </div>
        )}

        {/* Step 2: Experience level */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What&apos;s your experience level?</h2>
              <p className="text-gray-400">We&apos;ll tailor course recommendations for you.</p>
            </div>
            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setExperience(lvl.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    experience === lvl.value
                      ? "border-[#00ff88] bg-[#00ff88]/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="font-medium">{lvl.label}</div>
                  <div className="text-sm text-gray-400">{lvl.description}</div>
                </button>
              ))}
            </div>
            <Button
              className="w-full bg-[#02c177]"
              disabled={!experience}
              onClick={() => setStep(3)}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 3: Learning goal */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What&apos;s your main goal?</h2>
              <p className="text-gray-400">Pick the topic you&apos;re most excited about.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LEARNING_GOALS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setGoal(value)}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    goal === value
                      ? "border-[#00ff88] bg-[#00ff88]/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <Icon className="w-6 h-6 text-[#00ff88] mb-2" />
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </div>
            <Button
              className="w-full bg-[#02c177]"
              disabled={!goal}
              onClick={() => setStep(4)}
            >
              See Recommendations
            </Button>
          </div>
        )}

        {/* Step 4: Course recommendations */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Recommended for you</h2>
              <p className="text-gray-400">
                Based on your goals. Enrol in one to get started.
              </p>
            </div>

            {coursesLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            )}

            {!coursesLoading && courses.length === 0 && (
              <p className="text-gray-400 text-center py-6">No courses available yet.</p>
            )}

            <div className="space-y-3">
              {courses.slice(0, 4).map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{course.title}</div>
                    <div className="text-sm text-gray-400 truncate">{course.description}</div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 bg-[#02c177]"
                    disabled={enrolling === course.id}
                    onClick={() => void saveAndFinish(course.id)}
                  >
                    {enrolling === course.id ? "Enrolling..." : "Enrol & Start"}
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => void saveAndFinish()}
            >
              Skip — go to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
