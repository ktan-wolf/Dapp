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




// "use client";

// import dynamic from "next/dynamic";
// import { useEffect, useState, useCallback } from "react";
// import { PublicKey } from "@solana/web3.js";
// import { useAethernet } from "./hooks/useAethernet";
// import { PROGRAM_ID } from "@/lib/constants";
// import { useWallet, useConnection } from "@solana/wallet-adapter-react";
// import RegisterNodeForm from "@/components/RegisterNodeForm";

// const WalletMultiButtonDynamic = dynamic(
//   async () =>
//     (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
//   { ssr: false }
// );

// export default function Home() {
//   const { connected, publicKey } = useWallet();
//   const { connection } = useConnection();
//   const program = useAethernet();

//   const [networkStats, setNetworkStats] = useState<any>(null);
//   const [userNodes, setUserNodes] = useState<any[]>([]);

//   // ---- Fetch Network Stats ----
//   const fetchNetworkStats = useCallback(async () => {
//     if (!program) return;
//     try {
//       const [pda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("network-stats")],
//         PROGRAM_ID
//       );
//       const stats = await (program.account as any).networkStats.fetch(pda);
//       setNetworkStats(stats);
//       console.log("Fetched network stats:", stats.totalNodes.toString());
//     } catch (err) {
//       console.error("Failed to fetch NetworkStats:", err);
//       setNetworkStats(null);
//     }
//   }, [program]);

//   // ---- Fetch User's NodeDevices ----
//   const fetchUserNodes = useCallback(async () => {
//     if (!program || !publicKey) return;

//     try {
//       const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
//         filters: [
//           {
//             memcmp: {
//               offset: 8, // discriminator (8 bytes) + authority Pubkey starts here
//               bytes: publicKey.toBase58(),
//             },
//           },
//         ],
//       });

//       if (accounts.length === 0) {
//         console.log("No NodeDevices found for this user");
//         setUserNodes([]);
//         return;
//       }

//       const nodes = await Promise.all(
//         accounts.map(async (acc) => {
//           const data = await (program.account as any).nodeDevice.fetch(acc.pubkey);
//           return { pubkey: acc.pubkey, data };
//         })
//       );

//       console.log("Fetched user NodeDevices:", nodes);
//       setUserNodes(nodes);
//     } catch (err) {
//       console.error("Failed to fetch user NodeDevices:", err);
//       setUserNodes([]);
//     }
//   }, [program, connection, publicKey]);

//   // ---- Run on connect ----
//   useEffect(() => {
//     if (connected) {
//       fetchNetworkStats();
//       fetchUserNodes();
//     }
//   }, [connected, fetchNetworkStats, fetchUserNodes]);

//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       {/* Wallet Connect Button */}
//       <WalletMultiButtonDynamic />

//       {/* Display NetworkStats */}
//       {networkStats ? (
//         <div className="text-xl font-semibold mb-16">
//           Total Devices Registered: {networkStats.totalNodes.toString()}
//         </div>
//       ) : (
//         <div>Loading Network Stats...</div>
//       )}

//       {/* Node Registration Form */}
//       {connected && (
//         <RegisterNodeForm
//           onRegistrationSuccess={() => {
//             fetchNetworkStats();
//             fetchUserNodes();
//           }}
//         />
//       )}

//       {/* User's Registered Nodes */}
//       {connected && (
//         <div className="w-full max-w-2xl my-12 space-y-4">
//           <h3 className="font-bold text-lg">Your Registered Nodes</h3>
//           {userNodes.length > 0 ? (
//             <ul className="space-y-2">
//               {userNodes.map((node, i) => (
//                 <li
//                   key={node.pubkey.toBase58()}
//                   className="p-3 border rounded-md bg-gray-800"
//                 >
//                   <p>
//                     <strong>Node {i + 1} Pubkey:</strong>{" "}
//                     {node.pubkey.toBase58()}
//                   </p>
//                   <p>
//                     <strong>URI:</strong> {node.data.uri}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No nodes registered yet.</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
