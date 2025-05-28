use alephium_sdk::{prelude::*, worldcoin::*};

#[contract]
pub struct CertificationContract {
    // Contract storage
    certificates: StorageMap<Address, Certificate>,
    course_completions: StorageMap<(Address, CourseId), bool>,
}

#[derive(Encode, Decode, Clone)]
pub struct Certificate {
    student_address: Address,
    course_id: CourseId,
    completion_date: u64,
    worldcoin_proof: WorldcoinProof,
}

#[derive(Encode, Decode, Clone)]
pub struct CourseId(pub Vec<u8>);

#[derive(Encode, Decode, Clone)]
pub struct WorldcoinProof {
    nullifier_hash: [u8; 32],
    proof: Vec<u8>,
    verification_key: Vec<u8>,
}

impl CertificationContract {
    #[endpoint]
    pub fn mint_certificate(
        &mut self,
        course_id: CourseId,
        worldcoin_proof: WorldcoinProof,
    ) -> Result<(), ContractError> {
        let student_address = self.get_caller();
        
        // Verify course completion
        if !self.course_completions.get(&(student_address.clone(), course_id.clone())).unwrap_or(false) {
            return Err(ContractError::CourseNotCompleted);
        }

        // Verify Worldcoin proof
        self.verify_worldcoin_proof(&worldcoin_proof)?;

        // Create certificate
        let certificate = Certificate {
            student_address: student_address.clone(),
            course_id,
            completion_date: self.get_block_timestamp(),
            worldcoin_proof,
        };

        // Store certificate
        self.certificates.insert(student_address, certificate);

        Ok(())
    }

    #[endpoint]
    pub fn verify_certificate(
        &self,
        student_address: Address,
    ) -> Result<Option<Certificate>, ContractError> {
        Ok(self.certificates.get(&student_address))
    }

    #[endpoint]
    pub fn mark_course_completed(
        &mut self,
        student_address: Address,
        course_id: CourseId,
    ) -> Result<(), ContractError> {
        // Only contract owner can mark courses as completed
        if !self.is_contract_owner() {
            return Err(ContractError::Unauthorized);
        }

        self.course_completions.insert((student_address, course_id), true);
        Ok(())
    }

    fn verify_worldcoin_proof(&self, proof: &WorldcoinProof) -> Result<(), ContractError> {
        // Implement Worldcoin verification logic
        // This would typically involve verifying the zero-knowledge proof
        // against the Worldcoin verification key
        Ok(())
    }
}

#[derive(Debug)]
pub enum ContractError {
    CourseNotCompleted,
    Unauthorized,
    InvalidWorldcoinProof,
}