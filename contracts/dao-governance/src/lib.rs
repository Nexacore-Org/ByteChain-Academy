pub mod governance;
#[cfg(test)]
mod governance_test;

#![cfg_attr(not(feature = "std"), no_std)]

#[cfg(feature = "std")]
use ink_lang as ink;

#[ink::contract]
pub mod dao_governance {
    use ink_storage::collections::{HashMap as StorageHashMap};

    #[derive(scale::Encode, scale::Decode, Clone, PartialEq, Eq, Debug)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, serde::Serialize, serde::Deserialize))]
    pub enum ProposalStatus {
        Pending,
        Approved,
        Rejected,
    }

    355301

    #[derive(scale::Encode, scale::Decode, Clone, Debug)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, serde::Serialize, serde::Deserialize))]
    pub struct Proposal {
        id: u64,
        content: String,
        proposer: AccountId,
        yes_votes: u64,
        no_votes: u64,
        status: ProposalStatus,
    }

    #[ink(storage)]
    pub struct DaoGovernance {
        proposals: StorageHashMap<u64, Proposal>,
        votes: StorageHashMap<(u64, AccountId), bool>,
        proposal_count: u64,
        voting_period_end: StorageHashMap<u64, Timestamp>,
    }

    impl DaoGovernance {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                proposals: StorageHashMap::new(),
                votes: StorageHashMap::new(),
                proposal_count: 0,
                voting_period_end: StorageHashMap::new(),
            }
        }

        #[ink(message)]
        pub fn create_proposal(&mut self, content: String, voting_duration_secs: u64) -> u64 {
            let caller = self.env().caller();
            let id = self.proposal_count;
            let proposal = Proposal {
                id,
                content,
                proposer: caller,
                yes_votes: 0,
                no_votes: 0,
                status: ProposalStatus::Pending,
            };
            self.voting_period_end.insert(id, self.env().block_timestamp() + voting_duration_secs * 1000);
            self.proposals.insert(id, proposal);
            self.proposal_count += 1;
            id
        }

        #[ink(message)]
        pub fn vote(&mut self, proposal_id: u64, support: bool) -> Result<(), String> {
            let caller = self.env().caller();
            let now = self.env().block_timestamp();

            if let Some(proposal) = self.proposals.get_mut(&proposal_id) {
                if let Some(end_time) = self.voting_period_end.get(&proposal_id) {
                    if now > *end_time {
                        return Err("Voting period has ended".into());
                    }
                } else {
                    return Err("Voting period not found".into());
                }

                if self.votes.contains_key(&(proposal_id, caller)) {
                    return Err("Already voted".into());
                }

                if support {
                    proposal.yes_votes += 1;
                } else {
                    proposal.no_votes += 1;
                }
                self.votes.insert((proposal_id, caller), support);
                Ok(())
            } else {
                Err("Proposal not found".into())
            }
        }

        #[ink(message)]
        pub fn finalize_proposal(&mut self, proposal_id: u64) -> Result<ProposalStatus, String> {
            let now = self.env().block_timestamp();

            if let Some(proposal) = self.proposals.get_mut(&proposal_id) {
                let end_time = self.voting_period_end.get(&proposal_id).copied().unwrap_or(0);
                if now < end_time {
                    return Err("Voting period not ended".into());
                }

                if proposal.status != ProposalStatus::Pending {
                    return Err("Proposal already finalized".into());
                }

                proposal.status = if proposal.yes_votes > proposal.no_votes {
                    ProposalStatus::Approved
                } else {
                    ProposalStatus::Rejected
                };
                Ok(proposal.status.clone())
            } else {
                Err("Proposal not found".into())
            }
        }

        #[ink(message)]
        pub fn get_proposal(&self, proposal_id: u64) -> Option<Proposal> {
            self.proposals.get(&proposal_id).cloned()
        }
    }
}