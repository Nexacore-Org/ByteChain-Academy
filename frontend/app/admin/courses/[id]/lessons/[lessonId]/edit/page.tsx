"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function EditLessonPage({ params }: PageProps) {
  const { id: courseId, lessonId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/lessons/${lessonId}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title ?? "");
        setContent(data.content ?? "");
        setVideoUrl(data.videoUrl ?? "");
        setOrder(data.order ?? 0);
      })
      .finally(() => setIsLoading(false));
  }, [lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/lessons/${lessonId}`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          videoUrl: videoUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update lesson");
      router.push(`/admin/courses/${courseId}/lessons`);
    } catch {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12">Loading...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <Link href={`/admin/courses/${courseId}/lessons`}>
          <button
            type="button"
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Lessons
          </button>
        </Link>
        <h1 className="text-2xl font-bold mb-6">Edit Lesson</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Lesson title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="flex w-full rounded-lg bg-[#0b1327] border border-white/10 px-4 py-3 text-sm text-[#8ca4bb] placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]"
              placeholder="Lesson content"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Video URL (optional)
            </label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Order (managed via drag-and-drop on lessons list)
            </label>
            <Input
              type="number"
              value={order}
              readOnly
              className="bg-white/5 cursor-not-allowed opacity-70"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
            <Link href={`/admin/courses/${courseId}/lessons`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
