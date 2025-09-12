// lib/constants.ts
import { PublicKey } from "@solana/web3.js";

// Your program ID
export const PROGRAM_ID = new PublicKey(
  "HQvqX5DpDonJN2YjshaTSrRRJmZvBe3fhYGy7aSvceuT"
);

// The mint address of the token you want to use for staking.
// 🚨 IMPORTANT: Replace this with the actual mint address from your localnet setup.
export const MINT_ADDRESS = new PublicKey(
  "BiqgWBwqk7zgPNL8bmoSi9T7xQnCq7GpzE4xS7qm225S" // e.g. "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDUckr"
);