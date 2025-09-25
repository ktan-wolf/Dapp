"use client";

import React, { useState, useEffect } from "react";
import { Github, Twitter, Disc } from "lucide-react";
import { useRouter } from "next/navigation";

// Component to inject Google Font and custom animations into the document head
const GoogleFontAndStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap');
    
    @keyframes subtle-glow {
      0%, 100% { box-shadow: 0 0 12px rgba(190, 24, 93, 0.5); }
      50% { box-shadow: 0 0 24px rgba(190, 24, 93, 0.8); }
    }
    .animate-subtle-glow {
      animation: subtle-glow 4s ease-in-out infinite;
    }
  `}</style>
);


// A helper component for the network stats on the left, with added animation
const Stat = ({ label, value, delay }: { label: string; value: string; delay: number }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div className={`text-left transition-all duration-700 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
      <p className="text-xs text-pink-300/70 tracking-widest uppercase">{label}</p>
      <p className="text-2xl font-light text-white">{value}</p>
    </div>
  );
};

export default function HeroPage() {
  const [isMounted, setIsMounted] = useState(false);
  // State for the parallax effect
  const [transform, setTransform] = useState('translate(0px, 0px)');

  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 200);
    return () => clearTimeout(timeout);
  }, []);

  // Effect for mouse move parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return; // Disable on mobile
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (clientX - centerX) / 35; // Sensitivity
      const moveY = (clientY - centerY) / 35;
      setTransform(`translate(${moveX}px, ${moveY}px)`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);


  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-['Rajdhani',_sans_serif]">
      <GoogleFontAndStyles />
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/solana.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/60 z-1"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.9)_100%)] z-1"></div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with Translucent background */}
        <header className={`sticky top-0 z-50 transition-opacity duration-700 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 w-full h-full backdrop-blur-lg bg-gradient-to-b from-black/30 to-transparent border-b border-white/10"></div>
          <nav className="relative max-w-7xl mx-auto flex items-center justify-between p-6 lg:p-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
               <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center border border-pink-500/30">
                 <div className="w-4 h-4 bg-pink-400 rounded-sm animate-subtle-glow"></div>
               </div>
              <div className="text-lg font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
                AETHERNET
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-white/80 text-base font-medium hover:text-white transition-colors duration-300 transform hover:translate-y-[-2px]">
                Network
              </a>
              <a href="#" className="text-white/80 text-base font-medium hover:text-white transition-colors duration-300 transform hover:translate-y-[-2px]">
                Token
              </a>
              <a href="#" className="text-white/80 text-base font-medium hover:text-white transition-colors duration-300 transform hover:translate-y-[-2px]">
                Docs
              </a>
              <a href="#" className="text-white/80 text-base font-medium hover:text-white transition-colors duration-300 transform hover:translate-y-[-2px]">
                Community
              </a>
            </div>

            {/* Launch App Button with Thematic Color and Glow */}
            <button onClick={() => router.push("/wallet")} className="bg-pink-700 hover:bg-pink-800 text-white px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(190,24,93,0.6)]">
              Join Network
            </button>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <div className="max-w-7xl w-full">
            <div className="relative">
              {/* Network Stats - Left Side */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 hidden lg:block" style={{ transform: `${transform} translateY(-50%)` }}>
                <div className="space-y-8">
                  <Stat label="Active Nodes" value="1,428" delay={400} />
                  <Stat label="Data Transmitted" value="3.2 PB" delay={600} />
                  <Stat label="Network Uptime" value="99.9%" delay={800} />
                </div>
              </div>

              {/* Central Content with Entry Animation and Parallax */}
              <div className={`text-center transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transform }}>
                {/* Sub-heading */}
                <div className="mb-8">
                  <p className="text-white/80 text-sm md:text-base font-light uppercase tracking-[0.3em]">
                    The Future of Decentralized Infrastructure
                  </p>
                </div>

                {/* Main Title with Thematic Glow Effect */}
                <div className="mb-12">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-wide leading-tight text-white drop-shadow-[0_0_15px_rgba(219,39,119,0.4)]">
                    AETHERNET
                  </h1>
                </div>

                {/* Action Buttons with improved styling */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
                  <button className="w-2/3 sm:w-auto border border-white/30 text-white px-8 py-3 text-sm font-medium uppercase tracking-wide hover:bg-white/10 transition-all duration-300 backdrop-blur-sm rounded-md hover:border-white/50">
                    Read Docs
                  </button>
                  <button onClick={() => router.push("/wallet")} className="w-2/3 sm:w-auto bg-pink-700 hover:bg-pink-800 text-white px-8 py-3 text-sm font-medium uppercase tracking-wide transition-all duration-300 transform hover:scale-105 rounded-md hover:shadow-[0_0_25px_rgba(190,24,93,0.6)]">
                    Join Wallet
                  </button>
                </div>

                {/* Social Media Icons */}
                <div className="flex items-center justify-center space-x-6">
                  <a href="#" className="text-white/60 hover:text-white transition-all duration-300 transform hover:scale-110"><Github size={20} /></a>
                  <a href="#" className="text-white/60 hover:text-white transition-all duration-300 transform hover:scale-110"><Twitter size={20} /></a>
                  <a href="#" className="text-white/60 hover:text-white transition-all duration-300 transform hover:scale-110"><Disc size={20} /></a>
                </div>
              </div>

              {/* Mobile Stats - Bottom */}
              <div className="lg:hidden mt-24 text-center">
                <div className="flex justify-center space-x-8">
                   <Stat label="Nodes" value="1,428" delay={400}/>
                   <Stat label="Data" value="3.2 PB" delay={600} />
                   <Stat label="Uptime" value="99.9%" delay={800} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}