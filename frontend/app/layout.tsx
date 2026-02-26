import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { LearningProvider } from "@/contexts/learning-context";
import { UserProvider } from "@/contexts/user-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bytechain Academy - Web3 Education Platform",
  description:
    "Master Web3 at your own pace. From Bitcoin basics to DeFi protocols. Interactive lessons, instant quizzes, and verifiable certificates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <UserProvider>
            <LearningProvider>
              {children}
              <Toaster theme="dark" position="top-center" richColors />
            </LearningProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
