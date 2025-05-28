#[cfg(test)]
mod tests {
    use super::super::governance::*;
    
    fn create_tutor(address: &str) -> UserIdentity {
        UserIdentity {
            address: address.to_string(),
            role: Role::Tutor,
        }
    }

    fn create_student(address: &str) -> UserIdentity {
        UserIdentity {
            address: address.to_string(),
            role: Role::Student,
        }
    }

    fn create_admin(address: &str) -> UserIdentity {
        UserIdentity {
            address: address.to_string(),
            role: Role::Admin,
        }
    }

    #[test]
    fn tutor_can_submit_proposal() {
        let mut dao = GovernanceDAO::new();
        let tutor = create_tutor("0xTUTOR");

        let result = dao.submit_proposal(
            &tutor,
            "Proposal Title".to_string(),
            "Proposal Description".to_string(),
        );

        assert!(result.is_ok());
        assert_eq!(dao.proposals.len(), 1);
        assert_eq!(dao.proposals[0].proposer, "0xTUTOR");
    }

    #[test]
    fn admin_can_submit_proposal() {
        let mut dao = GovernanceDAO::new();
        let admin = create_admin("0xADMIN");

        let result = dao.submit_proposal(
            &admin,
            "Admin Proposal".to_string(),
            "Admin Proposal Description".to_string(),
        );

        assert!(result.is_ok());
        assert_eq!(dao.proposals.len(), 1);
        assert_eq!(dao.proposals[0].proposer, "0xADMIN");
    }

    #[test]
    fn student_cannot_submit_proposal() {
        let mut dao = GovernanceDAO::new();
        let student = create_student("0xSTUDENT");

        let result = dao.submit_proposal(
            &student,
            "Student Proposal".to_string(),
            "Student Proposal Description".to_string(),
        );

        assert!(result.is_err());
        assert_eq!(dao.proposals.len(), 0);
    }

    #[test]
    fn student_can_vote_on_proposal() {
        let mut dao = GovernanceDAO::new();
        let tutor = create_tutor("0xTUTOR");
        let student = create_student("0xSTUDENT");

        dao.submit_proposal(
            &tutor,
            "Voting Proposal".to_string(),
            "Some description".to_string(),
        )
        .unwrap();

        let result = dao.vote_on_proposal(&student, 1, true);

        assert!(result.is_ok());
        assert_eq!(dao.proposals[0].votes_for, 1);
        assert_eq!(dao.proposals[0].votes_against, 0);
    }

    #[test]
    fn tutor_can_vote_on_proposal() {
        let mut dao = GovernanceDAO::new();
        let tutor = create_tutor("0xTUTOR");

        dao.submit_proposal(
            &tutor,
            "Proposal to Vote".to_string(),
            "Description".to_string(),
        )
        .unwrap();

        let another_tutor = create_tutor("0xTUTOR2");

        let result = dao.vote_on_proposal(&another_tutor, 1, false);

        assert!(result.is_ok());
        assert_eq!(dao.proposals[0].votes_for, 0);
        assert_eq!(dao.proposals[0].votes_against, 1);
    }

    #[test]
    fn admin_cannot_vote_on_proposal() {
        let mut dao = GovernanceDAO::new();
        let tutor = create_tutor("0xTUTOR");
        let admin = create_admin("0xADMIN");

        dao.submit_proposal(
            &tutor,
            "Admin Voting Attempt".to_string(),
            "Description".to_string(),
        )
        .unwrap();

        let result = dao.vote_on_proposal(&admin, 1, true);

        assert!(result.is_err());
        assert_eq!(dao.proposals[0].votes_for, 0);
        assert_eq!(dao.proposals[0].votes_against, 0);
    }

    #[test]
    fn cannot_vote_on_nonexistent_proposal() {
        let mut dao = GovernanceDAO::new();
        let student = create_student("0xSTUDENT");

        let result = dao.vote_on_proposal(&student, 99, true); // Nonexistent ID

        assert!(matches!(result, Err(GovernanceError::ProposalNotFound)));
    }
}
