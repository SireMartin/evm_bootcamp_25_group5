# Voting DApp

A decentralized voting application with a frontend built on scaffold-eth and a backend built on NestJS

## Description

- Voting dApp to cast votes, delegate and query results on chain
- Voting tokens to be minted using the API
- List of recent votes stored in the backend and displayed on the frontend

## Prerequisites

- [Node.js](https://nodejs.org/en/docs/guides/getting-started-guide/)
- [npm](https://docs.npmjs.com/cli/v9/configuring-npm/install)
- [yarn](https://yarnpkg.com/getting-started/install)
- [NestJS](https://docs.nestjs.com/)
- MetaMask wallet with some Sepolia ETH
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
    .../scaffold-eth-2/packages/hardhat/contracts/TokenContract.sol
    .../scaffold-eth-2/packages/hardhat/contracts/TokenizedBallot.sol
    ```

    Copy the contract deployment scripts:

    ```bash
    .../scaffold-eth-2/packages/hardhat/deploy/00_deploy_token_contract.ts
    ...scaffold-eth-2/packages/hardhat/deploy/01_deploy_ballot_contract.ts
    ```

    Copy the main Next.js page:

    ```bash
    .../scaffold-eth-2/packages/nextjs/app/page.tsx
    ```

### 2. Getting Started - Backend setup

- **<span style="font-size: 16px;">Install NestJS</span>**

  Go back to the project folder and install NestJS if you don't have it

  ```bash
  cd ..
  npm i -g @nestjs/cli
  ```

- **<span style="font-size: 16px;">Create a NestJS project folder for the API</span>**

  ```bash
  nest new <project-name>
  cd <project-name>
  ```

- **<span style="font-size: 16px;">Add the Swagger Module</span>**

  Install `@nestjs/swagger` to your project

  ```bash
  npm install --save @nestjs/swagger
  ```

- **<span style="font-size: 16px;">Install viem</span>**

  ```bash
  npm i viem
  ```

- **<span style="font-size: 16px;">Solve ABI parsing</span>**
  
  Add the `resolveJsonModule` configuration to `compilerOptions` inside `tsconfig.json`

  ```json
  "resolveJsonModule": true
  ```

- **<span style="font-size: 16px;">Add environment variables</span>**

  Add `dotenv` to your project and configure it at `main.ts`

  ```bash
  npm i --save dotenv
  ```

  ```typescript
  ...
  import 'dotenv/config';
  ```

- **<span style="font-size: 16px;">Copy the following files</span>**

  Copy the controllers file

  ```bash
  .../src/app.controller.ts
  ```

  Copy the services file

  ```bash
  .../src/app.service.ts
  ```

  Copy the main nestjs file

  ```bash
  .../src/main.ts
  ```

  Create the `assets` folder and, once deployed, copy the contracts json files grabbed by the frontend available at `scaffold-eth-2/packages/hardhat/artifacts/contracts`

  ```bash
  .../src/assets/MyToken.json
  .../src/assets/TokenizedBallot.json
  ```

  Create the `dtos` folder and copy the minter object

  ```bash
  .../src/dtos/mintToken.dto.ts
  ```

### 3. Configuration

- **<span style="font-size: 16px;">Check the working environment</span>**

  The project is intended for working on the Sepolia testnet environment. To this aim, modify the following file

  ```bash
  .../scaffold-eth-2/packages/nextjs/scaffold.config.ts
  targetNetworks: [chains.sepolia],
  ```

  If you want to test it on Hardhat, leave it unmodified

  ```bash
  .../scaffold-eth-2/packages/nextjs/scaffold.config.ts
  targetNetworks: [chains.hardhat],
  ```

  and modify the target chain and the transport protocol in the backend in the `app.services.ts` file when the `publicClient` and the `walletClient` are created

  ```bash
  chain: hardhat,
  transport: http(),
  ```

- **<span style="font-size: 16px;">Terminal for backend application</span>**

  Open one terminal window, move to the nest `project-name` folder and run the following command to activate the server (backend)

  ```bash
  npm run start:dev
  ```

  > **NOTE:** the `dev` option allow the backend to run in "watch mode", restarting automatically if a change on main, services or controllers happened. If a change is made on the `.env` file used to process key variables, the server doesn't restart automatically, it needs to be restarted manually

- **<span style="font-size: 16px;">Terminal for frontend application</span>**

  Open another terminal window, move to the `scaffold-eth` folder and run the following command to start the frontend

  ```bash
  yarn start
  ```

- **<span style="font-size: 16px;">Terminal for contract deployment</span>**

  Open another terminal window, move to the `scaffold-eth folder` and leave it there for contract deployment

  > **NOTE:** if multiple contracts have to be deployed sequentially for dependancy reasons, choose to deploy one by one using tags: `yarn deploy --tags contractNameTag`
  > **NOTE 2:** if working on the Hardhat test environment, it is required to open another terminal window and move to the `scaffold-eth` folder in order to start the chain by typing the following command

  ```bash
  yarn chain
  ```

## Using the DApp

- **<span style="font-size: 16px;">Check parameters</span>**

  Before start using the voting DApp, check parameters in the `.env` file
    * `PRIVATE_KEY` field set
    * `PROVIDER_API_KEY` field set (default: Alchemy)
    * `TOKEN_ADDRESS` field present (to be filled with the token contract address once deployed)
    * `BALLOT_ADDRESS` field present (to be filled with the ballot contract address once deployed)

- **<span style="font-size: 16px;">Import account on yarn</span>**

  Before deploying contracts it is required to import your account into yarn. Follow this [guide](https://docs.scaffoldeth.io/deploying/deploy-smart-contracts)
  > **NOTE:** if working on Hardhat, this step is not required

- **<span style="font-size: 16px;">Deploy the Token contract</span>**

  Deploy the token contract on the terminal left for contract deployment run the following command

  ```bash
  yarn deploy --tags TokenContract --network sepolia
  ```
  > **NOTE:** if working on Hardhat, it is not required to specify the network for deployment

- **<span style="font-size: 16px;">Check that the token contract address is properly set</span>**

  Copy the token contract address and paste it in:
    * `.env` file
    * `TokenName` function in the `...\scaffold-eth-2\packages\nextjs\app\page.tsx file` (when using the wagmi function `useReadContract`)
    * `TokenSymbol` function in the `...\scaffold-eth-2\packages\nextjs\app\page.tsx` file (when using the wagmi function `useReadContract`)
    * `TokenBalance` function in the `...\scaffold-eth-2\packages\nextjs\app\page.tsx` file (when using the wagmi function `useReadContract`)
    * `TokenSupply` function in the `...\scaffold-eth-2\packages\nextjs\app\page.tsx` file (when using the wagmi function `useReadContract`)  

  <br>

    > **NOTE:** after that, save the modified files and:
    > - refresh the frontend webpage to see the results updated (queried to the contract deployed)
    > - kill and run again the backend in order to have updated info (modifying the `TOKEN_ADDRESS` variable in the `.env` file doesn't trigger the backend to restart automatically)

- **<span style="font-size: 16px;">Backend interaction</span>**

  Interact with the backend (`http://localhost:3001/api`)

- **<span style="font-size: 16px;">Minting tokens</span>**

  Start minting tokens to each address and refresh the frontend webpage to see updated info (user token balance, token total supply)

- **<span style="font-size: 16px;">Token contract interaction</span>**

  Interact with the contract on the frontend webpage (`http://localhost:3000/`) going in the section `Debug Contracts`  
  Query balances, delegates, votes, and execute self-delegation transactions to enable voting power for each user

- **<span style="font-size: 16px;">Deploy the Ballot contract</span>**

  Once the self-delegation has occurred for every account, deploy the `TokenizedBallot` contract by running the command 

  ```bash
  yarn deploy --tags TokenizedBallot --network sepolia
  ```

  The TokenizedBallot contract needs to be deployed after self-delegation since it requires a targetBlockNumber as a parameter (chosen to be the lastBlockNumber after the last self-delegation transaction).  
  In this way, the voting power information for each account is recorded on the TokenizedBallot contract

  > **NOTE:** if working on Hardhat, it is not required to specify the network for deployment

- **<span style="font-size: 16px;">Check that the ballot contract address is properly set</span>**

  Copy the ballot contract address and paste it in:
    * `.env` file
    * `WinnerName` function in the `...\scaffold-eth-2\packages\nextjs\app\page.tsx file` (when using the wagmi function `useReadContract`)
      
  <br>
  
    > **NOTE:** after that, save the modified files and:
    > - refresh the frontend webpage to see the results updated (queried to the contract deployed)
    > - kill and run again the backend in order to have updated info (modifying the `BALLOT_ADDRESS` variable in the `.env` file doesn't trigger the backend to restart automatically)

- **<span style="font-size: 16px;">Ballot contract interaction</span>**

  Interact with the TokenizedBallot contract for voting, querying the voting list and retrieving info about the winning proposal

## License

[MIT](LICENSE) 
