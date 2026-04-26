"use client";

import { Button } from "@/components/ui/button";
import { VoteType } from "@/hooks/use-dao";

interface VoteButtonsProps {
  disabled: boolean;
  loading: boolean;
  onVote: (vote: VoteType) => Promise<void>;
}

export function VoteButtons({ disabled, loading, onVote }: VoteButtonsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Button disabled={disabled || loading} onClick={() => void onVote("YES")}>
        {loading ? "Voting..." : "Vote Yes"}
      </Button>
      <Button
        variant="outline"
        disabled={disabled || loading}
        onClick={() => void onVote("NO")}
      >
        Vote No
      </Button>
      <Button
        variant="secondary"
        disabled={disabled || loading}
        onClick={() => void onVote("ABSTAIN")}
      >
        Abstain
      </Button>
    </div>
  );
}
