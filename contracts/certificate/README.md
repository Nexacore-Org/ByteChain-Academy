# Certificate Smart Contract

A secure and immutable ink! smart contract for issuing verifiable educational
certificates on Polkadot/Substrate-based blockchains.

## Features

### 🔐 Security & Authorization

- **Admin-only issuance**: Only authorized administrators can issue certificates
- **Owner controls**: Contract owner can add/remove admins
- **Immutable records**: Certificates cannot be modified once issued

### 📜 Certificate Management

- **Unique certificates**: Prevents duplicate certificates for same
  student/course
- **Comprehensive metadata**: Stores student address, course details,
  timestamps, and completion proofs
- **Verification system**: Public functions to verify certificate ownership and
  authenticity

### 🎯 Key Functions

#### Admin Functions

- `issue_certificate()` - Issue new certificates to students
- `add_admin()` - Add new administrators (owner only)
- `remove_admin()` - Remove administrators (owner only)

#### Public Query Functions

- `verify_certificate()` - Get certificate details by ID
- `has_certificate()` - Check if student has certificate for specific course
- `get_student_certificates()` - Get all certificates for a student
- `get_certificate_id()` - Get certificate ID for student/course combination
- `is_admin()` - Check if account is an admin
- `get_owner()` - Get contract owner address
- `get_total_certificates()` - Get total number of certificates issued

## Data Structures

### Certificate

```rust
pub struct Certificate {
    pub student_address: AccountId,    // Student's wallet address
    pub course_id: String,             // Unique course identifier
    pub issued_at: u64,                // Timestamp of issuance
    pub completion_proof_hash: [u8; 32], // Hash of completion proof
    pub course_name: String,           // Human-readable course name
    pub issuer: AccountId,             // Admin who issued the certificate
}
```

### Events

- `CertificateIssued` - Emitted when a certificate is issued
- `AdminAdded` - Emitted when a new admin is added
- `AdminRemoved` - Emitted when an admin is removed

## Usage Examples

### Deploying the Contract

```rust
// Constructor creates the contract with the deployer as the first admin
let contract = CertificateContract::new();
```

### Issuing a Certificate

```rust
// Only admins can issue certificates
let result = contract.issue_certificate(
    student_account_id,
    "RUST101".to_string(),
    "Introduction to Rust Programming".to_string(),
    completion_proof_hash, // [u8; 32] hash of completion proof
);
```

### Verifying a Certificate

```rust
// Anyone can verify a certificate by ID
let certificate = contract.verify_certificate(certificate_id);
if let Some(cert) = certificate {
    println!("Student: {:?}", cert.student_address);
    println!("Course: {}", cert.course_name);
    println!("Issued: {}", cert.issued_at);
}
```

### Checking Student Certificates

```rust
// Check if student has completed a specific course
let has_cert = contract.has_certificate(student_address, "RUST101".to_string());

// Get all certificates for a student
let all_certs = contract.get_student_certificates(student_address);
```

## Error Handling

The contract includes comprehensive error handling:

```rust
pub enum CertificateError {
    Unauthorized,                    // Caller lacks required permissions
    CertificateAlreadyExists,       // Duplicate certificate attempted
    CertificateNotFound,            // Certificate ID doesn't exist
    InvalidCourseId,                // Empty course ID provided
    InvalidCourseName,              // Empty course name provided
}
```

## Testing

The contract includes comprehensive unit tests covering:

- ✅ Certificate issuance by authorized admins
- ✅ Authorization checks (prevents unauthorized access)
- ✅ Duplicate prevention (same student + course)
- ✅ Certificate verification and ownership
- ✅ Admin management (add/remove)
- ✅ Input validation
- ✅ Event emission

### Running Tests

```bash
cd contracts/certificate
cargo test
```

### Test Coverage

- `new_works` - Contract initialization
- `issue_certificate_works` - Successful certificate issuance
- `issue_certificate_unauthorized` - Authorization enforcement
- `prevent_duplicate_certificates` - Duplicate prevention
- `has_certificate_works` - Certificate existence checks
- `get_student_certificates_works` - Student certificate retrieval
- `admin_management_works` - Admin add/remove functionality
- `admin_management_unauthorized` - Admin permission checks
- `invalid_inputs_rejected` - Input validation

## Security Considerations

1. **Admin Authorization**: Only contract owner can manage admins
2. **Immutable Records**: Certificates cannot be modified after issuance
3. **Duplicate Prevention**: Smart prevention of duplicate certificates
4. **Input Validation**: Proper validation of all inputs
5. **Event Emission**: All critical actions emit events for transparency

## Deployment

### Prerequisites

- Rust with ink! toolchain
- cargo-contract tool
- Access to a Substrate-based chain with contracts pallet

### Build Commands

```bash
# Check compilation
cargo check

# Run tests
cargo test

# Build for deployment (requires cargo-contract)
cargo contract build

# Generate metadata
cargo contract build --release
```

### Compatible Chains

- Polkadot parachains with contracts pallet
- Substrate-based development chains
- Canvas Network (testnet)
- Astar Network
- Any chain supporting ink! smart contracts

## Gas Optimization

The contract is optimized for minimal gas usage:

- Efficient storage mappings
- Minimal redundant data
- Optimized query functions
- Event-based tracking

## Integration

### Frontend Integration

The contract exposes standard ink! interfaces that can be integrated with:

- Polkadot.js apps
- Custom React/Vue.js applications using @polkadot/api
- Mobile applications using polkadot-js

### Example Integration (JavaScript)

```javascript
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { ContractPromise } = require("@polkadot/api-contract");

// Connect to node
const wsProvider = new WsProvider("ws://localhost:9944");
const api = await ApiPromise.create({ provider: wsProvider });

// Load contract
const contract = new ContractPromise(api, abi, contractAddress);

// Verify certificate
const { result } = await contract.query.verifyCertificate(
    caller,
    { gasLimit: -1 },
    certificateId,
);
```
