"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DaoProposal } from "@/hooks/use-dao";
import { VoteBar } from "./vote-bar";

function formatTimeLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Closed";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d left`;
  return `${hours}h left`;
}

export function ProposalCard({ proposal }: { proposal: DaoProposal }) {
  return (
    <Link href={`/dao/${proposal.id}`}>
      <Card className="hover:border-[#00ff88]/40 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl">{proposal.title}</CardTitle>
            <span className="text-xs px-2 py-1 rounded-full border border-white/20 text-gray-300">
              {proposal.status}
            </span>
          </div>
          <p className="text-gray-400 text-sm line-clamp-2">{proposal.description}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <VoteBar
            yesVotes={proposal.yesVotes}
            noVotes={proposal.noVotes}
            abstainVotes={proposal.abstainVotes}
          />
          <p className="text-xs text-gray-500">Deadline: {formatTimeLeft(proposal.votingDeadline)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
