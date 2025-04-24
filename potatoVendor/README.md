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

### 1. Getting Started - Frontend setup

- **<span style="font-size: 16px;">Install yarn</span>**

  Install yarn if you don't have it

  ```bash
    corepack enable
  ```

- **<span style="font-size: 16px;">Create a project folder</span>**

  Create a project folder, move inside the project folder created and clone the scaffold-eth repo

  ```bash
    cd <project_folder>
    git clone https://github.com/scaffold-eth/scaffold-eth-2.git
  ```

- **<span style="font-size: 16px;">Initialize the project</span>**

  ```bash
    cd scaffold-eth-2
    yarn install
  ```

- **<span style="font-size: 16px;">Copy the following files</span>**

    Copy the contract files:

    ```bash
    .../scaffold-eth-2/packages/hardhat/contracts/PotatoToken.sol
    .../scaffold-eth-2/packages/hardhat/contracts/PotatoVendor.sol
    ```

    Copy the contract deployment scripts:

    ```bash
    .../scaffold-eth-2/packages/hardhat/deploy/00_deploy_potato_contracts.ts
    ```

    Copy the test file:

    ```bash
    .../scaffold-eth-2/packages/hardhat/test/PotatoVendorTest.ts
    ```

    Create the following paths and copy the following files:

    ```bash
    .../scaffold-eth-2/packages/nextjs/app/api/locker/route.ts
    .../scaffold-eth-2/packages/nextjs/app/api/locker/open/route.ts
    .../scaffold-eth-2/packages/nextjs/app/api/permit/route.ts
    .../scaffold-eth-2/packages/nextjs/app/api/permit/status/route.ts
    .../scaffold-eth-2/packages/nextjs/app/locker/page.tsx
    .../scaffold-eth-2/packages/nextjs/app/permit/page.tsx
    .../scaffold-eth-2/packages/nextjs/app/page.tsx
    .../scaffold-eth-2/packages/nextjs/app/components/Header.tsx
    .../scaffold-eth-2/packages/nextjs/app/contracts/deployedContracts.ts
    .../scaffold-eth-2/packages/nextjs/public/images/super_potato.png
    ```

    Add the .env file on the following path:

    ```bash
    .../scaffold-eth-2/packages/nextjs/.env
    ```

### 2. Getting Started - Backend setup

- **<span style="font-size: 16px;">Create a project folder</span>**

  Create a project folder and move inside it

  ```bash
    mkdir my-daemon
    cd my-daemon
  ```

 - **<span style="font-size: 16px;">Initialize the project</span>**

  ```bash
    npm init -y
  ```

 - **<span style="font-size: 16px;">Install dependencies</span>**

   - ethers: for interacting with Ethereum smart contracts
   - dotenv: for loading environment variables
   - nodemailer: for sending emails
   - typescript: for TypeScript support
   - ts-node: to run TypeScript files directly

   ```bash
     npm install ethers dotenv nodemailer
     npm install --save-dev typescript ts-node
   ```

- **<span style="font-size: 16px;">Copy the following files</span>**

  Copy the daemon file

  ```bash
  .../my-daemon/daemon.ts
  ```

- **<span style="font-size: 16px;">Add environment variables</span>**

  Add the .env file

### 3. Getting Started - Environment variables setup

The .env file should contain the following fields:

```bash
DEPLOYMENTS_PATH=".../scaffold-eth-2/packages/hardhat/deployments"
EMAIL_USER=""
EMAIL_PASS=""
PRIVATE_KEY=""
ALCHEMY_API_KEY=""
POTATO_VENDOR_ADDRESS=""
```

- Set your wallet private key and API key (for contract deployment on Sepolia)
- Set the PotatoVendor contract address once deployed
- Set your email and password (app password needed, depending on the email provider you use)

## Usage

- **<span style="font-size: 16px;">Check the working environment</span>**

  The project is intended for working on the Hardhat testing environment

  ```bash
  .../scaffold-eth-2/packages/nextjs/scaffold.config.ts
  targetNetworks: [chains.hardhat],
  ```

  If you want to test it on Sepolia, modify the following file

  ```bash
  .../scaffold-eth-2/packages/nextjs/scaffold.config.ts
  targetNetworks: [chains.sepolia],
  ```

- **<span style="font-size: 16px;">Run terminals</span>**

  Open four command prompt windows in order to:

  1. Deploy the smart contracts
 
    ```bash
    .../scaffold-eth-2/yarn deploy --tags Potato
    ```

    > **NOTE:** if testing on Sepolia, it is needed to target the chain for contract deployment: `yarn deploy --tags Potato --network sepolia`

  2. Run the chain (required for testing on Hardhat)
 
    ```bash
    .../scaffold-eth-2/yarn chain
    ```

  3. Run the daemon
 
    ```bash
    .../my-daemon/ts-node daemon.ts
    ```

  4. Start the frontend (on http://localhost:3000)
 
    ```bash
    .../scaffold-eth-2/yarn start
    ```

## Example

![alt text]([image_url](https://github.com/SireMartin/evm_bootcamp_25_group5/blob/main/potatoVendor/example/images/1.%20BuyPotato1.png))
![alt text]([image_url](https://github.com/SireMartin/evm_bootcamp_25_group5/blob/main/potatoVendor/example/images/2.%20BuyPotato2.png))
![alt text]([image_url](https://github.com/SireMartin/evm_bootcamp_25_group5/blob/main/potatoVendor/example/images/3.%20OrderReceived.png))
![alt text]([image_url](https://github.com/SireMartin/evm_bootcamp_25_group5/blob/main/potatoVendor/example/images/4.%20OpenLocker.png))
![alt text]([image_url](https://github.com/SireMartin/evm_bootcamp_25_group5/blob/main/potatoVendor/example/images/5.%20GoodsPicked.png))

## License

[MIT](LICENSE) 
