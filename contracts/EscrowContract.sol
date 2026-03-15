// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EscrowContract is Ownable, ReentrancyGuard {
    struct EscrowAccount {
        address insurer;
        uint256 totalDeposited;
        uint256 totalReleased;
        uint256 balance;
    }

    mapping(address => EscrowAccount) public escrowAccounts;
    IERC20 public stablecoin;

    event EscrowDeposited(
        address indexed insurer,
        uint256 amount,
        uint256 timestamp
    );
    event EscrowReleased(
        address indexed insurer,
        address indexed recipient,
        uint256 amount
    );
    event EscrowRefunded(address indexed insurer, uint256 amount);

    constructor(address _stablecoin) {
        stablecoin = IERC20(_stablecoin);
    }

    function depositToEscrow(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be positive");
        require(
            stablecoin.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        escrowAccounts[msg.sender].insurer = msg.sender;
        escrowAccounts[msg.sender].totalDeposited += _amount;
        escrowAccounts[msg.sender].balance += _amount;

        emit EscrowDeposited(msg.sender, _amount, block.timestamp);
    }

    function releaseFromEscrow(
        address _recipient,
        uint256 _amount
    ) external nonReentrant {
        require(
            escrowAccounts[msg.sender].balance >= _amount,
            "Insufficient escrow balance"
        );

        escrowAccounts[msg.sender].balance -= _amount;
        escrowAccounts[msg.sender].totalReleased += _amount;

        require(stablecoin.transfer(_recipient, _amount), "Transfer failed");

        emit EscrowReleased(msg.sender, _recipient, _amount);
    }

    function getEscrowBalance(address _insurer)
        external
        view
        returns (uint256)
    {
        return escrowAccounts[_insurer].balance;
    }
}
