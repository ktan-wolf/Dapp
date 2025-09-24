'use client';

import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Geist, Geist_Mono } from "next/font/google";
import SolanaProvider from '../components/SolanaProvider';
import { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SolanaProvider>
          {children}
          <Toaster position="top-right" reverseOrder={false}/>
        </SolanaProvider>
      </body>
    </html>
  );
}
