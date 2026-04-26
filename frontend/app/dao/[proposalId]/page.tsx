"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VoteBar } from "@/components/dao/vote-bar";
import { VoteButtons } from "@/components/dao/vote-buttons";
import { useDAO, useProposal, VoteType } from "@/hooks/use-dao";
import { toast } from "sonner";
import { ProposalCardSkeleton } from "@/components/dao/proposal-card-skeleton";

const DAO_VOTED_STORAGE_KEY = "dao_voted_proposals";

type StoredVote = VoteType | "VOTED";

function getStoredVote(proposalId: string): StoredVote | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAO_VOTED_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, StoredVote>;
    return map[proposalId] ?? null;
  } catch {
    return null;
  }
}

function persistStoredVote(proposalId: string, vote: StoredVote) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(DAO_VOTED_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, StoredVote>) : {};
    map[proposalId] = vote;
    localStorage.setItem(DAO_VOTED_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // no-op
  }
}

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = use(params);
  const { data: proposal, isLoading, isError } = useProposal(proposalId);
  const { voteOnProposal, isVoting } = useDAO();
  const [now] = useState(() => Date.now());
  const [storedVote] = useState<StoredVote | null>(() => getStoredVote(proposalId));
  const [hasVoted, setHasVoted] = useState(Boolean(storedVote));
  const [myVote, setMyVote] = useState<VoteType | null>(
    storedVote && storedVote !== "VOTED" ? storedVote : null
  );

  const isClosed = proposal
    ? proposal.status !== "ACTIVE" || new Date(proposal.votingDeadline).getTime() < now
    : true;
  const canVote = proposal && !isClosed && !hasVoted;

  const deadlineText = useMemo(() => {
    if (!proposal) return "";
    const diff = new Date(proposal.votingDeadline).getTime() - now;
    if (diff <= 0) return "Voting closed";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    return days > 0 ? `${days} day(s) left` : `${hours} hour(s) left`;
  }, [now, proposal]);

  const handleVote = async (vote: VoteType) => {
    try {
      await voteOnProposal({ proposalId, vote });
      setHasVoted(true);
      setMyVote(vote);
      persistStoredVote(proposalId, vote);
      toast.success("Vote submitted.");
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 409) {
        setHasVoted(true);
        persistStoredVote(proposalId, myVote ?? "VOTED");
        toast.error("You have already voted on this proposal.");
      } else {
        toast.error("Unable to submit vote. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <Link href="/dao">
          <Button variant="ghost" className="mb-4">Back to Proposals</Button>
        </Link>

        {isLoading && <ProposalCardSkeleton />}
        {isError && <p className="text-red-400">Failed to load proposal.</p>}

        {proposal && (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{proposal.title}</CardTitle>
              <p className="text-sm text-gray-400">
                Status: {proposal.status} • {deadlineText}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-200 whitespace-pre-wrap">{proposal.description}</p>
              <VoteBar
                yesVotes={proposal.yesVotes}
                noVotes={proposal.noVotes}
                abstainVotes={proposal.abstainVotes}
              />
              {myVote && <p className="text-sm text-[#00ff88]">Your vote: {myVote}</p>}
              <VoteButtons disabled={!canVote} loading={isVoting} onVote={handleVote} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
