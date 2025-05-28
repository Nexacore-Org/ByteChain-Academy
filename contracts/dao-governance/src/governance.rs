use serde::{Deserialize, Serialize};
use thiserror::Error;


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


#[cfg_attr(feature = "std", derive(thiserror::Error))]
pub enum GovernanceError {
    #[error("You are not authorized to perform this action.")]
    Unauthorized,
    
    #[error("The requested proposal was not found.")]
    ProposalNotFound,
    
    #[error("Invalid operation.")]
    InvalidOperation,
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Proposal {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub proposer: String, 
    pub votes_for: u32,
    pub votes_against: u32,
}


pub struct GovernanceDAO {
    pub proposals: Vec<Proposal>,
    proposal_counter: u64,
}

impl GovernanceDAO {
    
    pub fn new() -> Self {
        Self {
            proposals: Vec::new(),
            proposal_counter: 0,
        }
    }

   
    pub fn submit_proposal(
        &mut self,
        user: &UserIdentity,
        title: String,
        description: String,
    ) -> Result<(), GovernanceError> {
        if matches!(user.role, Role::Tutor | Role::Admin) {
            self.proposal_counter += 1;
            let proposal = Proposal {
                id: self.proposal_counter,
                title,
                description,
                proposer: user.address.clone(),
                votes_for: 0,
                votes_against: 0,
            };
            self.proposals.push(proposal);
            Ok(())
        } else {
            Err(GovernanceError::Unauthorized)
        }
    }

    
    pub fn vote_on_proposal(
        &mut self,
        user: &UserIdentity,
        proposal_id: u64,
        support: bool, 
    ) -> Result<(), GovernanceError> {
        if matches!(user.role, Role::Student | Role::Tutor) {
            let proposal = self.proposals
                .iter_mut()
                .find(|p| p.id == proposal_id)
                .ok_or(GovernanceError::ProposalNotFound)?;

            if support {
                proposal.votes_for += 1;
            } else {
                proposal.votes_against += 1;
            }
            Ok(())
        } else {
            Err(GovernanceError::Unauthorized)
        }
    }

    
    pub fn list_proposals(&self) -> &Vec<Proposal> {
        &self.proposals
    }
}
