// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PotatoVendor is AccessControl {
    address private _potatoTokenAddress;

    constructor(address defaultAdmin, address potatoTokenAddress)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _potatoTokenAddress = potatoTokenAddress;
    }

    function getApprovedAmount(address buyer, uint256 amount) public {
        IERC20(_potatoTokenAddress).transferFrom(buyer, address(this), amount);
    }

    function reserveLocker(address buyer) public onlyRole(DEFAULT_ADMIN_ROLE) {
        //todo: map the buyer address to a locker number
    }

    function openLocker(string memory signedMsg, uint256 lockerNumber) public onlyRole(DEFAULT_ADMIN_ROLE) returns (bool) {
        //todo: if the signature matches the address where the locker number is mapped to, open the locker by returning true
    }
}