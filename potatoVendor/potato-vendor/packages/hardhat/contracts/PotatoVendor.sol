// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract PotatoVendor is AccessControl {
    IERC20 public immutable _potatoToken;
    mapping(uint8 => address) public _lockerToBuyer;
    uint8 public _lastLockerNumber;

    event LockerAssigned(address indexed buyer, uint256 lockerNumber);
    event LockerOpened(address indexed buyer, uint256 lockerNumber);

    constructor(address deployer, address tokenAddress)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, deployer);
        _potatoToken = IERC20(_tokenAddress);
    }

    function getApprovedAmount(address buyer, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(potatoToken.allowance(buyer, address(this)) >= amount, "Insufficient allowance");
        require(potatoToken.balanceOf(buyer) >= amount, "Insufficient balance");
        
        // Transfer tokens from buyer to this contract
        bool success = potatoToken.transferFrom(buyer, address(this), amount);
        require(success, "Token transfer failed");
    }

    function reserveLocker(address buyer) public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint8) {
        //map the buyer address to an available locker number
        unchecked {
           for (uint8 lockerNumber = 0; lockerNumber < 256; ++lockerNumber) {
        if (_lockerToBuyer[lockerNumber] == address(0)) {
            _lockerToBuyer[lockerNumber] = buyer;
            emit LockerAssigned(buyer, lockerNumber);
            _lastLockerNumber = lockerNumber;
            return lockerNumber;
        }
    }
    revert("No available lockers");
        }
    }

    function openLocker(
        uint8 lockerNumber,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        address buyer = _lockerToBuyer[lockerNumber];
        require(buyer != address(0), "Locker not assigned");

        // Hash the message (locker number) and recover the signer
        bytes32 messageHash = keccak256(abi.encodePacked(lockerNumber));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ecrecover(ethSignedMessageHash, v, r, s);
        
        require(signer == buyer, "Invalid signature");
        _lockerToBuyer[lockerNumber] = address(0);
        emit LockerOpened(buyer, lockerNumber);
    }
}
