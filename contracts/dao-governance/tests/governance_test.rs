#[cfg(test)]
pub mod tests {
    use super::*;

    fn create_user(address: &str, role: Role) -> UserIdentity {
        UserIdentity {
            address: address.to_string(),
            role,
        }
    }

    #[test]
    fn admin_can_set_role() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let tutor = create_user("0xTUTOR", Role::Tutor);

        let result = dao.set_role(&admin, tutor.clone());
        assert!(result.is_ok());
        assert_eq!(dao.user_roles.get("0xTUTOR"), Some(&Role::Tutor));
    }

    #[test]
    fn non_admin_cannot_set_role() {
        let mut dao = GovernanceDAO::new(2);
        let tutor = create_user("0xTUTOR", Role::Tutor);
        let student = create_user("0xSTUDENT", Role::Student);

        let result = dao.set_role(&tutor, student);
        assert_eq!(result, Err(GovernanceError::Unauthorized));
    }

    #[test]
    fn tutor_can_submit_proposal() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let tutor = create_user("0xTUTOR", Role::Tutor);
        dao.set_role(&admin, tutor.clone()).unwrap();

        let result = dao.submit_proposal(&tutor, "Proposal Title".to_string(), "Description".to_string(), 1000, 500);
        assert!(result.is_ok());
        assert_eq!(dao.proposals.len(), 1);
        assert_eq!(dao.proposals[0].proposer, "0xTUTOR");
        assert_eq!(dao.proposals[0].status, ProposalStatus::Active);
    }

    #[test]
    fn student_cannot_submit_proposal() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let student = create_user("0xSTUDENT", Role::Student);
        dao.set_role(&admin, student.clone()).unwrap();

        let result = dao.submit_proposal(&student, "Proposal Title".to_string(), "Description".to_string(), 1000, 500);
        assert_eq!(result, Err(GovernanceError::Unauthorized));
    }

    #[test]
    fn invalid_end_time_fails() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let tutor = create_user("0xTUTOR", Role::Tutor);
        dao.set_role(&admin, tutor.clone()).unwrap();

        let result = dao.submit_proposal(&tutor, "Proposal Title".to_string(), "Description".to_string(), 400, 500);
        assert_eq!(result, Err(GovernanceError::InvalidEndTime));
    }

    #[test]
    fn student_can_vote() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let tutor = create_user("0xTUTOR", Role::Tutor);
        let student = create_user("0xSTUDENT", Role::Student);
        dao.set_role(&admin, tutor.clone()).unwrap();
        dao.set_role(&admin, student.clone()).unwrap();

        dao.submit_proposal(&tutor, "Proposal Title".to_string(), "Description".to_string(), 1000, 500).unwrap();
        let result = dao.vote_on_proposal(&student, 1, true, 500);
        assert!(result.is_ok());
        assert_eq!(dao.proposals[0].votes_for, 1);
    }

    #[test]
    fn admin_cannot_vote() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let tutor = create_user("0xTUTOR", Role::Tutor);
        dao.set_role(&admin, tutor.clone()).unwrap();

        dao.submit_proposal(&tutor, "Proposal Title".to_string(), "Description".to_string(), 1000, 500).unwrap();
        let result = dao.vote_on_proposal(&admin, 1, true, 500);
        assert_eq!(result, Err(GovernanceError::Unauthorized));
    }

    #[test]
    fn double_voting_fails() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let tutor = create_user("0xTUTOR", Role::Tutor);
        dao.set_role(&admin, tutor.clone()).unwrap();

        dao.submit_proposal(&tutor, "Proposal Title".to_string(), "Description".to_string(), 1000, 500).unwrap();
        dao.vote_on_proposal(&tutor, 1, true, 500).unwrap();
        let result = dao.vote_on_proposal(&tutor, 1, false, 500);
        assert_eq!(result, Err(GovernanceError::AlreadyVoted));
    }

    #[test]
    fn vote_on_expired_proposal_fails() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let tutor = create_user("0xTUTOR", Role::Tutor);
        dao.set_role(&admin, tutor.clone()).unwrap();

        dao.submit_proposal(&tutor, "Proposal Title".to_string(), "Description".to_string(), 1000, 500).unwrap();
        let result = dao.vote_on_proposal(&tutor, 1, true, 1500);
        assert_eq!(result, Err(GovernanceError::VotingExpired));
    }

    #[test]
    fn finalize_proposal_accepted() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let tutor = create_user("0xTUTOR", Role::Tutor);
        let student = create_user("0xSTUDENT", Role::Student);
        dao.set_role(&admin, tutor.clone()).unwrap();
        dao.set_role(&admin, student.clone()).unwrap();

        dao.submit_proposal(&tutor, "Proposal Title".to_string(), "Description".to_string(), 1000, 500).unwrap();
        dao.vote_on_proposal(&tutor, 1, true, 500).unwrap();
        dao.vote_on_proposal(&student, 1, true, 500).unwrap();
        let result = dao.finalize_proposal(1, 1500);
        assert!(result.is_ok());
        assert_eq!(dao.proposals[0].status, ProposalStatus::Accepted);
    }

    #[test]
    fn finalize_proposal_rejected() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let tutor = create_user("0xTUTOR", Role::Tutor);
        let student = create_user("0xSTUDENT", Role::Student);
        dao.set_role(&admin, tutor.clone()).unwrap();
        dao.set_role(&admin, student.clone()).unwrap();

        dao.submit_proposal(&tutor, "Proposal Title".to_string(), "Description".to_string(), 1000, 500).unwrap();
        dao.vote_on_proposal(&tutor, 1, false, 500).unwrap();
        dao.vote_on_proposal(&student, 1, false, 500).unwrap();
        let result = dao.finalize_proposal(1, 1500);
        assert!(result.is_ok());
        assert_eq!(dao.proposals[0].status, ProposalStatus::Rejected);
    }

    #[test]
    fn finalize_before_end_time_fails() {
        let mut dao = GovernanceDAO::new(2);
        let admin = create_user("0xADMIN", Role::Admin);
        let tutor = create_user("0xTUTOR", Role::Tutor);
        dao.set_role(&admin, tutor.clone()).unwrap();

        dao.submit_proposal(&tutor, "Proposal Title".to_string(), "Description".to_string(), 1000, 500).unwrap();
        let result = dao.finalize_proposal(1, 500);
        assert_eq!(result, Err(GovernanceError::VotingExpired));
    }
}