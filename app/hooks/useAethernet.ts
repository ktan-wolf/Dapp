"use client";

import { useMemo } from "react";
import { useConnection , useAnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider ,  Program } from "@coral-xyz/anchor";

import idl from "@/lib/idl/aethernet.json";
// import { PROGRAM_ID  } from "@/lib/constants";

export function useAethernet() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const program = useMemo(() => {
        if(!wallet) return null;
        const provider = new AnchorProvider(connection , wallet , {
            preflightCommitment : "processed",
        });

        return new Program(idl as any , provider)
    }, [connection , wallet]);

    return program;
}