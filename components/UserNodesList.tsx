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

      await program.methods
        .updateUri(newUri)
        .accounts({
          authority: publicKey,
          nodes: nodePubkey,
        })
        .rpc();

      setEditingNode(null);
      setNewUri("");
      await fetchUserNodes();
      onChange?.();
      toast.success("Node URI updated successfully!");
    } catch (err) {
      console.error("Failed to update URI:", err);
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
                <strong>Node {i + 1} Pubkey:</strong> {node.pubkey.toBase58()}
              </p>
              <p>
                <strong>URI:</strong> {node.data.uri}
              </p>

              <div className="mt-2 space-x-2">
                {/* Deregister */}
                <button
                  disabled={loading}
                  onClick={() => deregisterNode(node.pubkey)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Deregister"}
                </button>

                {/* Update URI */}
                <button
                  disabled={loading}
                  onClick={() => {
                    setEditingNode(node.pubkey.toBase58());
                    setNewUri(node.data.uri);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Update URI
                </button>
              </div>

              {/* Conditional Input for updating URI */}
              {editingNode === node.pubkey.toBase58() && (
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    value={newUri}
                    onChange={(e) => setNewUri(e.target.value)}
                    className="px-2 py-1 rounded text-black flex-1"
                  />
                  <button
                    disabled={loading}
                    onClick={() => handleUpdateUri(node.pubkey)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Confirm Update"}
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => setEditingNode(null)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No nodes registered yet.</p>
      )}
    </div>
  );
}