"use client";

import { Suspense } from "react";
import Footer from "@/components/Layout/Footer";
import dynamic from "next/dynamic";
import { Wifi } from "lucide-react";

// Use dynamic import with SSR disabled for Konva
const WifiSimulator = dynamic(() => import("@/components/WifiSimulator"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <div className="flex-grow container max-w-9xl mx-auto px-4 py-8">
        <div className="flex items-end gap-4 mb-6">
          <Wifi className="w-10 h-10 text-blue-500 p-1 bg-blue-200 rounded-md border-blue-500 border-2" />
          <h1 className="text-3xl font-bold">WiFi Planner</h1>
        </div>
        <p className="mb-6">
          Design your floor plan and find the optimal placement for your WiFi
          router to maximize signal strength throughout your home.
        </p>
        <Suspense fallback={<div>Loading simulator...</div>}>
          <WifiSimulator />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
