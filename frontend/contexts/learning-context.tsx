"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PLACEHOLDER_VIDEO_URL } from "@/lib/constants"

interface Lesson {
  id: string
  title: string
  description: string
  videoUrl: string
  order: number
  completed: boolean
  hasQuiz: boolean
  quizId?: string
}

interface Course {
  id: string
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  rating: number
  duration: number
  lessons: Lesson[]
  progress: number
  enrolled: boolean
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  lessonId?: string
  courseId: string
}

interface QuizResult {
  quizId: string
  correctAnswers: number
  score: number
  totalQuestions: number
  passed: boolean
  submittedAt: string
}

interface LearningContextType {
  courses: Course[]
  quizResults: Record<string, QuizResult>
  isSubmittingQuiz: boolean
  isCompletingLesson: boolean
  markLessonComplete: (courseId: string, lessonId: string) => Promise<boolean>
  submitQuiz: (quizId: string, answers: Record<string, number>) => Promise<QuizResult | null>
  getCourseProgress: (courseId: string) => number
  getQuiz: (quizId: string) => Quiz | undefined
}

const LearningContext = createContext<LearningContextType | undefined>(undefined)

// Mock data
const mockLessons: Record<string, Lesson[]> = {
  "crypto-101": [
    {
      id: "l1",
      title: "Introduction to Cryptocurrency",
      description: "Learn the basics of what cryptocurrency is and why it matters.",
      videoUrl: PLACEHOLDER_VIDEO_URL,
      order: 1,
      completed: false,
      hasQuiz: true,
      quizId: "q1",
    },
    {
      id: "l2",
      title: "Understanding Bitcoin",
      description: "Deep dive into Bitcoin: how it works and why it was created.",
      videoUrl: PLACEHOLDER_VIDEO_URL,
      order: 2,
      completed: false,
      hasQuiz: false,
    },
    {
      id: "l3",
      title: "Blockchain Technology",
      description: "Explore the technology behind cryptocurrencies.",
      videoUrl: PLACEHOLDER_VIDEO_URL,
      order: 3,
      completed: false,
      hasQuiz: true,
      quizId: "q2",
    },
  ],
  "defi-fundamentals": [
    {
      id: "l4",
      title: "Introduction to DeFi",
      description: "What is decentralized finance and why it matters.",
      videoUrl: PLACEHOLDER_VIDEO_URL,
      order: 1,
      completed: false,
      hasQuiz: false,
    },
    {
      id: "l5",
      title: "Lending Protocols",
      description: "Learn about decentralized lending platforms.",
      videoUrl: PLACEHOLDER_VIDEO_URL,
      order: 2,
      completed: false,
      hasQuiz: true,
      quizId: "q3",
    },
  ],
}

