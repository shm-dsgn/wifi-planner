"use client";

import { Suspense } from "react";
import Footer from "@/components/Layout/Footer";
import dynamic from "next/dynamic";

// Use dynamic import with SSR disabled for Konva
const WifiSimulator = dynamic(() => import("@/components/WifiSimulator"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center container max-w-9xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-2 items-center justify-center">
          <h1 className="text-2xl font-medium">AirMap</h1>
          <p className="text-gray-500 text-sm">
            Design your floor plan and find the best WiFi router spot for
            maximum coverage.
          </p>
        </div>
        <Suspense fallback={<div>Loading simulator...</div>}>
          <WifiSimulator />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
