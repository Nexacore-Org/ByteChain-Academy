use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Certificate {
    pub id: String,
    pub student_id: String,
    pub course_id: String,
    pub issue_date: u64,
    pub issuer: String,
    pub signature: String,
}

#[derive(Serialize, Deserialize)]
pub struct CertificateContract {
    certificates: Vec<Certificate>,
}

impl CertificateContract {
    pub fn new() -> Self {
        CertificateContract {
            certificates: Vec::new(),
        }
    }

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

    pub fn verify_certificate(&self, certificate_id: &str) -> Option<&Certificate> {
        self.certificates.iter().find(|c| c.id == certificate_id)
    }
}

#[cfg(test)]
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