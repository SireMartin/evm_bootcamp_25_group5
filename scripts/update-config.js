#!/usr/bin/env node

/**
 * This script helps update the config.ts file with deployed contract addresses
 * Usage: node update-config.js <lottery-address> <token-address>
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const lotteryAddress = args[0];
const tokenAddress = args[1];

if (!lotteryAddress || !tokenAddress) {
  console.error('Error: Please provide both lottery and token contract addresses');
  console.error('Usage: node update-config.js <lottery-address> <token-address>');
  process.exit(1);
}

// Validate addresses
const addressRegex = /^0x[a-fA-F0-9]{40}$/;
if (!addressRegex.test(lotteryAddress) || !addressRegex.test(tokenAddress)) {
  console.error('Error: Invalid Ethereum address format');
  process.exit(1);
}

// Path to config.ts
const configPath = path.join(__dirname, '../src/utils/config.ts');

try {
  // Read the current config file
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Update the addresses
  configContent = configContent.replace(
    /export const LOTTERY_ADDRESS = "0x[a-fA-F0-9]{40}"/,
    `export const LOTTERY_ADDRESS = "${lotteryAddress}"`
  );
  
  configContent = configContent.replace(
    /export const LOTTERY_TOKEN_ADDRESS = "0x[a-fA-F0-9]{40}"/,
    `export const LOTTERY_TOKEN_ADDRESS = "${tokenAddress}"`
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(configPath, configContent);
  
  console.log('Successfully updated config.ts with:');
  console.log(`- Lottery Address: ${lotteryAddress}`);
  console.log(`- Token Address: ${tokenAddress}`);
} catch (error) {
  console.error('Error updating config.ts:', error.message);
  process.exit(1);
} 