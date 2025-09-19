"use client";

import { useEffect, useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useAethernet } from "@/app/hooks/useAethernet";
import { PROGRAM_ID, MINT_ADDRESS } from "@/lib/constants";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

interface UserNodesListProps {
  onChange?: () => void; // optional callback to refresh parent stats
}

export default function UserNodesList({ onChange }: UserNodesListProps) {
  const { publicKey } = useWallet();
  const program = useAethernet();

  const [userNodes, setUserNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ---- Fetch User's NodeDevices ----
  const fetchUserNodes = useCallback(async () => {
    if (!publicKey) return;

    try {
      const response = await fetch('https://indexer-o06a.onrender.com/nodes');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const allNodes = await response.json();

      if (!allNodes || allNodes.length === 0) {
        setUserNodes([]);
        return;
      }
      
      const userPublicKeyStr = publicKey.toBase58();

      // V-- MODIFIED --V: Adjusted to match the flat API response structure
      const filteredNodes = allNodes
        // 1. Filter using the top-level 'authority' property
        .filter((node: any) => node.authority === userPublicKeyStr)
        // 2. Map the flat structure to the nested structure the UI expects
        .map((node: any) => ({
          pubkey: new PublicKey(node.pubkey),
          data: {
            uri: node.uri // The UI needs a 'data' object with 'uri' inside
          }
        }));

      setUserNodes(filteredNodes);

    } catch (err) {
      console.error("Failed to fetch user NodeDevices from API:", err);
      setUserNodes([]);
    }
  }, [publicKey]);

  // ---- Deregister a Node ----
  const deregisterNode = async (nodePubkey: PublicKey) => {
    if (!program || !publicKey) return;
    try {
      setLoading(true);

      const [networkStatsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("network-stats")],
        PROGRAM_ID
      );
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        PROGRAM_ID
      );

      const userTokenAccount = await getAssociatedTokenAddress(
        MINT_ADDRESS,
        publicKey
      );
      const vaultTokenAccount = await getAssociatedTokenAddress(
        MINT_ADDRESS,
        vaultPda,
        true
      );

      const txSig = await program.methods
        .deregisterNode()
        .accounts({
          authority: publicKey,
          nodeDevice: nodePubkey,
          networkStats: networkStatsPda,
          mint: MINT_ADDRESS,
          userTokenAccount,
          vaultTokenAccount,
          vault: vaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("✅ Node deregistered:", txSig);

      await fetchUserNodes();
      onChange?.(); // refresh stats in parent
    } catch (err) {
      console.error("Failed to deregister node:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserNodes();
  }, [fetchUserNodes]);

  return (
    <div className="w-full max-w-2xl my-10 space-y-4">
      <h3 className="font-bold text-lg">Your Registered Nodes</h3>
      {userNodes.length > 0 ? (
        <ul className="space-y-2">
          {userNodes.map((node, i) => (
            <li
              key={node.pubkey.toBase58()}
              className="p-3 border rounded-md bg-gray-800"
            >
              <p>
                <strong>Node {i + 1} Pubkey:</strong>{" "}
                {node.pubkey.toBase58()}
              </p>
              <p>
                <strong>URI:</strong> {node.data.uri}
              </p>
              <button
                disabled={loading}
                onClick={() => deregisterNode(node.pubkey)}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Deregister"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No nodes registered yet.</p>
      )}
    </div>
  );
}