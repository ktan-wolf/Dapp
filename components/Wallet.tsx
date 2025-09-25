"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAethernet } from "../app/hooks/useAethernet";
import { PROGRAM_ID } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import RegisterNodeForm from "@/components/RegisterNodeForm";
import UserNodesList from "@/components/UserNodesList";
import { useRouter } from "next/navigation";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Wallet() {
  const { connected } = useWallet();
  const program = useAethernet();
  const [networkStats, setNetworkStats] = useState<any>(null);
  const router = useRouter();

  // ---- Fetch Network Stats ----
  const fetchNetworkStats = useCallback(async () => {
    if (!program) return;
    try {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("network-stats")],
        PROGRAM_ID
      );
      const stats = await (program.account as any).networkStats.fetch(pda);
      setNetworkStats(stats);
    } catch (err) {
      console.error("Failed to fetch NetworkStats:", err);
      setNetworkStats(null);
    }
  }, [program]);

  useEffect(() => {
    if (connected) fetchNetworkStats();
  }, [connected, fetchNetworkStats]);

  return (
    <div className="font-sans min-h-screen w-full p-6 md:p-12">
      {/* Header: AETHERNET Logo and Wallet Button */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <button onClick={() => router.push("/")} className="text-xl hover:cursor-pointer md:text-2xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
          AETHERNET
        </button>
        <WalletMultiButtonDynamic />
      </header>

      {/* Main Grid Layout */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12 mt-12 md:mt-16 max-w-7xl mx-auto">
        {/* Left Side - Stats + Register Form */}
        {connected && (
          <div className="flex flex-col items-center space-y-8 w-full">
            {/* Total Devices Registered */}
            {networkStats ? (
              <div className="text-xl font-semibold text-center">
                Total Devices Registered: {networkStats.totalNodes.toString()}
              </div>
            ) : (
              <div className="text-center">Loading Network Stats...</div>
            )}

            {/* Register Form */}
            <RegisterNodeForm
              onRegistrationSuccess={() => {
                fetchNetworkStats();
              }}
            />
          </div>
        )}

        {/* Right Side - User's Registered Nodes */}
        {connected && (
          <div className="flex items-start justify-center">
            <UserNodesList onChange={fetchNetworkStats} />
          </div>
        )}

        {/* Unconnected Message */}
        {!connected && (
            <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-24">
                <h2 className="text-3xl font-bold text-white mb-4">Welcome to Aethernet</h2>
                <p className="text-lg text-gray-400">Please connect your wallet to manage your nodes.</p>
            </div>
        )}
      </main>
    </div>
  );
}