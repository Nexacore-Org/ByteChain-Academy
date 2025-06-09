#![cfg_attr(not(feature = "std"), no_std)]

#[allow(unexpected_cfgs)]
#[ink::contract]
mod certificate {
    use ink::storage::traits::StorageLayout;
    use ink::storage::Mapping;
    use ink_prelude::{string::String, vec::Vec};
    use scale::{Decode, Encode};
    use scale_info::TypeInfo;

    /// Represents a digital certificate issued to a student
    #[derive(Encode, Decode, Clone, Debug, PartialEq, Eq, TypeInfo)]
    #[cfg_attr(feature = "std", derive(StorageLayout))]
    pub struct Certificate {
        /// Student's account address
        pub student_address: AccountId,
        /// Course identifier
        pub course_id: String,
        /// Timestamp when certificate was issued
        pub issued_at: u64,
        /// Hash of course completion proof
        pub completion_proof_hash: [u8; 32],
        /// Name of the course
        pub course_name: String,
        /// Issuer's account address
        pub issuer: AccountId,
    }

    /// Certificate-related errors
    #[derive(Encode, Decode, Clone, Debug, PartialEq, Eq, TypeInfo)]
    pub enum CertificateError {
        /// Only admins can perform this action
        Unauthorized,
        /// Certificate already exists for this student/course combination
        CertificateAlreadyExists,
        /// Certificate not found
        CertificateNotFound,
        /// Invalid course ID (empty string)
        InvalidCourseId,
        /// Invalid course name (empty string)
        InvalidCourseName,
    }

    /// Events emitted by the contract
    #[ink(event)]
    #[allow(clippy::cast_possible_truncation)]
    pub struct CertificateIssued {
        #[ink(topic)]
        pub student: AccountId,
        #[ink(topic)]
        pub course_id: String,
        pub certificate_id: u64,
        pub issued_at: u64,
    }

    #[ink(event)]
    #[allow(clippy::cast_possible_truncation)]
    pub struct AdminAdded {
        #[ink(topic)]
        pub admin: AccountId,
        pub added_by: AccountId,
    }

    #[ink(event)]
    #[allow(clippy::cast_possible_truncation)]
    pub struct AdminRemoved {
        #[ink(topic)]
        pub admin: AccountId,
        pub removed_by: AccountId,
    }

    #[ink(storage)]
    pub struct CertificateContract {
        /// Mapping from certificate ID to Certificate
        certificates: Mapping<u64, Certificate>,
        /// Mapping from (student_address, course_id) to certificate_id to prevent duplicates
        student_course_certificates: Mapping<(AccountId, String), u64>,
        /// Mapping from student address to list of their certificate IDs
        student_certificates: Mapping<AccountId, Vec<u64>>,
        /// Mapping to track admin addresses
        admins: Mapping<AccountId, bool>,
        /// Counter for generating unique certificate IDs
        next_certificate_id: u64,
        /// Contract owner (first admin)
        owner: AccountId,
    }

    impl Default for CertificateContract {
        fn default() -> Self {
            Self::new()
        }
    }

    impl CertificateContract {
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();
            let mut admins = Mapping::default();
            admins.insert(caller, &true);

            Self {
                certificates: Mapping::default(),
                student_course_certificates: Mapping::default(),
                student_certificates: Mapping::default(),
                admins,
                next_certificate_id: 1,
                owner: caller,
            }
        }

        /// Issues a new certificate to a student for completing a course
        /// Only admins can call this function
        #[ink(message)]
        pub fn issue_certificate(
            &mut self,
            student_address: AccountId,
            course_id: String,
            course_name: String,
            completion_proof_hash: [u8; 32],
        ) -> Result<u64, CertificateError> {
            // Check if caller is admin
            let caller = self.env().caller();
            if !self.admins.get(caller).unwrap_or(false) {
                return Err(CertificateError::Unauthorized);
            }

            // Validate inputs
            if course_id.is_empty() {
                return Err(CertificateError::InvalidCourseId);
            }
            if course_name.is_empty() {
                return Err(CertificateError::InvalidCourseName);
            }

            // Check if certificate already exists for this student/course combination
            let student_course_key = (student_address, course_id.clone());
            if self
                .student_course_certificates
                .get(&student_course_key)
                .is_some()
            {
                return Err(CertificateError::CertificateAlreadyExists);
            }

            // Create new certificate
            let certificate_id = self.next_certificate_id;
            let issued_at = self.env().block_timestamp();

            let certificate = Certificate {
                student_address,
                course_id: course_id.clone(),
                issued_at,
                completion_proof_hash,
                course_name,
                issuer: caller,
            };

            // Store certificate
            self.certificates.insert(certificate_id, &certificate);
            self.student_course_certificates
                .insert(&student_course_key, &certificate_id);

            // Update student's certificate list
            let mut student_certs = self
                .student_certificates
                .get(student_address)
                .unwrap_or_default();
            student_certs.push(certificate_id);
            self.student_certificates
                .insert(student_address, &student_certs);

            // Increment counter
            self.next_certificate_id = self.next_certificate_id.saturating_add(1);

            // Emit event
            self.env().emit_event(CertificateIssued {
                student: student_address,
                course_id,
                certificate_id,
                issued_at,
            });

            Ok(certificate_id)
        }