const mockQuizzes: Quiz[] = [
  {
    id: "q1",
    title: "Cryptocurrency Basics Quiz",
    description: "Test your understanding of cryptocurrency fundamentals.",
    courseId: "crypto-101",
    lessonId: "l1",
    questions: [
      {
        id: "q1-1",
        question: "What is the primary purpose of cryptocurrency?",
        options: [
          "To replace traditional banking",
          "To enable decentralized digital transactions",
          "To make money quickly",
          "To avoid taxes",
        ],
        correctAnswer: 1,
      },
      {
        id: "q1-2",
        question: "Which cryptocurrency was created first?",
        options: ["Ethereum", "Bitcoin", "Litecoin", "Ripple"],
        correctAnswer: 1,
      },
      {
        id: "q1-3",
        question: "What is a blockchain?",
        options: [
          "A type of cryptocurrency",
          "A distributed ledger technology",
          "A mining tool",
          "A wallet application",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "q2",
    title: "Blockchain Technology Quiz",
    description: "Test your knowledge of blockchain fundamentals.",
    courseId: "crypto-101",
    lessonId: "l3",
    questions: [
      {
        id: "q2-1",
        question: "What makes a blockchain secure?",
        options: [
          "Centralized control",
          "Cryptographic hashing and consensus",
          "Government regulation",
          "Private ownership",
        ],
        correctAnswer: 1,
      },
      {
        id: "q2-2",
        question: "What is a block in a blockchain?",
        options: [
          "A unit of cryptocurrency",
          "A collection of transactions",
          "A mining reward",
          "A wallet address",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "q3",
    title: "DeFi Lending Quiz",
    description: "Test your understanding of DeFi lending protocols.",
    courseId: "defi-fundamentals",
    lessonId: "l5",
    questions: [
      {
        id: "q3-1",
        question: "What is the main advantage of DeFi lending?",
        options: [
          "No interest rates",
          "No need for collateral",
          "Permissionless and decentralized",
          "Guaranteed returns",
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "final-crypto-101",
    title: "Final Course Quiz: Crypto 101",
    description: "Final assessment for Crypto 101 course.",
    courseId: "crypto-101",
    questions: [
      {
        id: "final-1",
        question: "What problem does Bitcoin solve?",
        options: [
          "High transaction fees",
          "Double-spending in digital currency",
          "Slow internet speeds",
          "Limited supply of money",
        ],
        correctAnswer: 1,
      },
      {
        id: "final-2",
        question: "What is mining in cryptocurrency?",
        options: [
          "Creating new coins",
          "Validating transactions and securing the network",
          "Trading coins",
          "Storing coins",
        ],
        correctAnswer: 1,
      },
    ],
  },
]

const mockCourses: Course[] = [
  {
    id: "crypto-101",
    title: "Crypto 101: From Fiat to Bitcoin",
    description: "Understand why Bitcoin and blockchains exist. Learn the fundamentals of cryptocurrency and...",
    difficulty: "Beginner",
    rating: 4.8,
    duration: 6,
    lessons: mockLessons["crypto-101"],
    progress: 0,
    enrolled: true,
  },
  {
    id: "defi-fundamentals",
    title: "DeFi Fundamentals: Lending, AMMs & Yield",
    description: "Walk through DeFi protocols, automated market makers, and yield farming strategies without deep...",
    difficulty: "Intermediate",
    rating: 4.9,
    duration: 9,
    lessons: mockLessons["defi-fundamentals"],
    progress: 0,
    enrolled: true,
  },
  {
    id: "wallet-security",
    title: "Wallet Security Masterclass",
    description: "Learn how to protect your keys, avoid phishing attacks, and practice safe custody of digital assets.",
    difficulty: "Beginner",
    rating: 4.7,
    duration: 7,
    lessons: [],
    progress: 0,
    enrolled: false,
  },
  {
    id: "smart-contracts",
    title: "Smart Contract Development",
    description: "Build your first smart contract with Solidity. Understand gas optimization and security patterns.",
    difficulty: "Advanced",
    rating: 4.9,
    duration: 15,
    lessons: [],
    progress: 0,
    enrolled: false,
  },
  {
    id: "nft-fundamentals",
    title: "NFT Market Fundamentals",
    description: "Explore NFT standards, marketplaces, and digital ownership in the Web3 ecosystem.",
    difficulty: "Intermediate",
    rating: 4.6,
    duration: 8,
    lessons: [],
    progress: 0,
    enrolled: false,
  },
]

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(() => {
  
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("learning_courses")
      if (saved) {
        try {
          const savedCourses = JSON.parse(saved) as Course[]
          const courseMap = new Map<string, Course>(savedCourses.map((c: Course) => [c.id, c]))
          mockCourses.forEach((course) => {
            if (!courseMap.has(course.id)) {
              courseMap.set(course.id, course)
            }
          })
          return Array.from(courseMap.values()) as Course[]
        } catch {
          return mockCourses
        }
      }
    }
    return mockCourses
  })

  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("learning_quiz_results")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return {}
        }
      }
    }
    return {}
  })
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const [isCompletingLesson, setIsCompletingLesson] = useState(false)

  // Save to localStorage whenever courses or quizResults change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("learning_courses", JSON.stringify(courses))
    }
  }, [courses])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("learning_quiz_results", JSON.stringify(quizResults))
    }
  }, [quizResults])

  const markLessonComplete = async (courseId: string, lessonId: string): Promise<boolean> => {
    setIsCompletingLesson(true)
    try {
      try {
        await api.post("/progress/complete", { courseId, lessonId })
      } catch (error) {
        const status = (error as { status?: number }).status
        if (status === 404) {
          await api.post("/progress/lesson", { courseId, lessonId })
        } else {
          throw error
        }
      }

      const progressRows = await api.get<{ lessonId: string; completed: boolean }[]>(
        `/progress/course/${courseId}`
      )
      const completedByLessonId = new Map(progressRows.map((row) => [row.lessonId, row.completed]))

      setCourses((prev) =>
        prev.map((course) => {
          if (course.id !== courseId) {
            return course
          }
          const updatedLessons = course.lessons.map((lesson) => ({
            ...lesson,
            completed: completedByLessonId.get(lesson.id) ?? lesson.completed,
          }))
          const completedCount = updatedLessons.filter((l) => l.completed).length
          const progress = updatedLessons.length
            ? (completedCount / updatedLessons.length) * 100
            : 0
          return { ...course, lessons: updatedLessons, progress }
        })
      )
      return true
    } catch (error) {
      const status = (error as { status?: number }).status
      toast.error(
        status === 409
          ? "This lesson was already marked as complete."
          : "Unable to mark lesson complete. Please try again."
      )
      return false
    } finally {
      setIsCompletingLesson(false)
    }
  }

  const submitQuiz = async (
    quizId: string,
    answers: Record<string, number>
  ): Promise<QuizResult | null> => {
    const quiz = mockQuizzes.find((q) => q.id === quizId)
    if (!quiz) {
      throw new Error("Quiz not found")
    }

    const formattedAnswers = Object.entries(answers).reduce<Record<string, string>>(
      (acc, [questionId, optionIndex]) => {
        const question = quiz.questions.find((item) => item.id === questionId)
        if (question && question.options[optionIndex] !== undefined) {
          acc[questionId] = question.options[optionIndex]
        }
        return acc
      },
      {}
    )

    setIsSubmittingQuiz(true)
    try {
      const submission = await api.post<{
        quizId: string
        score: number
        totalQuestions: number
        correctAnswers: number
        passed: boolean
        submittedAt: string
      }>(`/quizzes/${quizId}/submit`, { answers: formattedAnswers })

      const result: QuizResult = {
        quizId: submission.quizId,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        correctAnswers: submission.correctAnswers,
        passed: submission.passed,
        submittedAt: submission.submittedAt,
      }

      setQuizResults((prev) => ({ ...prev, [quizId]: result }))
      return result
    } catch (error) {
      const status = (error as { status?: number }).status
      if (status === 409) {
        toast.error("You have already completed this quiz")
      } else {
        toast.error("Unable to submit quiz. Please check your connection and try again.")
      }
      return null
    } finally {
      setIsSubmittingQuiz(false)
    }
  }

  const getCourseProgress = (courseId: string): number => {
    const course = courses.find((c) => c.id === courseId)
    return course?.progress || 0
  }

  const getQuiz = (quizId: string): Quiz | undefined => {
    return mockQuizzes.find((q) => q.id === quizId)
  }

  return (
    <LearningContext.Provider
      value={{
        courses,
        quizResults,
        isSubmittingQuiz,
        isCompletingLesson,
        markLessonComplete,
        submitQuiz,
        getCourseProgress,
        getQuiz,
      }}
    >
      {children}
    </LearningContext.Provider>
  )
}

export function useLearning() {
  const context = useContext(LearningContext)
  if (context === undefined) {
    throw new Error("useLearning must be used within a LearningProvider")
  }
  return context
}

export { mockQuizzes }
