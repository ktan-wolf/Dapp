// lib/constants.ts
import { PublicKey } from "@solana/web3.js";

// Your program ID
export const PROGRAM_ID = new PublicKey(
  "CLetEL19atyAUd9NSBSCD9UyZWv2uqHDoCPXFsLqEJW8"
);

// The mint address of the token you want to use for staking.
// 🚨 IMPORTANT: Replace this with the actual mint address from your localnet setup.
export const MINT_ADDRESS = new PublicKey(
  "HmSMss8R6FXnKWGXLMv9tGFXngsPef1XpWCKVzatTjdb" // e.g. "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDUckr"
);
