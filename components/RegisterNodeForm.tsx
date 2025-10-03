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

      // NEW: Wait for the transaction to be confirmed by the network.
      await program.provider.connection.confirmTransaction(signature, "confirmed");

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
    // Use a relative parent to contain the glow and the card
    <div className="relative w-full max-w-md font-['Rajdhani',_sans-serif]">
      
      {/* Glow effect layer: an element behind the card, blurred and colored */}
      <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl opacity-60 blur-3xl"></div>
      
      {/* Main content card with glassmorphism effect */}
      <div className="relative w-full p-8 space-y-6 bg-black/60 backdrop-blur-sm border-2 border-pink-500/30 rounded-2xl">
        
        <h2 className="text-3xl font-bold text-center text-gray-100 tracking-wide">
          Register a New Node
        </h2>

        {/* Input field */}
        <div>
          <label htmlFor="uri" className="block text-sm font-medium mb-2 text-gray-400 uppercase tracking-wider">
            Device URI
          </label>
          <input
            id="uri"
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="e.g., https://my-device.io/info.json"
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
            disabled={isLoading}
          />
        </div>

        {/* Register button */}
        <button
          onClick={registerNode}
          disabled={isLoading || !uri}
          className="w-full py-3 px-4 bg-pink-700 text-white rounded-md hover:bg-pink-600 disabled:bg-gradient-to-r from-pink-600 to-purple-600 disabled:cursor-not-allowed transition-all duration-300 font-semibold uppercase tracking-wider transform hover:scale-105 hover:shadow-[0_0_25px_rgba(219,39,119,0.7)]"
        >
          {isLoading ? "Registering..." : "Register Node"}
        </button>

        {/* Transaction Result Display */}
        {txSignature && (
          <div className="text-center text-green-400 break-all p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <p className="font-semibold">Success!</p>
            <a
              href={getExplorerUrl(txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-sm hover:text-green-300"
            >
              View Transaction on Explorer
            </a>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-center text-red-400 break-words p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}