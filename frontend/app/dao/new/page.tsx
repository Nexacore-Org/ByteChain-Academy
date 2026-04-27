"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDAO } from "@/hooks/use-dao";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export default function NewProposalPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { createProposal, isCreatingProposal } = useDAO();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/dao");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    try {
      await createProposal({ title: title.trim(), description: description.trim() });
      toast.success("Proposal created.");
      router.push("/dao");
    } catch {
      toast.error("Unable to create proposal.");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Proposal title" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal..."
              className="w-full min-h-40 rounded-lg bg-[#0b1327] border border-white/10 px-4 py-3 text-sm"
            />
            <Button onClick={handleSubmit} disabled={isCreatingProposal}>
              {isCreatingProposal ? "Submitting..." : "Submit Proposal"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
