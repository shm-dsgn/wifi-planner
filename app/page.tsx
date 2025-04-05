"use client"

import { Suspense } from 'react'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import dynamic from 'next/dynamic'

// Use dynamic import with SSR disabled for Konva
const WifiSimulator = dynamic(
  () => import('@/components/WifiSimulator'),
  { ssr: false }
)

export default function Home() {
  return (
    <>
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">WiFi Signal Simulator</h1>
        <p className="mb-6">
          Design your floor plan and find the optimal placement for your WiFi router
          to maximize signal strength throughout your home.
        </p>
        <Suspense fallback={<div>Loading simulator...</div>}>
          <WifiSimulator />
        </Suspense>
      </div>
      <Footer/>
    </>
  )
}