"use client";

import { useEffect, useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAethernet } from "@/app/hooks/useAethernet";
import toast from "react-hot-toast";
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
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [newUri, setNewUri] = useState("");

  const [userNodes, setUserNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ---- Fetch User's NodeDevices ----
  const fetchUserNodes = useCallback(async () => {
    if (!publicKey) return;

    try {
      const response = await fetch('http://127.0.0.1:8081/nodes');
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
      toast.success("Node deregistered successfully!");
    } catch (err) {
      console.error("Failed to deregister node:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- New: Update URI ----
  const handleUpdateUri = async (nodePubkey: PublicKey) => {
    if (!program || !publicKey) return;
    try {
      setLoading(true);

      const txSig = await program.methods
        .updateUri(newUri)
        .accounts({
          authority: publicKey,
          nodes: nodePubkey,
        })
        .rpc();

      console.log("✅ URI update tx:", txSig);

      // Confirm transaction before refreshing UI
      await program.provider.connection.confirmTransaction(txSig, "confirmed");

      setEditingNode(null);
      setNewUri("");
      await fetchUserNodes();
      onChange?.();
      toast.success("Node URI updated successfully!");
    } catch (err) {
      console.error("Failed to update URI:", err);
      toast.error("Failed to update URI");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUserNodes();
  }, [fetchUserNodes]);

  return (
    // Use a relative parent to contain the glow and the card
    <div className="relative w-full max-w-2xl font-['Rajdhani',_sans-serif]">
        
        {/* Glow effect layer */}
        <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl opacity-50 blur-3xl"></div>

        {/* Main content card with fixed height and internal flex layout */}
        <div className="relative w-full p-8 space-y-6 bg-black/60 backdrop-blur-sm border border-pink-500/30 rounded-2xl flex flex-col max-h-[85vh]">

            <h3 className="text-3xl font-bold text-center text-gray-100 tracking-wide flex-shrink-0">Your Registered Nodes</h3>

            {userNodes.length > 0 ? (
                // This list is now the scrollable area
                <ul className="space-y-4 overflow-y-auto flex-grow pr-3 scrollbar-thin scrollbar-thumb-pink-700 scrollbar-track-black/30 hide-scrollbar ">
                    {userNodes.map((node, i) => (
                        <li
                            key={node.pubkey.toBase58()}
                            className="p-4 bg-gray-900/50 border border-gray-500/30 rounded-lg space-y-3 transition-all duration-300 hover:border-pink-500/50"
                        >
                            {/* Node Info */}
                            <div className="break-words">
                                <p className="text-gray-400">
                                    <strong className="text-gray-200">Node {i + 1} Pubkey:</strong> {node.pubkey.toBase58()}
                                </p>
                                <p className="text-gray-400">
                                    <strong className="text-gray-200">URI:</strong> {node.data.uri}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-2 space-x-3">
                                {/* Deregister */}
                                <button
                                    disabled={loading}
                                    onClick={() => deregisterNode(node.pubkey)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700/80 disabled:opacity-50 transition-all duration-300 text-sm font-semibold uppercase tracking-wider"
                                >
                                    {loading ? "..." : "Deregister"}
                                </button>

                                {/* Update URI */}
                                <button
                                    disabled={loading}
                                    onClick={() => {
                                        setEditingNode(node.pubkey.toBase58());
                                        setNewUri(node.data.uri);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-500/80 disabled:opacity-50 transition-all duration-300 text-sm font-semibold uppercase tracking-wider"
                                >
                                    Update URI
                                </button>
                            </div>

                            {/* Conditional Input for updating URI */}
                            {editingNode === node.pubkey.toBase58() && (
                                <div className="mt-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                    <input
                                        type="text"
                                        value={newUri}
                                        onChange={(e) => setNewUri(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-900/70 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 flex-1"
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            disabled={loading}
                                            onClick={() => handleUpdateUri(node.pubkey)}
                                            className="px-4 py-2 bg-green-600/80 text-white rounded-md hover:bg-green-500/80 disabled:opacity-50 transition-all duration-300 text-sm font-semibold uppercase tracking-wider"
                                        >
                                            {loading ? "..." : "Confirm"}
                                        </button>
                                        <button
                                            disabled={loading}
                                            onClick={() => setEditingNode(null)}
                                            className="px-4 py-2 bg-gray-600/80 text-white rounded-md hover:bg-gray-500/80 disabled:opacity-50 transition-all duration-300 text-sm font-semibold uppercase tracking-wider"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-400 py-4 flex-grow flex items-center justify-center">No nodes registered yet.</p>
            )}
        </div>
    </div>
  );
}
