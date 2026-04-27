"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { ProposalCard } from "@/components/dao/proposal-card";
import { ProposalCardSkeleton } from "@/components/dao/proposal-card-skeleton";
import { Button } from "@/components/ui/button";
import { useDAO } from "@/hooks/use-dao";
import { useAuth } from "@/contexts/auth-context";

export default function DAOPage() {
  const { isAuthenticated } = useAuth();
  const { proposals, isLoadingProposals, proposalsError } = useDAO();

  const active = proposals.filter((proposal) => proposal.status === "ACTIVE");
  const closed = proposals.filter((proposal) => proposal.status !== "ACTIVE");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 space-y-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">DAO Governance</h1>
            <p className="text-gray-400 mt-2">Propose and vote on platform decisions.</p>
          </div>
          {isAuthenticated && (
            <Link href="/dao/new">
              <Button>Create Proposal</Button>
            </Link>
          )}
        </div>

        {isLoadingProposals && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProposalCardSkeleton key={index} />
            ))}
          </div>
        )}
        {proposalsError && <p className="text-red-400">{proposalsError}</p>}

        {!isLoadingProposals && !proposalsError && (
          <>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Active Proposals</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {active.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Closed Proposals</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {closed.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
