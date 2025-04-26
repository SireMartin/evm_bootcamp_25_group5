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

## Prerequisites

- [Node.js](https://nodejs.org/en/docs/guides/getting-started-guide/)
- [npm](https://docs.npmjs.com/cli/v9/configuring-npm/install)
- [yarn](https://yarnpkg.com/getting-started/install)
- Basic understanding of Ethereum and Web3

### 1. Start the deamon

[Potato-daemon](https://github.com/SireMartin/evm_bootcamp_25_group5/tree/main/potatoVendor/potato-daemon)

create a .env file in the potato-daemon dir and provide the following parameters:
```
RPC_URL=https://coston2-api.flare.network/ext/C/rpc
PRIVATE_KEY=your private key to call the contract
POTATO_VENDOR_ADDRESS=0xdBeDbF6dF739EC8FCd0017BdFe1afe203df566B2
EMAIL_USER=
EMAIL_PASS=
```
start the daemon:
```
npm run start:dev`
```

### 2. Navigate to the project

[Potato-Shop](https://potato-vendor.vercel.app)

## Example

![alt text](https://github.com/SireMartin/evm_bootcamp_25_group5/blob/main/potatoVendor/example/images/1.%20BuyPotato1.png)  
![alt text](https://github.com/SireMartin/evm_bootcamp_25_group5/blob/main/potatoVendor/example/images/2.%20BuyPotato2.png)  
![alt text](https://github.com/SireMartin/evm_bootcamp_25_group5/blob/main/potatoVendor/example/images/3.%20OrderReceived.png)  
![alt text](https://github.com/SireMartin/evm_bootcamp_25_group5/blob/main/potatoVendor/example/images/4.%20OpenLocker.png)  
![alt text](https://github.com/SireMartin/evm_bootcamp_25_group5/blob/main/potatoVendor/example/images/5.%20GoodsPicked.png)  

## License

[MIT](LICENSE) 
