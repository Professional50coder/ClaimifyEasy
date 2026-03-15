// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MedicalInsuranceCore is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant INSURER_ROLE = keccak256("INSURER_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Enums
    enum ClaimStatus {
        PENDING,
        SUBMITTED,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        PAID
    }

    enum PolicyStatus {
        ACTIVE,
        EXPIRED,
        SUSPENDED,
        CANCELLED
    }

    // Structs
    struct User {
        address wallet;
        string role; // "hospital", "insurer", "patient"
        string name;
        bool isActive;
        uint256 registeredAt;
    }

    struct Policy {
        uint256 policyId;
        address patient;
        address insurer;
        uint256 coverageAmount;
        uint256 deductible;
        uint256 startDate;
        uint256 expiryDate;
        PolicyStatus status;
        string ipfsHash; // Policy document IPFS hash
    }

    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address patient;
        address hospital;
        address insurer;
        uint256 claimAmount;
        uint256 approvedAmount;
        ClaimStatus status;
        string[] documentIPFSHashes; // Medical bills, reports, etc.
        uint256 submittedAt;
        uint256 reviewedAt;
        string rejectionReason;
        uint256 fraudScore; // 0-100, set by oracle
        bool fraudFlagRaised;
    }

    struct Hospital {
        address walletAddress;
        string name;
        string licenseNumber;
        bool verified;
        uint256 totalClaimsProcessed;
        uint256 totalClaimsApproved;
    }

    // State Variables
    mapping(address => User) public users;
    mapping(uint256 => Policy) public policies;
    mapping(uint256 => Claim) public claims;
    mapping(address => Hospital) public hospitals;

    uint256 public policyCounter = 0;
    uint256 public claimCounter = 0;
    uint256 public totalFundsInContract = 0;

    address public oracleAddress; // Chainlink oracle for fraud detection
    IERC20 public stablecoin; // Payment token (e.g., USDC)

    // Events
    event UserRegistered(address indexed user, string role, uint256 timestamp);
    event PolicyCreated(
        uint256 indexed policyId,
        address indexed patient,
        address indexed insurer,
        uint256 coverageAmount
    );
    event ClaimSubmitted(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed patient,
        uint256 claimAmount
    );
    event ClaimApproved(uint256 indexed claimId, uint256 approvedAmount);
    event ClaimRejected(uint256 indexed claimId, string reason);
    event PaymentReleased(
        uint256 indexed claimId,
        address indexed recipient,
        uint256 amount
    );
    event DocumentUploaded(
        uint256 indexed claimId,
        string ipfsHash,
        uint256 timestamp
    );
    event FraudFlagRaised(uint256 indexed claimId, uint256 fraudScore);
    event FundsDeposited(address indexed insurer, uint256 amount);
    event FundsWithdrawn(address indexed insurer, uint256 amount);

    // Modifiers
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "Insufficient permissions");
        _;
    }

    modifier policyExists(uint256 _policyId) {
        require(
            policies[_policyId].policyId != 0,
            "Policy does not exist"
        );
        _;
    }

    modifier claimExists(uint256 _claimId) {
        require(claims[_claimId].claimId != 0, "Claim does not exist");
        _;
    }

    // Constructor
    constructor(address _stablecoin) {
        _grantRole(ADMIN_ROLE, msg.sender);
        stablecoin = IERC20(_stablecoin);
    }

    // ==================== User Registration ====================

    function registerUser(
        string memory _role,
        string memory _name
    ) external {
        require(
            keccak256(bytes(_role)) == keccak256(bytes("hospital")) ||
                keccak256(bytes(_role)) == keccak256(bytes("insurer")) ||
                keccak256(bytes(_role)) == keccak256(bytes("patient")),
            "Invalid role"
        );

        require(!users[msg.sender].isActive, "User already registered");

        users[msg.sender] = User({
            wallet: msg.sender,
            role: _role,
            name: _name,
            isActive: true,
            registeredAt: block.timestamp
        });

        if (
            keccak256(bytes(_role)) == keccak256(bytes("hospital"))
        ) {
            _grantRole(HOSPITAL_ROLE, msg.sender);
        } else if (
            keccak256(bytes(_role)) == keccak256(bytes("insurer"))
        ) {
            _grantRole(INSURER_ROLE, msg.sender);
        } else if (
            keccak256(bytes(_role)) == keccak256(bytes("patient"))
        ) {
            _grantRole(PATIENT_ROLE, msg.sender);
        }

        emit UserRegistered(msg.sender, _role, block.timestamp);
    }

    function registerHospital(
        address _hospitalAddress,
        string memory _name,
        string memory _licenseNumber
    ) external onlyRole(ADMIN_ROLE) {
        require(
            _hospitalAddress != address(0),
            "Invalid hospital address"
        );

        hospitals[_hospitalAddress] = Hospital({
            walletAddress: _hospitalAddress,
            name: _name,
            licenseNumber: _licenseNumber,
            verified: false,
            totalClaimsProcessed: 0,
            totalClaimsApproved: 0
        });

        _grantRole(HOSPITAL_ROLE, _hospitalAddress);
        emit UserRegistered(_hospitalAddress, "hospital", block.timestamp);
    }

    function verifyHospital(address _hospitalAddress) external onlyRole(ADMIN_ROLE) {
        require(
            hospitals[_hospitalAddress].walletAddress != address(0),
            "Hospital not found"
        );
        hospitals[_hospitalAddress].verified = true;
    }

    // ==================== Policy Management ====================

    function createPolicy(
        address _patient,
        address _insurer,
        uint256 _coverageAmount,
        uint256 _deductible,
        uint256 _expiryDate,
        string memory _ipfsHash
    ) external onlyRole(INSURER_ROLE) returns (uint256) {
        require(_patient != address(0), "Invalid patient address");
        require(_coverageAmount > 0, "Coverage amount must be positive");
        require(_expiryDate > block.timestamp, "Invalid expiry date");

        policyCounter++;
        uint256 policyId = policyCounter;

        policies[policyId] = Policy({
            policyId: policyId,
            patient: _patient,
            insurer: _insurer,
            coverageAmount: _coverageAmount,
            deductible: _deductible,
            startDate: block.timestamp,
            expiryDate: _expiryDate,
            status: PolicyStatus.ACTIVE,
            ipfsHash: _ipfsHash
        });

        emit PolicyCreated(policyId, _patient, _insurer, _coverageAmount);
        return policyId;
    }

    function getPolicyDetails(uint256 _policyId)
        external
        view
        policyExists(_policyId)
        returns (Policy memory)
    {
        return policies[_policyId];
    }

    // ==================== Claim Management ====================

    function submitClaim(
        uint256 _policyId,
        address _hospital,
        uint256 _claimAmount,
        string[] memory _documentHashes
    ) external onlyRole(PATIENT_ROLE) nonReentrant returns (uint256) {
        Policy storage policy = policies[_policyId];

        require(policy.policyId != 0, "Policy does not exist");
        require(policy.patient == msg.sender, "Not policy holder");
        require(
            policy.status == PolicyStatus.ACTIVE,
            "Policy is not active"
        );
        require(policy.expiryDate > block.timestamp, "Policy expired");
        require(_claimAmount > 0, "Claim amount must be positive");
        require(
            _claimAmount <= policy.coverageAmount,
            "Exceeds coverage amount"
        );

        claimCounter++;
        uint256 claimId = claimCounter;

        claims[claimId] = Claim({
            claimId: claimId,
            policyId: _policyId,
            patient: msg.sender,
            hospital: _hospital,
            insurer: policy.insurer,
            claimAmount: _claimAmount,
            approvedAmount: 0,
            status: ClaimStatus.SUBMITTED,
            documentIPFSHashes: _documentHashes,
            submittedAt: block.timestamp,
            reviewedAt: 0,
            rejectionReason: "",
            fraudScore: 0,
            fraudFlagRaised: false
        });

        emit ClaimSubmitted(claimId, _policyId, msg.sender, _claimAmount);
        return claimId;
    }

    function uploadDocuments(
        uint256 _claimId,
        string[] memory _documentHashes
    ) external claimExists(_claimId) {
        Claim storage claim = claims[_claimId];

        require(
            msg.sender == claim.patient || msg.sender == claim.hospital,
            "Not authorized"
        );

        for (uint256 i = 0; i < _documentHashes.length; i++) {
            claim.documentIPFSHashes.push(_documentHashes[i]);
            emit DocumentUploaded(_claimId, _documentHashes[i], block.timestamp);
        }
    }

    function validateClaim(uint256 _claimId)
        external
        onlyRole(INSURER_ROLE)
        claimExists(_claimId)
    {
        Claim storage claim = claims[_claimId];
        require(
            msg.sender == claim.insurer,
            "Not authorized insurer"
        );
        require(
            claim.status == ClaimStatus.SUBMITTED,
            "Invalid claim status"
        );

        claim.status = ClaimStatus.UNDER_REVIEW;
    }

    function approveClaim(uint256 _claimId, uint256 _approvedAmount)
        external
        onlyRole(INSURER_ROLE)
        claimExists(_claimId)
        nonReentrant
    {
        Claim storage claim = claims[_claimId];

        require(
            msg.sender == claim.insurer,
            "Not authorized insurer"
        );
        require(
            claim.status == ClaimStatus.UNDER_REVIEW,
            "Claim not under review"
        );
        require(
            _approvedAmount > 0 && _approvedAmount <= claim.claimAmount,
            "Invalid approved amount"
        );

        claim.approvedAmount = _approvedAmount;
        claim.status = ClaimStatus.APPROVED;
        claim.reviewedAt = block.timestamp;

        hospitals[claim.hospital].totalClaimsApproved++;

        emit ClaimApproved(_claimId, _approvedAmount);
    }

    function rejectClaim(uint256 _claimId, string memory _reason)
        external
        onlyRole(INSURER_ROLE)
        claimExists(_claimId)
    {
        Claim storage claim = claims[_claimId];

        require(
            msg.sender == claim.insurer,
            "Not authorized insurer"
        );
        require(
            claim.status == ClaimStatus.UNDER_REVIEW,
            "Claim not under review"
        );

        claim.status = ClaimStatus.REJECTED;
        claim.rejectionReason = _reason;
        claim.reviewedAt = block.timestamp;

        emit ClaimRejected(_claimId, _reason);
    }

    // ==================== Payment Release ====================

    function releasePayment(uint256 _claimId)
        external
        onlyRole(INSURER_ROLE)
        claimExists(_claimId)
        nonReentrant
    {
        Claim storage claim = claims[_claimId];

        require(
            msg.sender == claim.insurer,
            "Not authorized"
        );
        require(
            claim.status == ClaimStatus.APPROVED,
            "Claim not approved"
        );

        uint256 paymentAmount = claim.approvedAmount;
        require(paymentAmount > 0, "No payment to release");

        claim.status = ClaimStatus.PAID;

        // Transfer funds
        require(
            stablecoin.transfer(claim.hospital, paymentAmount),
            "Payment failed"
        );

        hospitals[claim.hospital].totalClaimsProcessed++;
        totalFundsInContract -= paymentAmount;

        emit PaymentReleased(_claimId, claim.hospital, paymentAmount);
    }

    // ==================== Fund Management ====================

    function depositFunds(uint256 _amount) external onlyRole(INSURER_ROLE) {
        require(_amount > 0, "Amount must be positive");

        require(
            stablecoin.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        totalFundsInContract += _amount;
        emit FundsDeposited(msg.sender, _amount);
    }

    function withdrawFunds(uint256 _amount) external onlyRole(INSURER_ROLE) nonReentrant {
        require(_amount > 0, "Amount must be positive");
        require(
            _amount <= stablecoin.balanceOf(address(this)),
            "Insufficient balance"
        );

        totalFundsInContract -= _amount;
        require(
            stablecoin.transfer(msg.sender, _amount),
            "Withdrawal failed"
        );

        emit FundsWithdrawn(msg.sender, _amount);
    }

    // ==================== Fraud Detection (Oracle Integration) ====================

    function flagFraud(uint256 _claimId, uint256 _fraudScore)
        external
        onlyRole(ADMIN_ROLE)
        claimExists(_claimId)
    {
        require(_fraudScore >= 0 && _fraudScore <= 100, "Invalid fraud score");

        Claim storage claim = claims[_claimId];
        claim.fraudScore = _fraudScore;

        if (_fraudScore > 70) {
            claim.fraudFlagRaised = true;
            claim.status = ClaimStatus.REJECTED;
            claim.rejectionReason = "Fraud detection triggered";
        }

        emit FraudFlagRaised(_claimId, _fraudScore);
    }

    // ==================== View Functions ====================

    function getClaimDetails(uint256 _claimId)
        external
        view
        claimExists(_claimId)
        returns (Claim memory)
    {
        return claims[_claimId];
    }

    function getHospitalStats(address _hospitalAddress)
        external
        view
        returns (Hospital memory)
    {
        return hospitals[_hospitalAddress];
    }

    function getUserDetails(address _userAddress)
        external
        view
        returns (User memory)
    {
        return users[_userAddress];
    }

    function getContractBalance() external view returns (uint256) {
        return stablecoin.balanceOf(address(this));
    }
}
