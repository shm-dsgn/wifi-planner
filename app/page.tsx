"use client";

import { Suspense } from "react";
import Footer from "@/components/Layout/Footer";
import dynamic from "next/dynamic";
import Header from "@/components/Layout/Header";

// Use dynamic import with SSR disabled for Konva
const WifiSimulator = dynamic(() => import("@/components/WifiSimulator"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Header />
      <div className="flex flex-col p-4">
        <Suspense fallback={<div>Loading simulator...</div>}>
          <WifiSimulator />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