        /// Verifies certificate ownership and returns certificate metadata
        #[ink(message)]
        pub fn verify_certificate(&self, certificate_id: u64) -> Option<Certificate> {
            self.certificates.get(certificate_id)
        }

        /// Checks if a student has a certificate for a specific course
        #[ink(message)]
        pub fn has_certificate(&self, student_address: AccountId, course_id: String) -> bool {
            let student_course_key = (student_address, course_id);
            self.student_course_certificates
                .get(&student_course_key)
                .is_some()
        }

        /// Gets all certificates for a specific student
        #[ink(message)]
        pub fn get_student_certificates(&self, student_address: AccountId) -> Vec<Certificate> {
            let certificate_ids = self
                .student_certificates
                .get(student_address)
                .unwrap_or_default();
            let mut certificates = Vec::new();

            for &cert_id in certificate_ids.iter() {
                if let Some(cert) = self.certificates.get(cert_id) {
                    certificates.push(cert);
                }
            }

            certificates
        }

        /// Gets the certificate ID for a student/course combination
        #[ink(message)]
        pub fn get_certificate_id(
            &self,
            student_address: AccountId,
            course_id: String,
        ) -> Option<u64> {
            let student_course_key = (student_address, course_id);
            self.student_course_certificates.get(&student_course_key)
        }

