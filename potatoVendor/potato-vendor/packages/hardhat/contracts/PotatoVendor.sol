// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract PotatoVendor is AccessControl {
    IERC20 public immutable _potatoToken;
    IERC20Permit public immutable _potatoTokenPermit;
    mapping(uint8 => address) public _lockerToBuyer;

    error NoAvailableLockers();

    event BuyPotato(address indexed buyer, uint256 amount, string email);
    event LockerAssigned(address indexed buyer, uint8 lockerNumber);
    event LockerOpened(address indexed buyer, uint8 lockerNumber);

    constructor(address deployer, address tokenAddress)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, deployer);
        _potatoToken = IERC20(tokenAddress);
        _potatoTokenPermit = IERC20Permit(tokenAddress);
    }

     function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s,
        string memory email
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20Permit(_potatoTokenPermit).permit(owner, spender, value, deadline, v, r, s);
        // Emit event for buying potato so the stand-alone back-end can confirm the order to the buyer, transfer the tokens and determine a locker number
        emit BuyPotato(owner, value, email);
    }

    function getApprovedAmount(address buyer, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_potatoToken.allowance(buyer, address(this)) >= amount, "Insufficient allowance");
        require(_potatoToken.balanceOf(buyer) >= amount, "Insufficient balance");
        
        // Transfer tokens from buyer to this contract
        bool success = _potatoToken.transferFrom(buyer, address(this), amount);
        require(success, "Token transfer failed");
    }

    function reserveLocker(address buyer) public onlyRole(DEFAULT_ADMIN_ROLE) {
        //map the buyer address to an available locker number
        unchecked {
            uint8 lockerNumber = uint8(block.prevrandao % 256);
            for(uint8 i = 0; i < 256; ++i) {
                if(_lockerToBuyer[lockerNumber] == address(0)) {
                    _lockerToBuyer[lockerNumber] = buyer;
                    emit LockerAssigned(buyer, lockerNumber);
                    return;
                }
                ++lockerNumber;
            }
            revert NoAvailableLockers();
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