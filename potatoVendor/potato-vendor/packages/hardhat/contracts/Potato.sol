// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract Potato is ERC20, AccessControl, ERC20Permit {
    event BuyPotato(address indexed buyer, string email);

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address defaultAdmin, address minter)
        ERC20("Potato", "POTATO")
        ERC20Permit("Potato")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
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
    ) public onlyRole(MINTER_ROLE) {
        permit(owner, spender, value, deadline, v, r, s);
        //TODO: emit event for buying potato so the stand-alone back-end can confirm the order to the buyer, transfer the tokens and determine a locker number
        emit BuyPotato(owner, email);
    }
}