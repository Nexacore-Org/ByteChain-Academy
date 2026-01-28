"use client"

import { Header } from "@/components/header"
import { CourseCard } from "@/components/course-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const courses = [
  {
    id: "crypto-101",
    title: "Crypto 101: From Fiat to Bitcoin",
    description: "Understand why Bitcoin and blockchains exist. Learn the fundamentals of cryptocurrency and...",
    difficulty: "Beginner" as const,
    rating: 4.8,
    duration: 6,
    lessons: 8,
    students: 1204,
    instructor: "Dr. Sarah Johnson",
  },
  {
    id: "defi-fundamentals",
    title: "DeFi Fundamentals: Lending, AMMs & Yield",
    description: "Walk through DeFi protocols, automated market makers, and yield farming strategies without deep...",
    difficulty: "Intermediate" as const,
    rating: 4.9,
    duration: 9,
    lessons: 12,
    students: 856,
    instructor: "Michael Torres",
  },
  {
    id: "wallet-security",
    title: "Wallet Security Masterclass",
    description: "Learn how to protect your keys, avoid phishing attacks, and practice safe custody of digital assets.",
    difficulty: "Beginner" as const,
    rating: 4.7,
    duration: 7,
    lessons: 6,
    students: 2103,
    instructor: "Emma Rodriguez",
  },
  {
    id: "smart-contracts",
    title: "Smart Contract Development",
    description: "Build your first smart contract with Solidity. Understand gas optimization and security patterns.",
    difficulty: "Advanced" as const,
    rating: 4.9,
    duration: 15,
    lessons: 20,
    students: 542,
    instructor: "David Kim",
  },
  {
    id: "nft-fundamentals",
    title: "NFT Market Fundamentals",
    description: "Explore NFT standards, marketplaces, and digital ownership in the Web3 ecosystem.",
    difficulty: "Intermediate" as const,
    rating: 4.6,
    duration: 8,
    lessons: 10,
    students: 945,
    instructor: "Lisa Martinez",
  },
  {
    id: "dao-governance",
    title: "DAO Governance & Voting",
    description: "Learn about decentralized autonomous organizations and on-chain governance mechanisms.",
    difficulty: "Advanced" as const,
    rating: 4.8,
    duration: 12,
    lessons: 15,
    students: 387,
    instructor: "James Wilson",
  },
]

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse All Courses</h1>
          <p className="text-gray-400 text-lg">
            Explore our comprehensive Web3 curriculum. Sign in to enroll and track your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </main>
    </div>
  )
}
