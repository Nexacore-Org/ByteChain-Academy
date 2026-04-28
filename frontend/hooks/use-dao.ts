"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type VoteType = "YES" | "NO" | "ABSTAIN";
export type ProposalStatus = "ACTIVE" | "PASSED" | "REJECTED";

export interface DaoProposal {
  id: string;
  title: string;
  description: string;
  proposerId: string;
  status: ProposalStatus;
  votingDeadline: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  createdAt: string;
}

interface ProposalsResponse {
  proposals: DaoProposal[];
  total: number;
  page: number;
  limit: number;
}

export function useDAO() {
  const queryClient = useQueryClient();

  const proposalsQuery = useQuery({
    queryKey: ["dao-proposals"],
    queryFn: () => api.get<ProposalsResponse>("/dao/proposals"),
  });

  const createProposalMutation = useMutation({
    mutationFn: (payload: { title: string; description: string }) =>
      api.post<DaoProposal>("/dao/proposals", payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dao-proposals"] });
    },
  });

  const voteMutation = useMutation({
    mutationFn: (payload: { proposalId: string; vote: VoteType }) =>
      api.post<DaoProposal>(`/dao/proposals/${payload.proposalId}/vote`, { vote: payload.vote }),
    onSuccess: (updatedProposal) => {
      queryClient.setQueryData<DaoProposal>(["dao-proposal", updatedProposal.id], updatedProposal);
      queryClient.setQueryData<ProposalsResponse>(["dao-proposals"], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          proposals: prev.proposals.map((proposal) =>
            proposal.id === updatedProposal.id ? { ...proposal, ...updatedProposal } : proposal
          ),
        };
      });
    },
  });

  return {
    proposals: proposalsQuery.data?.proposals ?? [],
    isLoadingProposals: proposalsQuery.isLoading,
    proposalsError: proposalsQuery.isError ? "Failed to load proposals" : null,
    createProposal: createProposalMutation.mutateAsync,
    isCreatingProposal: createProposalMutation.isPending,
    voteOnProposal: voteMutation.mutateAsync,
    isVoting: voteMutation.isPending,
  };
}

export function useProposal(proposalId: string) {
  return useQuery({
    queryKey: ["dao-proposal", proposalId],
    queryFn: () => api.get<DaoProposal>(`/dao/proposals/${proposalId}`),
    enabled: Boolean(proposalId),
  });
}
