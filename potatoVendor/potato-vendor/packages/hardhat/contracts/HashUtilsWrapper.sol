// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

library HashUtilsWrapper {
    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return MessageHashUtils.toEthSignedMessageHash(hash);
    }
}