// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity >=0.7.0 <0.9.0;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

contract Shebang is ERC20, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor()
        ERC20("Shebang", "SHB")
        ERC20Permit("Shebang")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    /**
     * @dev This function is called by the ERC20 contract whenever tokens are transferred.
     * It updates the voting power for the `from` and `to` addresses based on the `value` transferred.
     *
     * The `override(ERC20, ERC20Votes)` specifies that this function overrides the `_update` function
     * in both the ERC20 and ERC20Votes contracts.
     *
     * The `super._update(from, to, value)` call ensures that the ERC20Votes contract's `_update` function
     * is called to update the voting power, after the ERC20 contract's `_update` function has been called
     * to handle the token transfer itself.
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}