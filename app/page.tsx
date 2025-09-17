"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAethernet } from "./hooks/useAethernet";
import { PROGRAM_ID } from "@/lib/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import RegisterNodeForm from "@/components/RegisterNodeForm";
import UserNodesList from "@/components/UserNodesList";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { connected } = useWallet();
  const program = useAethernet();
  const [networkStats, setNetworkStats] = useState<any>(null);

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
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* Wallet Connect Button */}
      <WalletMultiButtonDynamic />

      {/* Display NetworkStats */}
      {networkStats ? (
        <div className="text-xl font-semibold mb-12">
          Total Devices Registered: {networkStats.totalNodes.toString()}
        </div>
      ) : (
        <div>Loading Network Stats...</div>
      )}

      {/* Node Registration Form */}
      {connected && (
        <RegisterNodeForm
          onRegistrationSuccess={() => {
            fetchNetworkStats();
          }}
        />
      )}

      {/* User's Registered Nodes */}
      {connected && <UserNodesList onChange={fetchNetworkStats} />}
    </div>
  );
}