        /// Adds a new admin (only owner can do this)
        #[ink(message)]
        pub fn add_admin(&mut self, new_admin: AccountId) -> Result<(), CertificateError> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(CertificateError::Unauthorized);
            }

            self.admins.insert(new_admin, &true);

            self.env().emit_event(AdminAdded {
                admin: new_admin,
                added_by: caller,
            });

            Ok(())
        }

        /// Removes an admin (only owner can do this)
        #[ink(message)]
        pub fn remove_admin(&mut self, admin: AccountId) -> Result<(), CertificateError> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(CertificateError::Unauthorized);
            }

            // Owner cannot remove themselves
            if admin == self.owner {
                return Err(CertificateError::Unauthorized);
            }

            self.admins.remove(admin);

            self.env().emit_event(AdminRemoved {
                admin,
                removed_by: caller,
            });

            Ok(())
        }

        /// Checks if an account is an admin
        #[ink(message)]
        pub fn is_admin(&self, account: AccountId) -> bool {
            self.admins.get(account).unwrap_or(false)
        }

        /// Gets the contract owner
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }

        /// Gets the total number of certificates issued
        #[ink(message)]
        pub fn get_total_certificates(&self) -> u64 {
            self.next_certificate_id.saturating_sub(1)
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test;

        fn default_accounts() -> test::DefaultAccounts<ink::env::DefaultEnvironment> {
            test::default_accounts::<ink::env::DefaultEnvironment>()
        }

        fn set_next_caller(caller: AccountId) {
            test::set_caller::<ink::env::DefaultEnvironment>(caller);
        }

        #[ink::test]
        fn new_works() {
            let accounts = default_accounts();
            set_next_caller(accounts.alice);

            let contract = CertificateContract::new();
            assert_eq!(contract.get_owner(), accounts.alice);
            assert!(contract.is_admin(accounts.alice));
            assert_eq!(contract.get_total_certificates(), 0);
        }

        #[ink::test]
        fn issue_certificate_works() {
            let accounts = default_accounts();
            set_next_caller(accounts.alice);

            let mut contract = CertificateContract::new();

            let result = contract.issue_certificate(
                accounts.bob,
                "RUST101".to_string(),
                "Introduction to Rust".to_string(),
                [1u8; 32],
            );

            assert!(result.is_ok());
            let cert_id = result.unwrap();
            assert_eq!(cert_id, 1);

            // Verify certificate was created
            let cert = contract.verify_certificate(cert_id);
            assert!(cert.is_some());
            let cert = cert.unwrap();
            assert_eq!(cert.student_address, accounts.bob);
            assert_eq!(cert.course_id, "RUST101");
            assert_eq!(cert.course_name, "Introduction to Rust");
            assert_eq!(cert.issuer, accounts.alice);
        }

        #[ink::test]
        fn issue_certificate_unauthorized() {
            let accounts = default_accounts();
            set_next_caller(accounts.alice);

            let mut contract = CertificateContract::new();

            // Switch to Bob (not an admin)
            set_next_caller(accounts.bob);

            let result = contract.issue_certificate(
                accounts.charlie,
                "RUST101".to_string(),
                "Introduction to Rust".to_string(),
                [1u8; 32],
            );

            assert_eq!(result, Err(CertificateError::Unauthorized));
        }

        #[ink::test]
        fn prevent_duplicate_certificates() {
            let accounts = default_accounts();
            set_next_caller(accounts.alice);

            let mut contract = CertificateContract::new();

            // Issue first certificate
            let result1 = contract.issue_certificate(
                accounts.bob,
                "RUST101".to_string(),
                "Introduction to Rust".to_string(),
                [1u8; 32],
            );
            assert!(result1.is_ok());

            // Try to issue duplicate certificate
            let result2 = contract.issue_certificate(
                accounts.bob,
                "RUST101".to_string(),
                "Introduction to Rust".to_string(),
                [2u8; 32],
            );
            assert_eq!(result2, Err(CertificateError::CertificateAlreadyExists));
        }

        #[ink::test]
        fn has_certificate_works() {
            let accounts = default_accounts();
            set_next_caller(accounts.alice);

            let mut contract = CertificateContract::new();

            // Initially no certificate
            assert!(!contract.has_certificate(accounts.bob, "RUST101".to_string()));

            // Issue certificate
            contract
                .issue_certificate(
                    accounts.bob,
                    "RUST101".to_string(),
                    "Introduction to Rust".to_string(),
                    [1u8; 32],
                )
                .unwrap();

            // Now has certificate
            assert!(contract.has_certificate(accounts.bob, "RUST101".to_string()));
            assert!(!contract.has_certificate(accounts.bob, "RUST102".to_string()));
        }

        #[ink::test]
        fn get_student_certificates_works() {
            let accounts = default_accounts();
            set_next_caller(accounts.alice);

            let mut contract = CertificateContract::new();

            // Issue multiple certificates for Bob
            contract
                .issue_certificate(
                    accounts.bob,
                    "RUST101".to_string(),
                    "Introduction to Rust".to_string(),
                    [1u8; 32],
                )
                .unwrap();

            contract
                .issue_certificate(
                    accounts.bob,
                    "RUST102".to_string(),
                    "Advanced Rust".to_string(),
                    [2u8; 32],
                )
                .unwrap();

            let certificates = contract.get_student_certificates(accounts.bob);
            assert_eq!(certificates.len(), 2);

            // Check that Charlie has no certificates
            let charlie_certs = contract.get_student_certificates(accounts.charlie);
            assert_eq!(charlie_certs.len(), 0);
        }

        #[ink::test]
        fn admin_management_works() {
            let accounts = default_accounts();
            set_next_caller(accounts.alice);

            let mut contract = CertificateContract::new();

            // Bob is not initially an admin
            assert!(!contract.is_admin(accounts.bob));

            // Add Bob as admin
            let result = contract.add_admin(accounts.bob);
            assert!(result.is_ok());
            assert!(contract.is_admin(accounts.bob));

            // Remove Bob as admin
            let result = contract.remove_admin(accounts.bob);
            assert!(result.is_ok());
            assert!(!contract.is_admin(accounts.bob));
        }

        #[ink::test]
        fn admin_management_unauthorized() {
            let accounts = default_accounts();
            set_next_caller(accounts.alice);

            let mut contract = CertificateContract::new();

            // Switch to Bob (not owner)
            set_next_caller(accounts.bob);

            // Bob cannot add admin
            let result = contract.add_admin(accounts.charlie);
            assert_eq!(result, Err(CertificateError::Unauthorized));

            // Bob cannot remove admin
            let result = contract.remove_admin(accounts.alice);
            assert_eq!(result, Err(CertificateError::Unauthorized));
        }

        #[ink::test]
        fn invalid_inputs_rejected() {
            let accounts = default_accounts();
            set_next_caller(accounts.alice);

            let mut contract = CertificateContract::new();

            // Empty course ID
            let result = contract.issue_certificate(
                accounts.bob,
                "".to_string(),
                "Some Course".to_string(),
                [1u8; 32],
            );
            assert_eq!(result, Err(CertificateError::InvalidCourseId));

            // Empty course name
            let result = contract.issue_certificate(
                accounts.bob,
                "COURSE101".to_string(),
                "".to_string(),
                [1u8; 32],
            );
            assert_eq!(result, Err(CertificateError::InvalidCourseName));
        }
    }
}
