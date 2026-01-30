"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

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
  score: number
  totalQuestions: number
  passed: boolean
  submittedAt: Date
}

interface LearningContextType {
  courses: Course[]
  quizResults: Record<string, QuizResult>
  markLessonComplete: (courseId: string, lessonId: string) => void
  submitQuiz: (quizId: string, answers: Record<string, number>) => QuizResult
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
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      order: 1,
      completed: false,
      hasQuiz: true,
      quizId: "q1",
    },
    {
      id: "l2",
      title: "Understanding Bitcoin",
      description: "Deep dive into Bitcoin: how it works and why it was created.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      order: 2,
      completed: false,
      hasQuiz: false,
    },
    {
      id: "l3",
      title: "Blockchain Technology",
      description: "Explore the technology behind cryptocurrencies.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
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
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      order: 1,
      completed: false,
      hasQuiz: false,
    },
    {
      id: "l5",
      title: "Lending Protocols",
      description: "Learn about decentralized lending platforms.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
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

  const markLessonComplete = (courseId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id === courseId) {
          const updatedLessons = course.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, completed: true } : lesson
          )
          const completedCount = updatedLessons.filter((l) => l.completed).length
          const progress = (completedCount / updatedLessons.length) * 100
          return { ...course, lessons: updatedLessons, progress }
        }
        return course
      })
    )
  }

  const submitQuiz = (quizId: string, answers: Record<string, number>): QuizResult => {
    const quiz = mockQuizzes.find((q) => q.id === quizId)
    if (!quiz) {
      throw new Error("Quiz not found")
    }

    let correctCount = 0
    quiz.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    const score = (correctCount / quiz.questions.length) * 100
    const passed = score >= 70

    const result: QuizResult = {
      quizId,
      score,
      totalQuestions: quiz.questions.length,
      passed,
      submittedAt: new Date(),
    }

    setQuizResults((prev) => ({ ...prev, [quizId]: result }))
    return result
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
