"use client";

interface VoteBarProps {
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
}

export function VoteBar({ yesVotes, noVotes, abstainVotes }: VoteBarProps) {
  const totalVotes = yesVotes + noVotes + abstainVotes;
  const yesPct = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
  const noPct = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0;
  const abstainPct = totalVotes > 0 ? (abstainVotes / totalVotes) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="h-3 w-full rounded-full overflow-hidden bg-white/10 flex">
        <div className="bg-[#00ff88]" style={{ width: `${yesPct}%` }} />
        <div className="bg-red-500" style={{ width: `${noPct}%` }} />
        <div className="bg-gray-500" style={{ width: `${abstainPct}%` }} />
      </div>
      <div className="text-xs text-gray-400 flex gap-3">
        <span>Yes: {yesVotes}</span>
        <span>No: {noVotes}</span>
        <span>Abstain: {abstainVotes}</span>
      </div>
    </div>
  );
}
