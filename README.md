# Lottery DApp

A decentralized lottery application built with Solidity and React.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask wallet with some Sepolia ETH
- Basic understanding of Ethereum and Web3

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd lottery-frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure the contract addresses

Open `src/utils/config.ts` and update the following variables with your deployed contract addresses:

```typescript
export const LOTTERY_ADDRESS = '0x...'; // Your deployed lottery contract address
export const LOTTERY_TOKEN_ADDRESS = '0x...'; // Your deployed token contract address
```

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
```

### 5. Open the application

Open your browser and navigate to `http://localhost:3000`

## Using the DApp

### Connecting Your Wallet

1. Click the "Connect Wallet" button
2. Approve the connection in MetaMask
3. Make sure you're connected to the Sepolia testnet

### Getting Sepolia ETH

If you don't have Sepolia ETH, you can get it from a faucet:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://sepoliafaucet.com/)

### Interacting with the Lottery

1. **Buy Tokens**: Purchase lottery tokens with Sepolia ETH
2. **Open Bets** (Owner only): Set a duration and open the betting period
3. **Place Bets**: Use your tokens to place bets
4. **Close Lottery** (Owner only): Close the betting period and determine the winner
5. **Claim Prize**: If you won, claim your prize
6. **Withdraw Owner Pool** (Owner only): Withdraw funds from the owner pool

## Troubleshooting

### MetaMask Authorization

If you see an error about MetaMask not being authorized:
1. Open MetaMask
2. Go to Settings > Security & Privacy > Connected Sites
3. Add `http://localhost:3000` manually
4. Refresh the page

### Network Issues

Make sure you're connected to the Sepolia testnet in MetaMask. If not, click the "Switch to Sepolia" button in the DApp.

### Contract Interaction Issues

If you're having trouble interacting with the contract:
1. Make sure you have enough Sepolia ETH
2. Check that you're using the correct contract addresses
3. Try refreshing the page and reconnecting your wallet

## License

[MIT](LICENSE) 