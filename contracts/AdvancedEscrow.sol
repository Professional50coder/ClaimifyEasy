// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AdvancedEscrow
 * @dev Enhanced escrow with multi-signature approval and time locks
 */

contract AdvancedEscrow is Ownable, ReentrancyGuard, Pausable {
    IERC20 public stablecoin;

    struct EscrowAccount {
        address insurer;
        uint256 totalDeposited;
        uint256 totalReleased;
        uint256 balance;
        bool frozen;
    }

    struct EscrowRelease {
        uint256 escrowId;
        address recipient;
        uint256 amount;
        uint256 approvals; // Number of approvals received
        uint256 requiredApprovals; // Required for multi-sig
        bool executed;
        uint256 releaseTime; // Time lock
    }

    mapping(address => EscrowAccount) public escrowAccounts;
    mapping(uint256 => EscrowRelease) public releases;
    mapping(bytes32 => bool) public signers; // Multi-sig signers

    uint256 public escrowIdCounter = 0;
    uint256 public timeLockDuration = 2 days; // Default time lock

    event EscrowDeposited(address indexed insurer, uint256 amount, uint256 timestamp);
    event ReleaseRequested(uint256 indexed escrowId, address recipient, uint256 amount);
    event ReleaseApproved(uint256 indexed escrowId, address approver);
    event ReleaseExecuted(uint256 indexed escrowId, address recipient, uint256 amount);
    event AccountFrozen(address indexed insurer, string reason);

    constructor(address _stablecoin, address[] memory _initialSigners) {
        stablecoin = IERC20(_stablecoin);
        for (uint256 i = 0; i < _initialSigners.length; i++) {
            signers[keccak256(abi.encodePacked(_initialSigners[i]))] = true;
        }
    }

    /**
     * @dev Deposit funds to escrow
     */
    function depositToEscrow(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be positive");
        require(
            stablecoin.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        EscrowAccount storage account = escrowAccounts[msg.sender];
        account.insurer = msg.sender;
        account.totalDeposited += _amount;
        account.balance += _amount;

        emit EscrowDeposited(msg.sender, _amount, block.timestamp);
    }

    /**
     * @dev Request release from escrow (triggers multi-sig approval process)
     */
    function requestRelease(address _recipient, uint256 _amount)
        external
        nonReentrant
        returns (uint256)
    {
        require(escrowAccounts[msg.sender].balance >= _amount, "Insufficient balance");
        require(!escrowAccounts[msg.sender].frozen, "Account is frozen");

        escrowIdCounter++;
        uint256 escrowId = escrowIdCounter;

        releases[escrowId] = EscrowRelease({
            escrowId: escrowId,
            recipient: _recipient,
            amount: _amount,
            approvals: 0,
            requiredApprovals: 2, // Requires 2 approvals
            executed: false,
            releaseTime: block.timestamp + timeLockDuration,
        });

        emit ReleaseRequested(escrowId, _recipient, _amount);
        return escrowId;
    }

    /**
     * @dev Multi-sig signer approves a release
     */
    function approveRelease(uint256 _escrowId) external {
        require(
            signers[keccak256(abi.encodePacked(msg.sender))],
            "Not authorized signer"
        );
        require(!releases[_escrowId].executed, "Release already executed");

        EscrowRelease storage release = releases[_escrowId];
        release.approvals++;

        emit ReleaseApproved(_escrowId, msg.sender);
    }

    /**
     * @dev Execute release after approvals and time lock
     */
    function executeRelease(uint256 _escrowId) external nonReentrant {
        EscrowRelease storage release = releases[_escrowId];

        require(!release.executed, "Already executed");
        require(
            release.approvals >= release.requiredApprovals,
            "Insufficient approvals"
        );
        require(block.timestamp >= release.releaseTime, "Time lock not expired");

        release.executed = true;

        EscrowAccount storage account = escrowAccounts[msg.sender];
        account.balance -= release.amount;
        account.totalReleased += release.amount;

        require(
            stablecoin.transfer(release.recipient, release.amount),
            "Transfer failed"
        );

        emit ReleaseExecuted(_escrowId, release.recipient, release.amount);
    }

    /**
     * @dev Freeze account for suspicious activity
     */
    function freezeAccount(address _account, string memory _reason) external onlyOwner {
        escrowAccounts[_account].frozen = true;
        emit AccountFrozen(_account, _reason);
    }

    /**
     * @dev Unfreeze account
     */
    function unfreezeAccount(address _account) external onlyOwner {
        escrowAccounts[_account].frozen = false;
    }

    /**
     * @dev Get escrow balance
     */
    function getBalance(address _insurer) external view returns (uint256) {
        return escrowAccounts[_insurer].balance;
    }

    /**
     * @dev Pause/unpause operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
