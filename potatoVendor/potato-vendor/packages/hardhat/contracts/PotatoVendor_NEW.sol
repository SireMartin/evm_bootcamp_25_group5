// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";                                    // Import the wrapper library

contract PotatoVendorNew is AccessControl {                                                   // Enable the `toEthSignedMessageHash` function

    event LockerAssigned(address indexed buyer, uint256 lockerNumber);

    bytes32 public constant BACKEND_ROLE = keccak256("BACKEND_ROLE");

    IERC20 public immutable potatoToken;
    mapping(uint256 => address) public lockerAssignments;
    mapping(uint256 => bool) public lockerOccupied;
    mapping(address => uint256) public buyerToLocker;

    uint256 public lockerCount = 100;                                                       // Total number of lockers

    constructor(address tokenAddress, address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(BACKEND_ROLE, defaultAdmin);
        potatoToken = IERC20(tokenAddress);
    }

    function transferApprovedTokens(address buyer, uint256 amount) external onlyRole(BACKEND_ROLE) {
        // Ensure the buyer has approved enough tokens
        require(potatoToken.allowance(buyer, address(this)) >= amount, "Insufficient allowance");
        require(potatoToken.balanceOf(buyer) >= amount, "Insufficient balance");
        
        // Transfer tokens from buyer to this contract
        bool success = potatoToken.transferFrom(buyer, address(this), amount);
        require(success, "Token transfer failed");
    }

    function reserveLocker(address buyer) external onlyRole(BACKEND_ROLE) {
        require(buyerToLocker[buyer] == 0, "Locker already assigned");

        uint256 lockerNumber = _findRandomLocker();
        lockerAssignments[lockerNumber] = buyer;
        lockerOccupied[lockerNumber] = true;
        buyerToLocker[buyer] = lockerNumber;

        emit LockerAssigned(buyer, lockerNumber);
    }

    function openLocker(
        uint256 lockerNumber,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external view returns (bool) {
        address buyer = lockerAssignments[lockerNumber];
        require(buyer != address(0), "Locker not assigned");

        // Hash the message (locker number) and recover the signer
        bytes32 messageHash = keccak256(abi.encodePacked(lockerNumber));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ecrecover(ethSignedMessageHash, v, r, s);
        
        require(signer == buyer, "Invalid signature");

        // Open the locker (here it's just returning true as a simulation)
        return true;
    }

    function _findRandomLocker() internal view returns (uint256) {
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao)));
        for (uint256 i = 0; i < lockerCount; i++) {
            uint256 lockerNumber = (randomSeed + i) % lockerCount + 1;
            if (!lockerOccupied[lockerNumber]) {
                return lockerNumber;
            }
        }
        revert("No lockers available");
    }
}
