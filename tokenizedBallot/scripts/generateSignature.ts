import { viem } from "hardhat";

const hre = require("hardhat");
const { keccak256, encodePacked, toBytes, encodeAbiParameters, parseAbiParameters } = require("viem");

async function main() {
  // Get the wallet client (signer)
  const [walletClient] = await hre.viem.getWalletClients();
  const signerAddress = walletClient.account.address;
  
  
  // Address to delegate to
  const delegateeAddress = "0x1234567890123456789012345678901234567890";
  
  const tokenContract = await viem.getContractAt("MyToken", "0xFF198373b61Fc6132EFe421A47637A17C75986C8");
  // Parameters for the delegation
  const nonce = await tokenContract.read.nonces([walletClient.account.address]); // Should be fetched from the contract
  console.log(`nonce is ${nonce}`);
  const expiry = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
  
  // Create the delegation type hash
  const DELEGATION_TYPEHASH = keccak256(
    toBytes("Delegation(address delegatee,uint256 nonce,uint256 expiry)")
  );

  const chainId = parseInt(await hre.network.provider.request({ method: "eth_chainId" }));
  console.log(`chain id = ${chainId}`);
  
  // Create the domain separator
  // The domain object is used for EIP-712 signing and contains information about the contract and network.
  // It consists of the following properties:
  // - name: The name of the contract, in this case "MyToken".
  // - version: The version of the contract, here set to "1".
  // - chainId: The ID of the network chain where the contract is deployed. It is obtained by making a request to the network provider.
  // - verifyingContract: The address of the contract that will verify the signature, which is the address of the MyToken contract.
  const domain = {
    name: "MyToken",
    version: "1",
    chainId: await hre.network.provider.request({ method: "eth_chainId" }),
    verifyingContract: "0xFF198373b61Fc6132EFe421A47637A17C75986C8"
  };
  
  // Define the types for EIP-712 signing
  const types = {
    Delegation: [
      { name: "delegatee", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "expiry", type: "uint256" }
    ]
  };
  
  // Create the data to sign
  const value = {
    delegatee: delegateeAddress,
    nonce: nonce,
    expiry: expiry
  };
  
  // Sign the data using EIP-712
  const signature = await walletClient.signTypedData({
    domain,
    types,
    primaryType: "Delegation",
    message: value
  });
  
  // Split the signature into v, r, s components
  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);
  
  console.log("Delegation signed offline:");
  console.log("Delegator:", signerAddress);
  console.log("Delegatee:", delegateeAddress);
  console.log("Nonce:", nonce);
  console.log("Expiry:", new Date(expiry * 1000).toISOString());
  console.log("Signature components:");
  console.log("v:", v);
  console.log("r:", r);
  console.log("s:", s);
  
  // This data can now be submitted by anyone to the contract
  console.log("\nTo execute this delegation, call the delegateBySig function with these parameters:");
  console.log(`delegateBySig(${delegateeAddress}, ${nonce}, ${expiry}, ${v}, ${r}, ${s})`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
