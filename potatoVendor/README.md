# The Potato Shop
A custom ERC20 Token called **`POTATO`**

# OVERVIEW
 [Potato-daemon](https://github.com/SireMartin/evm_bootcamp_25_group5/tree/main/potatoVendor/potato-daemon)
 [Potato-Vendor](https://github.com/SireMartin/evm_bootcamp_25_group5/tree/main/potatoVendor/potato-vendor)
 
## What is Potato Shop
The Potatos Shop is a Decentralized Application (DApp) that facilitates the issuance, management and secure vending of a custom ERC20 token called **`POTATO`**.  
This is accomplished by registering the address of the buyer to a locker number, and letting the buyer open the locker by signing a message using ECDSA.

## Description

**<span style="font-size: 16px;">Token creation and management (PotatoToken contract)</span>**

- The `Potato` token is an ERC20 token with a minting mechanism
- The `PotatoToken` contract uses role-based access control:
  - **Admin Role**: Can assign or revoke the ability to mint tokens
  - **Minter Role**: Can mint new tokens to specified accounts
- The contract also supports EIP-2612 (`ERC20Permit`), allowing users to approve token spending off-chain with a signature, reducing gas costs

**<span style="font-size: 16px;">Token Vending and Locker System (PotatoVendor contract)</span>**

- The `PotatoVendor` contract acts as a vending machine for the `Potato` token, managing token purchases and locker-based delivery:
  - *Purchase Process*
    - Buyers can use the `permit` functionality to approve the vendor contract to spend their tokens via a signature
    - The vendor processes the purchase, emits an event and assigns a locker for the buyer to collect their tokens
  - *Locker Assignment*
    - Lockers are assigned dynamically via a pseudo-random mechanism based on the previous block's randomness
    - Each locker is mapped to a buyer's address
  - *Locker Security*
    - Buyers can open their assigned lockers by signing a message and submitting the signature to the contract
    - The contract validates the signature to ensure only the rightful owner can access the locker
   
## Working Mechanism

1. **<span style="font-size: 16px;">Setup</span>**

  - The `PotatoToken` contract is deployed, and roles are assigned:
    - The admin assigns the `Minter Role` to the vendor contract or other authorized accounts
    - This allows tokens to be minted for distribution
  - The `PotatoVendor` contract is deployed with the address of the `PotatoToken` contract

2. **<span style="font-size: 16px;">Token Minting</span>**

  - The vendor contract (or other authorized minters) mints new `POTATO` tokens as needed:
    - For example, minting tokens to distribute to buyers or to keep tokens in the vendor contract for vending

3. **<span style="font-size: 16px;">Token Purchase</span>**

  - Buyers interact with the `PotatoVendor` contract to purchase tokens:
    - The buyer approves the vendor contract to spend tokens using the `permit` functionality (off-chain signature)
    - The vendor processes the purchase and emits an event to notify the backend system or external services

4. **<span style="font-size: 16px;">Locker Assignment</span>**

  - After a successful purchase, the vendor assigns a locker to the buyer:
    - The locker number is dynamically determined using a pseudo-random mechanism
    - The locker is mapped to the buyer's address, and an event is emitted

5. **<span style="font-size: 16px;">Locker Access</span>**

  - Buyers can open their assigned lockers by submitting a valid cryptographic signature:
    - The buyer signs the locker number off-chain
    - The vendor contract verifies the signature and ensures it matches the buyer's address
    - If valid, the locker is opened, and the mapping is cleared for future use.

## Prerequisites
The following steps should be completed before using the Potato Shop DApp

## Requirements

## Deployment

## Example
