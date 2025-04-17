// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PotatoVendor is AccessControl {
    address private _potatoTokenAddress;
    mapping(uint8 => address) public _lockerToBuyer;

    constructor(address deployer, address potatoTokenAddress)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, deployer);
        _potatoTokenAddress = potatoTokenAddress;
    }

    function getApprovedAmount(address buyer, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(_potatoTokenAddress).transferFrom(buyer, address(this), amount);
    }

    function reserveLocker(address buyer) public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint8) {
        //map the buyer address to an available locker number
        unchecked {
            uint8 lockerNumber = uint8(block.prevrandao % 255);
            for(uint8 i = 0; i < 256; ++i) {
                if(_lockerToBuyer[lockerNumber] == address(0)) {
                    _lockerToBuyer[lockerNumber] = buyer;
                    return lockerNumber;
                }
                ++lockerNumber;
            }
            revert("No available lockers");
        }
    }

    function openLocker(string memory signedMsg, uint256 lockerNumber) public onlyRole(DEFAULT_ADMIN_ROLE) returns (bool) {
        //todo: if the signature matches the address where the locker number is mapped to, open the locker by returning true
    }
}