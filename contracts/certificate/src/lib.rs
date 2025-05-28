use serde::{Deserialize, Serialize};

/// Represents a digital certificate issued to a student for completing a course.
/// 
/// # Fields
/// * `id` - Unique identifier for the certificate
/// * `student_id` - Identifier of the student who earned the certificate
/// * `course_id` - Identifier of the completed course
/// * `issue_date` - Unix timestamp when the certificate was issued
/// * `issuer` - Entity that issued the certificate
/// * `signature` - Digital signature to verify certificate authenticity
#[derive(Serialize, Deserialize)]
pub struct Certificate {
    pub id: String,
    pub student_id: String,
    pub course_id: String,
    pub issue_date: u64,
    pub issuer: String,
    pub signature: String,
}

/// Contract for managing digital certificates on the blockchain.
/// 
/// This contract handles the creation, storage, and verification of educational certificates.
#[derive(Serialize, Deserialize)]
pub struct CertificateContract {
    /// Collection of all certificates issued through this contract
    certificates: Vec<Certificate>,
}

impl CertificateContract {
    /// Creates a new instance of the CertificateContract.
    /// 
    /// # Returns
    /// * A new empty CertificateContract
    pub fn new() -> Self {
        CertificateContract {
            certificates: Vec::new(),
        }
    }

    /// Issues a new certificate with the provided details.
    /// 
    /// # Arguments
    /// * `id` - Unique identifier for the new certificate
    /// * `student_id` - Identifier of the student receiving the certificate
    /// * `course_id` - Identifier of the completed course
    /// * `issue_date` - Unix timestamp when the certificate is being issued
    /// * `issuer` - Entity issuing the certificate
    /// * `signature` - Digital signature for certificate verification
    /// 
    /// # Returns
    /// * `Ok(())` if the certificate was successfully created and stored
    /// * `Err(String)` if there was an error during certificate creation
    pub fn mint_certificate(
        &mut self,
        id: String,
        student_id: String,
        course_id: String,
        issue_date: u64,
        issuer: String,
        signature: String,
    ) -> Result<(), String> {
        let certificate = Certificate {
            id,
            student_id,
            course_id,
            issue_date,
            issuer,
            signature,
        };

        self.certificates.push(certificate);
        Ok(())
    }

    /// Verifies and retrieves a certificate by its ID.
    /// 
    /// # Arguments
    /// * `certificate_id` - The unique identifier of the certificate to verify
    /// 
    /// # Returns
    /// * `Some(&Certificate)` if a certificate with the given ID exists
    /// * `None` if no certificate was found with the given ID
    pub fn verify_certificate(&self, certificate_id: &str) -> Option<&Certificate> {
        self.certificates.iter().find(|c| c.id == certificate_id)
    }
}

#[cfg(test)]
/// Unit tests for the CertificateContract implementation
mod tests {
    use super::*;

    #[test]
    fn test_mint_certificate() {
        let mut contract = CertificateContract::new();
        let result = contract.mint_certificate(
            "cert123".to_string(),
            "student123".to_string(),
            "course123".to_string(),
            1234567890,
            "issuer123".to_string(),
            "sig123".to_string(),
        );
        assert!(result.is_ok());
    }

    #[test]
    fn test_verify_certificate() {
        let mut contract = CertificateContract::new();
        contract.mint_certificate(
            "cert123".to_string(),
            "student123".to_string(),
            "course123".to_string(),
            1234567890,
            "issuer123".to_string(),
            "sig123".to_string(),
        ).unwrap();

        let certificate = contract.verify_certificate("cert123");
        assert!(certificate.is_some());
        let certificate = certificate.unwrap();
        assert_eq!(certificate.student_id, "student123");
        assert_eq!(certificate.course_id, "course123");
    }
}