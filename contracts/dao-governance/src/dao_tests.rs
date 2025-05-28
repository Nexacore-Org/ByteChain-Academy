#[cfg(test)]
mod tests {
    use super::*;
    use ink_lang as ink;

    #[ink::test]
    fn create_and_vote_proposal_works() {
        let mut contract = dao_governance::DaoGovernance::new();
        let id = contract.create_proposal("Learn Rust and Substrate".into(), 60);

        assert_eq!(contract.get_proposal(id).unwrap().content, "Learn Rust and Substrate");

        let vote_result = contract.vote(id, true);
        assert!(vote_result.is_ok());

        // Attempting to vote again should fail
        let second_vote = contract.vote(id, false);
        assert!(second_vote.is_err());
    }

    #[ink::test]
    fn finalize_proposal_works() {
        let mut contract = dao_governance::DaoGovernance::new();
        let id = contract.create_proposal("Add Advanced Smart Contract Course".into(), 0);
        contract.vote(id, true).unwrap();

        // Simulate passing time (manually finalize immediately since voting_duration = 0)
        let finalize_result = contract.finalize_proposal(id);
        assert_eq!(finalize_result.unwrap(), dao_governance::ProposalStatus::Approved);
    }

    #[ink::test]
    fn reject_proposal_if_more_no_votes() {
        let mut contract = dao_governance::DaoGovernance::new();
        let id = contract.create_proposal("Add Flawed Course".into(), 0);

        contract.vote(id, false).unwrap();
        let result = contract.finalize_proposal(id);
        assert_eq!(result.unwrap(), dao_governance::ProposalStatus::Rejected);
    }
}
