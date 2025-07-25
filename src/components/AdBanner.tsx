'use client'

import { useEffect, useRef } from 'react'
import { AdBannerProps } from '@/types'

export default function AdBanner({ slot, width, height, format }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Google AdSense will be initialized here
    // For now, we'll show a placeholder
    // In production, this would load the actual ad
  }, [slot])

  return (
    <div 
      ref={adRef}
      className={`flex items-center justify-center bg-gray-200 text-gray-500 ${
        format === 'mobile' ? 'mx-auto' : ''
      }`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div className="text-center">
        <p className="font-semibold">広告スペース</p>
        <p className="text-sm">{slot} ({width}x{height})</p>
      </div>
    </div>
  )
}