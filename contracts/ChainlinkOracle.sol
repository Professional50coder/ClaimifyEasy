// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

/**
 * @title ChainlinkOracle
 * @dev Integrates Chainlink for fraud detection and hospital verification
 */

contract ChainlinkOracle is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    struct OracleRequest {
        bytes32 requestId;
        address requester;
        uint256 claimId;
        string requestType; // "fraud_score", "hospital_license"
        bool fulfilled;
        uint256 result;
    }

    mapping(bytes32 => OracleRequest) public requests;

    // Oracle job configuration
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    event OracleRequestCreated(bytes32 indexed requestId, uint256 claimId, string requestType);
    event OracleResponseReceived(bytes32 indexed requestId, uint256 result);

    constructor() ConfirmedOwner(msg.sender) {
        setPublicChainlinkToken();
        // These values should be set based on the network
        oracle = 0x; // Sepolia oracle address
        jobId = ""; // Job ID for the request
        fee = 1 * 10 ** 17; // 0.1 LINK
    }

    /**
     * @dev Request fraud score for a claim from Chainlink
     */
    function requestFraudScore(uint256 _claimId, string calldata _claimDetails)
        public
        returns (bytes32 requestId)
    {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillFraudScore.selector
        );

        // Set the URL to perform the GET request on
        req.add(
            "get",
            "https://api.example.com/fraud-check"
        );

        req.add("claim_id", bytes(_claimDetails));
        req.add("path", "fraud_score");
        req.addInt("times", 100); // Multiply by 100 for integer response

        // Send the request
        requestId = sendChainlinkRequest(req, fee);

        requests[requestId] = OracleRequest({
            requestId: requestId,
            requester: msg.sender,
            claimId: _claimId,
            requestType: "fraud_score",
            fulfilled: false,
            result: 0,
        });

        emit OracleRequestCreated(requestId, _claimId, "fraud_score");
        return requestId;
    }

    /**
     * @dev Request hospital license verification from Chainlink
     */
    function requestHospitalVerification(address _hospitalAddress, string calldata _licenseNumber)
        public
        returns (bytes32 requestId)
    {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillHospitalVerification.selector
        );

        req.add("get", "https://api.example.com/hospital-verify");
        req.add("hospital", addressToString(_hospitalAddress));
        req.add("license", bytes(_licenseNumber));
        req.add("path", "verified");

        requestId = sendChainlinkRequest(req, fee);

        requests[requestId] = OracleRequest({
            requestId: requestId,
            requester: msg.sender,
            claimId: 0,
            requestType: "hospital_license",
            fulfilled: false,
            result: 0,
        });

        emit OracleRequestCreated(requestId, 0, "hospital_license");
        return requestId;
    }

    /**
     * @dev Fulfill fraud score request
     */
    function fulfillFraudScore(bytes32 _requestId, uint256 _fraudScore) public recordChainlinkFulfillment(_requestId) {
        require(requests[_requestId].fulfilled == false, "Request already fulfilled");

        requests[_requestId].fulfilled = true;
        requests[_requestId].result = _fraudScore;

        emit OracleResponseReceived(_requestId, _fraudScore);
    }

    /**
     * @dev Fulfill hospital verification request
     */
    function fulfillHospitalVerification(bytes32 _requestId, uint256 _verified)
        public
        recordChainlinkFulfillment(_requestId)
    {
        require(requests[_requestId].fulfilled == false, "Request already fulfilled");

        requests[_requestId].fulfilled = true;
        requests[_requestId].result = _verified;

        emit OracleResponseReceived(_requestId, _verified);
    }

    /**
     * @dev Get oracle request result
     */
    function getOracleResult(bytes32 _requestId)
        external
        view
        returns (uint256 result, bool fulfilled)
    {
        OracleRequest storage req = requests[_requestId];
        return (req.result, req.fulfilled);
    }

    /**
     * @dev Withdraw LINK tokens from contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }

    // Helper function to convert address to string
    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 _bytes = bytes32(uint256(uint160(_addr)));
        bytes memory HEX = "0123456789abcdef";
        bytes memory result = new bytes(42);
        result[0] = '0';
        result[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            result[2 + i * 2] = HEX[uint8(_bytes[i + 12] >> 4)];
            result[3 + i * 2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }
        return string(result);
    }
}
