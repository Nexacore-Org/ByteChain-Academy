#[cfg(test)]
pub mod dao_tests {
    use super::dao_governance::*;
    use ink::env::test::*;

    fn set_up_contract() -> DaoGovernance {
        let accounts = default_accounts();
        set_caller::<DefaultEnvironment>(accounts.alice);
        let mut contract = DaoGovernance::new(2);
        contract.set_role(accounts.alice, Role::Admin).unwrap();
        contract.set_role(accounts.bob, Role::Tutor).unwrap();
        contract.set_role(accounts.charlie, Role::Student).unwrap();
        contract
    }

    #[ink::test]
    fn create_proposal_works() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);

        let result = contract.create_proposal(
            "Test Proposal".into(),
            "Test Description".into(),
            200,
        );
        assert!(result.is_ok());
        let proposal = contract.get_proposal(0).unwrap();
        assert_eq!(proposal.title, "Test Proposal");
        assert_eq!(proposal.description, "Test Description");
        assert_eq!(proposal.proposer, default_accounts().alice);
        assert_eq!(proposal.status, ProposalStatus::Active);
        assert_eq!(proposal.end_block, 200);
    }

    #[ink::test]
    fn create_proposal_unauthorized() {
        let mut contract = set_up_contract();
        set_caller::<DefaultEnvironment>(default_accounts().charlie); // Student
        let result = contract.create_proposal(
            "Test Proposal".into(),
            "Test Description".into(),
            200,
        );
        assert_eq!(result, Err(GovernanceError::Unauthorized));
    }

    #[ink::test]
    fn create_proposal_invalid_end_block() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);
        let result = contract.create_proposal(
            "Test Proposal".into(),
            "Test Description".into(),
            50,
        );
        assert_eq!(result, Err(GovernanceError::InvalidEndBlock));
    }

    #[ink::test]
    fn vote_works() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);
        contract.create_proposal("Test Proposal".into(), "Test Description".into(), 200).unwrap();

        set_caller::<DefaultEnvironment>(default_accounts().charlie); // Student
        let result = contract.vote(0, true);
        assert!(result.is_ok());
        let proposal = contract.get_proposal(0).unwrap();
        assert_eq!(proposal.yes_votes, 1);
        assert_eq!(proposal.no_votes, 0);
    }

    #[ink::test]
    fn vote_unauthorized() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);
        contract.create_proposal("Test Proposal".into(), "Test Description".into(), 200).unwrap();

        set_caller::<DefaultEnvironment>(default_accounts().alice); // Admin
        let result = contract.vote(0, true);
        assert_eq!(result, Err(GovernanceError::Unauthorized));
    }

    #[ink::test]
    fn vote_double_voting() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);
        contract.create_proposal("Test Proposal".into(), "Test Description".into(), 200).unwrap();

        set_caller::<DefaultEnvironment>(default_accounts().charlie);
        contract.vote(0, true).unwrap();
        let result = contract.vote(0, false);
        assert_eq!(result, Err(GovernanceError::AlreadyVoted));
    }

    #[ink::test]
    fn vote_expired() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);
        contract.create_proposal("Test Proposal".into(), "Test Description".into(), 150).unwrap();

        set_block_number::<DefaultEnvironment>(200);
        set_caller::<DefaultEnvironment>(default_accounts().charlie);
        let result = contract.vote(0, true);
        assert_eq!(result, Err(GovernanceError::VotingExpired));
    }

    #[ink::test]
    fn vote_nonexistent_proposal() {
        let mut contract = set_up_contract();
        set_caller::<DefaultEnvironment>(default_accounts().charlie);
        let result = contract.vote(99, true);
        assert_eq!(result, Err(GovernanceError::ProposalNotFound));
    }

    #[ink::test]
    fn finalize_proposal_accepted() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);
        contract.create_proposal("Test Proposal".into(), "Test Description".into(), 200).unwrap();

        set_caller::<DefaultEnvironment>(default_accounts().bob);
        contract.vote(0, true).unwrap();
        set_caller::<DefaultEnvironment>(default_accounts().charlie);
        contract.vote(0, true).unwrap();

        set_block_number::<DefaultEnvironment>(201);
        let result = contract.finalize_proposal(0);
        assert!(result.is_ok());
        let proposal = contract.get_proposal(0).unwrap();
        assert_eq!(proposal.status, ProposalStatus::Accepted);
    }

    #[ink::test]
    fn finalize_proposal_rejected_quorum_not_met() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);
        contract.create_proposal("Test Proposal".into(), "Test Description".into(), 200).unwrap();

        set_caller::<DefaultEnvironment>(default_accounts().bob);
        contract.vote(0, true).unwrap();

        set_block_number::<DefaultEnvironment>(201);
        let result = contract.finalize_proposal(0);
        assert!(result.is_ok());
        let proposal = contract.get_proposal(0).unwrap();
        assert_eq!(proposal.status, ProposalStatus::Rejected);
    }

    #[ink::test]
    fn finalize_proposal_rejected_more_no_votes() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);
        contract.create_proposal("Test Proposal".into(), "Test Description".into(), 200).unwrap();

        set_caller::<DefaultEnvironment>(default_accounts().bob);
        contract.vote(0, false).unwrap();
        set_caller::<DefaultEnvironment>(default_accounts().charlie);
        contract.vote(0, false).unwrap();

        set_block_number::<DefaultEnvironment>(201);
        let result = contract.finalize_proposal(0);
        assert!(result.is_ok());
        let proposal = contract.get_proposal(0).unwrap();
        assert_eq!(proposal.status, ProposalStatus::Rejected);
    }

    #[ink::test]
    fn finalize_before_end_block() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);
        contract.create_proposal("Test Proposal".into(), "Test Description".into(), 200).unwrap();

        set_block_number::<DefaultEnvironment>(150);
        let result = contract.finalize_proposal(0);
        assert_eq!(result, Err(GovernanceError::VotingExpired));
    }

    #[ink::test]
    fn list_proposals() {
        let mut contract = set_up_contract();
        set_block_number::<DefaultEnvironment>(100);
        contract.create_proposal("Proposal 1".into(), "Desc 1".into(), 200).unwrap();
        contract.create_proposal("Proposal 2".into(), "Desc 2".into(), 200).unwrap();

        let proposals = contract.list_proposals();
        assert_eq!(proposals.len(), 2);
        assert_eq!(proposals[0].title, "Proposal 1");
        assert_eq!(proposals[1].title, "Proposal 2");
    }
}