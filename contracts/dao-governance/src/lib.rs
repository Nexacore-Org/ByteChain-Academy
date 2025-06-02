#![cfg_attr(not(feature = "std"), no_std)]
#[cfg(test)]
pub mod governance;

#[allow(unexpected_cfgs)]

#[ink::contract]
mod dao_governance {
    use ink::storage::traits::StorageLayout;
    use ink::storage::Mapping;
    use ink_prelude::{string::String, vec::Vec};
    use scale::{Encode, Decode};
    use scale_info::TypeInfo;

    #[derive(Encode, Decode, Clone, Debug, PartialEq, Eq, TypeInfo)]
    #[cfg_attr(feature = "std", derive(StorageLayout))]
    pub enum Role {
        Tutor,
        Student,
        Admin,
    }

    #[derive(Encode, Decode, Clone, Debug, PartialEq, Eq, TypeInfo)]
    #[cfg_attr(feature = "std", derive(StorageLayout))]
    pub enum ProposalStatus {
        Active,
        Accepted,
        Rejected,
        Expired,
    }

    #[derive(Encode, Decode, Clone, Debug, PartialEq, Eq, TypeInfo)]
    #[cfg_attr(feature = "std", derive(StorageLayout))]
    pub struct Proposal {
        pub id: u64,
        pub title: String,
        pub description: String,
        pub proposer: AccountId,
        pub yes_votes: u32,
        pub no_votes: u32,
        pub status: ProposalStatus,
        pub end_block: u64,
    }

    #[derive(Encode, Decode, Clone, Debug, PartialEq, Eq, TypeInfo)]
    #[cfg_attr(feature = "std", derive(StorageLayout))]
    pub enum GovernanceError {
        Unauthorized,
        ProposalNotFound,
        VotingClosed,
        VotingExpired,
        AlreadyVoted,
        InvalidEndBlock,
    }

    #[ink(event)]
    pub struct ProposalCreated {
        #[ink(topic)]
        pub proposal_id: u64,
        pub title: String,
        pub proposer: AccountId,
    }

    #[ink(event)]
    pub struct Voted {
        #[ink(topic)]
        pub proposal_id: u64,
        pub voter: AccountId,
        pub support: bool,
    }

    #[ink(event)]
    pub struct ProposalFinalized {
        #[ink(topic)]
        pub proposal_id: u64,
        pub status: ProposalStatus,
    }

    #[ink(storage)]
    pub struct DaoGovernance {
        proposals: Mapping<u64, Proposal>,
        proposal_count: u64,
        user_roles: Mapping<AccountId, Role>,
        votes: Mapping<(u64, AccountId), bool>,
        quorum: u32,
    }

    impl DaoGovernance {
        #[ink(constructor)]
        pub fn new(quorum: u32) -> Self {
            Self {
                proposals: Mapping::default(),
                proposal_count: 0,
                user_roles: Mapping::default(),
                votes: Mapping::default(),
                quorum,
            }
        }

        #[ink(message)]
        pub fn set_role(&mut self, user: AccountId, role: Role) -> Result<(), GovernanceError> {
            let caller = self.env().caller();
            if !self.user_roles.get(caller).map_or(false, |r| r == Role::Admin) {
                return Err(GovernanceError::Unauthorized);
            }
            self.user_roles.insert(user, &role);
            Ok(())
        }

        #[ink(message)]
        pub fn create_proposal(&mut self, title: String, description: String, end_block: u64) -> Result<(), GovernanceError> {
            let caller = self.env().caller();
            let role = self.user_roles.get(caller).ok_or(GovernanceError::Unauthorized)?;
            if !matches!(role, Role::Tutor | Role::Admin) {
                return Err(GovernanceError::Unauthorized);
            }

            let current_block = u64::from(self.env().block_number());
            if end_block <= current_block {
                return Err(GovernanceError::InvalidEndBlock);
            }

            let proposal = Proposal {
                id: self.proposal_count,
                title: title.clone(),
                description,
                proposer: caller,
                yes_votes: 0,
                no_votes: 0,
                status: ProposalStatus::Active,
                end_block,
            };
            self.proposals.insert(self.proposal_count, &proposal);
            self.env().emit_event(ProposalCreated {
                proposal_id: self.proposal_count,
                title,
                proposer: caller,
            });
            self.proposal_count += 1;
            Ok(())
        }

        #[ink(message)]
        pub fn vote(&mut self, proposal_id: u64, support: bool) -> Result<(), GovernanceError> {
            let caller = self.env().caller();
            let role = self.user_roles.get(caller).ok_or(GovernanceError::Unauthorized)?;
            if !matches!(role, Role::Student | Role::Tutor) {
                return Err(GovernanceError::Unauthorized);
            }

            let mut proposal = self.proposals.get(proposal_id).ok_or(GovernanceError::ProposalNotFound)?;
            if proposal.status != ProposalStatus::Active {
                return Err(GovernanceError::VotingClosed);
            }

            let current_block = u64::from(self.env().block_number());
            if current_block > proposal.end_block {
                return Err(GovernanceError::VotingExpired);
            }

            let vote_key = (proposal_id, caller);
            if self.votes.get(vote_key).is_some() {
                return Err(GovernanceError::AlreadyVoted);
            }

            if support {
                proposal.yes_votes += 1;
            } else {
                proposal.no_votes += 1;
            }
            self.votes.insert(vote_key, &support);
            self.proposals.insert(proposal_id, &proposal);
            self.env().emit_event(Voted {
                proposal_id,
                voter: caller,
                support,
            });
            Ok(())
        }

        #[ink(message)]
        pub fn finalize_proposal(&mut self, proposal_id: u64) -> Result<(), GovernanceError> {
            let mut proposal = self.proposals.get(proposal_id).ok_or(GovernanceError::ProposalNotFound)?;
            let current_block = u64::from(self.env().block_number());
            if current_block <= proposal.end_block {
                return Err(GovernanceError::VotingExpired);
            }

            if proposal.status != ProposalStatus::Active {
                return Err(GovernanceError::VotingClosed);
            }

            let total_votes = proposal.yes_votes + proposal.no_votes;
            proposal.status = if total_votes >= self.quorum && proposal.yes_votes > proposal.no_votes {
                ProposalStatus::Accepted
            } else {
                ProposalStatus::Rejected
            };

            self.proposals.insert(proposal_id, &proposal);
            self.env().emit_event(ProposalFinalized {
                proposal_id,
                status: proposal.status.clone(),
            });
            Ok(())
        }

        #[ink(message)]
        pub fn get_proposal(&self, proposal_id: u64) -> Option<Proposal> {
            self.proposals.get(proposal_id)
        }

        #[ink(message)]
        pub fn get_role(&self, user: AccountId) -> Option<Role> {
            self.user_roles.get(user)
        }

        #[ink(message)]
        pub fn list_proposals(&self) -> Vec<Proposal> {
            let mut proposals = Vec::new();
            for id in 0..self.proposal_count {
                if let Some(proposal) = self.proposals.get(id) {
                    proposals.push(proposal);
                }
            }
            proposals
        }
    }
}
