// lib/constants.ts
import { PublicKey } from "@solana/web3.js";

// Your program ID
export const PROGRAM_ID = new PublicKey(
  "3je23jfTQJBkYTYhLCBjH2F9thAcaY9g7M7RYR92uhWu"
);

// The mint address of the token you want to use for staking.
// 🚨 IMPORTANT: Replace this with the actual mint address from your localnet setup.
export const MINT_ADDRESS = new PublicKey(
  "GaTsDjWX53ucB89D2J2m1ZyAHXuQfNurbMyuxBexCR9Y" // e.g. "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDUckr"
);