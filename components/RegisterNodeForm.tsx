// app/components/RegisterNodeForm.tsx
"use client";

import { useState } from "react";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { useAethernet } from "@/app/hooks/useAethernet";
import { MINT_ADDRESS } from "@/lib/constants";

// Define the props for the component
interface RegisterNodeFormProps {
  onRegistrationSuccess: () => void;
}

export default function RegisterNodeForm({ onRegistrationSuccess }: RegisterNodeFormProps) {
  const { publicKey } = useWallet();
  const program = useAethernet();

  const [uri, setUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [error, setError] = useState("");

  const registerNode = async () => {
    if (!publicKey || !program) {
      setError("Wallet is not connected or program is not available.");
      return;
    }
    if (!uri) {
      setError("Please enter a URI.");
      return;
    }
    if (MINT_ADDRESS.toString() === "YOUR_TOKEN_MINT_ADDRESS_HERE") {
        setError("Please update the MINT_ADDRESS in lib/constants.ts");
        return;
    }

    setIsLoading(true);
    setError("");
    setTxSignature("");

    try {
      const [networkStatsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("network-stats")],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        program.programId
      );

      const nodeDeviceKeypair = Keypair.generate();

      const userTokenAccount = await getAssociatedTokenAddress(
        MINT_ADDRESS,
        publicKey
      );
      const vaultTokenAccount = await getAssociatedTokenAddress(
        MINT_ADDRESS,
        vaultPda,
        true // Allow PDA owner
      );

      const signature = await program.methods
        .registerNode(uri)
        .accounts({
          authority: publicKey,
          nodeDevice: nodeDeviceKeypair.publicKey,
          networkStats: networkStatsPda,
          userTokenAccount: userTokenAccount,
          vaultTokenAccount: vaultTokenAccount,
          vault: vaultPda,
          mint: MINT_ADDRESS,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([nodeDeviceKeypair])
        .rpc();

      console.log("Transaction successful with signature:", signature);
      setTxSignature(signature);
      setUri("");
      
      // Call the callback function passed via props to notify the parent
      onRegistrationSuccess();

    } catch (err: any) {
      console.error("Failed to register node:", err);
      setError(`Registration failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getExplorerUrl = (signature: string) =>
    `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=http%3A%2F%2F127.0.0.1%3A8899`;

  return (
    <div className="w-full max-w-md p-6 border rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-center">Register a New Node</h2>
      <div>
        <label htmlFor="uri" className="block text-sm font-medium mb-1">
          Device URI
        </label>
        <input
          id="uri"
          type="text"
          value={uri}
          onChange={(e) => setUri(e.target.value)}
          placeholder="e.g., https://my-device.io/info.json"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
      </div>
      <button
        onClick={registerNode}
        disabled={isLoading || !uri}
        className="w-full py-2 px-4 bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        {isLoading ? "Registering..." : "Register Node"}
      </button>

      {/* Transaction Result Display */}
      {txSignature && (
        <div className="text-center text-green-400 break-all">
          <p>Success!</p>
          <a
            href={getExplorerUrl(txSignature)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-300"
          >
            View Transaction on Explorer
          </a>
        </div>
      )}

      {error && (
        <div className="text-center text-red-400 break-words">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}