use alephium_sdk::{prelude::*, test_utils::*};
use super::*;

#[test]
fn test_mint_certificate() {
    let mut contract = CertificationContract::new();
    let student = Address::random();
    let course_id = CourseId(vec![1, 2, 3]);
    let worldcoin_proof = WorldcoinProof {
        nullifier_hash: [0u8; 32],
        proof: vec![1, 2, 3],
        verification_key: vec![4, 5, 6],
    };

    // Test minting without course completion
    let result = contract.mint_certificate(course_id.clone(), worldcoin_proof.clone());
    assert!(matches!(result, Err(ContractError::CourseNotCompleted)));

    // Mark course as completed
    contract.mark_course_completed(student.clone(), course_id.clone()).unwrap();

    // Test successful minting
    let result = contract.mint_certificate(course_id.clone(), worldcoin_proof.clone());
    assert!(result.is_ok());

    // Verify certificate exists
    let cert = contract.verify_certificate(student).unwrap().unwrap();
    assert_eq!(cert.course_id.0, course_id.0);
    assert_eq!(cert.student_address, student);
}

#[test]
fn test_verify_certificate() {
    let mut contract = CertificationContract::new();
    let student = Address::random();
    let course_id = CourseId(vec![1, 2, 3]);
    let worldcoin_proof = WorldcoinProof {
        nullifier_hash: [0u8; 32],
        proof: vec![1, 2, 3],
        verification_key: vec![4, 5, 6],
    };

    // Test non-existent certificate
    let result = contract.verify_certificate(student.clone()).unwrap();
    assert!(result.is_none());

    // Create certificate
    contract.mark_course_completed(student.clone(), course_id.clone()).unwrap();
    contract.mint_certificate(course_id.clone(), worldcoin_proof.clone()).unwrap();

    // Test existing certificate
    let cert = contract.verify_certificate(student).unwrap().unwrap();
    assert_eq!(cert.course_id.0, course_id.0);
}

#[test]
fn test_mark_course_completed() {
    let mut contract = CertificationContract::new();
    let student = Address::random();
    let course_id = CourseId(vec![1, 2, 3]);

    // Test unauthorized marking
    set_caller(Address::random());
    let result = contract.mark_course_completed(student.clone(), course_id.clone());
    assert!(matches!(result, Err(ContractError::Unauthorized)));

    // Test authorized marking
    set_contract_owner();
    let result = contract.mark_course_completed(student.clone(), course_id.clone());
    assert!(result.is_ok());
}

#[test]
fn test_worldcoin_verification() {
    let mut contract = CertificationContract::new();
    let student = Address::random();
    let course_id = CourseId(vec![1, 2, 3]);
    let worldcoin_proof = WorldcoinProof {
        nullifier_hash: [0u8; 32],
        proof: vec![1, 2, 3],
        verification_key: vec![4, 5, 6],
    };

    // Mark course as completed
    contract.mark_course_completed(student.clone(), course_id.clone()).unwrap();

    // Test minting with valid Worldcoin proof
    let result = contract.mint_certificate(course_id.clone(), worldcoin_proof);
    assert!(result.is_ok());
}