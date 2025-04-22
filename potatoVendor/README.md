# The Potato Shop

Decentralized DApp that facilitates the issuance, management and secure vending of a custom ERC20 token called POTATO.  
This is accomplished by registering the address of the buyer to a locker number, and letting the buyer open the locker by signing a message and using ECDSA.

## Description

**<span style="font-size: 16px;">Token creation and management (PotatoToken contract)</span>**

- The Potato token is an ERC20 token with a minting mechanism
- The PotatoToken contract uses role-based access control:
  - Admin Role: Can assign or revoke the ability to mint tokens
  - Minter Role: Can mint new tokens to specified accounts
- The contract also supports EIP-2612 (ERC20Permit), allowing users to approve token spending off-chain with a signature, reducing gas costs

**<span style="font-size: 16px;">Token Vending and Locker System (PotatoVendor contract)</span>**

- The PotatoVendor contract acts as a vending machine for the Potato token, managing token purchases and locker-based delivery:
  - Purchase Process:
    - Buyers can use the permit functionality to approve the vendor contract to spend their tokens via a signature
    - The vendor processes the purchase, emits an event and assigns a locker for the buyer to collect their tokens
  - Locker Assignment:
    - Lockers are assigned dynamically via a pseudo-random mechanism based on the previous block's randomness
    - Each locker is mapped to a buyer's address
  - Locker Security:
    - Buyers can open their assigned lockers by signing a message and submitting the signature to the contract
    - The contract validates the signature to ensure only the rightful owner can access the locker

## Prerequisites
