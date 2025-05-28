#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod dao_governance {
    use ink_storage::Mapping;
    use ink_prelude::{string::String, vec::Vec};
    use scale::{Encode, Decode};
    use scale_info::TypeInfo;
    use serde::{Serialize, Deserialize};

    #[derive(Encode, Decode, Clone, Debug, PartialEq, Eq, TypeInfo, Serialize, Deserialize)]
    pub enum ProposalStatus {
        Active,
        Accepted,
        Rejected,
        Expired,
    }

    #[derive(Encode, Decode, Clone, Debug, PartialEq, Eq, TypeInfo, Serialize, Deserialize)]
    pub struct Proposal {
        pub id: u64,
        pub content: String,
        pub yes_votes: u32,
        pub no_votes: u32,
        pub status: ProposalStatus,
        pub end_block: u64,
    }

    #[ink(storage)]
    pub struct DaoGovernance {
        proposals: Mapping<u64, Proposal>,
        proposal_count: u64,
    }

    impl DaoGovernance {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                proposals: Mapping::default(),
                proposal_count: 0,
            }
        }

        #[ink(event)]
        pub struct ProposalCreated {
            #[ink(topic)]
            pub proposal_id: u64,
            pub content: String,
        }

        #[ink(message)]
        pub fn create_proposal(&mut self, content: String, end_block: u64) {
            let proposal = Proposal {
                id: self.proposal_count,
                content,
                yes_votes: 0,
                no_votes: 0,
                status: ProposalStatus::Active,
                end_block,
            };
            self.proposals.insert(self.proposal_count, &proposal);
            self.proposal_count += 1;
        }

        #[ink(message)]
        pub fn vote(&mut self, proposal_id: u64, support: bool) {
            let mut proposal = self.proposals.get(proposal_id).expect("Proposal not found");
            assert_eq!(proposal.status, ProposalStatus::Active, "Voting closed");

            let block_number = Self::env().block_number();
            assert!(block_number <= proposal.end_block, "Voting period expired");

            if support {
                proposal.yes_votes += 1;
            } else {
                proposal.no_votes += 1;
            }

            self.proposals.insert(proposal_id, &proposal);
        }

        #[ink(message)]
        pub fn finalize_proposal(&mut self, proposal_id: u64) {
            let mut proposal = self.proposals.get(proposal_id).expect("Proposal not found");

            let block_number = Self::env().block_number();
            assert!(block_number > proposal.end_block, "Voting not ended");

            if proposal.status != ProposalStatus::Active {
                return;
            }

            proposal.status = if proposal.yes_votes > proposal.no_votes {
                ProposalStatus::Accepted
            } else {
                ProposalStatus::Rejected
            };

            self.proposals.insert(proposal_id, &proposal);
        }

    }
}
