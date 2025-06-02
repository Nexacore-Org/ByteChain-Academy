use serde::{Deserialize, Serialize};
use thiserror::Error;
use std::collections::HashMap;

#[derive(Debug, PartialEq, Eq, Clone, Serialize, Deserialize)]
pub enum Role {
    Tutor,
    Student,
    Admin,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserIdentity {
    pub address: String,
    pub role: Role,
}

#[derive(Debug, PartialEq, Eq, Clone, Serialize, Deserialize)]
pub enum ProposalStatus {
    Active,
    Accepted,
    Rejected,
    Expired,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Proposal {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub proposer: String,
    pub votes_for: u32,
    pub votes_against: u32,
    pub status: ProposalStatus,
    pub end_time: u64, // Unix timestamp for voting deadline
}

#[derive(Debug, thiserror::Error)]
pub enum GovernanceError {
    #[error("You are not authorized to perform this action.")]
    Unauthorized,
    #[error("The requested proposal was not found.")]
    ProposalNotFound,
    #[error("Voting period has expired.")]
    VotingExpired,
    #[error("User has already voted.")]
    AlreadyVoted,
    #[error("Invalid end time for proposal.")]
    InvalidEndTime,
}

pub struct GovernanceDAO {
    pub proposals: Vec<Proposal>,
    proposal_counter: u64,
    user_roles: HashMap<String, Role>,
    votes: HashMap<(u64, String), bool>,
    quorum: u32,
}

impl GovernanceDAO {
    pub fn new(quorum: u32) -> Self {
        Self {
            proposals: Vec::new(),
            proposal_counter: 0,
            user_roles: HashMap::new(),
            votes: HashMap::new(),
            quorum,
        }
    }

    pub fn set_role(&mut self, caller: &UserIdentity, user: UserIdentity) -> Result<(), GovernanceError> {
        if !matches!(caller.role, Role::Admin) {
            return Err(GovernanceError::Unauthorized);
        }
        self.user_roles.insert(user.address.clone(), user.role);
        Ok(())
    }

    pub fn submit_proposal(
        &mut self,
        user: &UserIdentity,
        title: String,
        description: String,
        end_time: u64,
        current_time: u64,
    ) -> Result<(), GovernanceError> {
        if !matches!(user.role, Role::Tutor | Role::Admin) {
            return Err(GovernanceError::Unauthorized);
        }
        if end_time <= current_time {
            return Err(GovernanceError::InvalidEndTime);
        }

        self.proposal_counter += 1;
        let proposal = Proposal {
            id: self.proposal_counter,
            title,
            description,
            proposer: user.address.clone(),
            votes_for: 0,
            votes_against: 0,
            status: ProposalStatus::Active,
            end_time,
        };
        self.proposals.push(proposal);
        Ok(())
    }

    pub fn vote_on_proposal(
        &mut self,
        user: &UserIdentity,
        proposal_id: u64,
        support: bool,
        current_time: u64,
    ) -> Result<(), GovernanceError> {
        if !matches!(user.role, Role::Student | Role::Tutor) {
            return Err(GovernanceError::Unauthorized);
        }

        let proposal = self.proposals
            .iter_mut()
            .find(|p| p.id == proposal_id)
            .ok_or(GovernanceError::ProposalNotFound)?;

        if proposal.status != ProposalStatus::Active {
            return Err(GovernanceError::VotingExpired);
        }
        if current_time > proposal.end_time {
            return Err(GovernanceError::VotingExpired);
        }

        let vote_key = (proposal_id, user.address.clone());
        if self.votes.contains_key(&vote_key) {
            return Err(GovernanceError::AlreadyVoted);
        }

        if support {
            proposal.votes_for += 1;
        } else {
            proposal.votes_against += 1;
        }
        self.votes.insert(vote_key, support);
        Ok(())
    }

    pub fn finalize_proposal(&mut self, proposal_id: u64, current_time: u64) -> Result<(), GovernanceError> {
        let proposal = self.proposals
            .iter_mut()
            .find(|p| p.id == proposal_id)
            .ok_or(GovernanceError::ProposalNotFound)?;

        if proposal.status != ProposalStatus::Active {
            return Err(GovernanceError::VotingExpired);
        }
        if current_time <= proposal.end_time {
            return Err(GovernanceError::VotingExpired);
        }

        let total_votes = proposal.votes_for + proposal.votes_against;
        proposal.status = if total_votes >= self.quorum && proposal.votes_for > proposal.votes_against {
            ProposalStatus::Accepted
        } else {
            ProposalStatus::Rejected
        };
        Ok(())
    }

    pub fn list_proposals(&self) -> &Vec<Proposal> {
        &self.proposals
    }
}

