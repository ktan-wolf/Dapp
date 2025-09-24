// lib/constants.ts
import { PublicKey } from "@solana/web3.js";

// Your program ID
export const PROGRAM_ID = new PublicKey(
  "5LzZhK83HbsJPTC877hRcfCZLg1cZvqDUQgLL3BxLYb4"
);

// The mint address of the token you want to use for staking.
// 🚨 IMPORTANT: Replace this with the actual mint address from your localnet setup.
export const MINT_ADDRESS = new PublicKey(
  "FPDRE9ND4DaaMCn9zYcGr4LSh6Vrn51UEzK27bBxh7vu" // e.g. "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDUckr"
);