'use client'

import { useState } from 'react'
import { X, Copy, Check, ExternalLink, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateSessionResponse } from '@/types'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  sessionData: CreateSessionResponse
}

export default function QRCodeModal({ isOpen, onClose, sessionData }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionData.shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatExpirationTime = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt)
    const now = new Date()
    const hoursRemaining = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (hoursRemaining > 1) {
      return `約${hoursRemaining}時間後に期限切れ`
    } else {
      const minutesRemaining = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60))
      return `約${minutesRemaining}分後に期限切れ`
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />
      
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-[#172B4D]">お題を共有</h2>
                <Button
                  variant="subtle"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6">
                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-[#DFE1E6]">
                    <img
                      src={sessionData.qrCodeUrl}
                      alt="QR Code"
                      className="w-56 h-56"
                    />
                  </div>
                  <p className="text-sm mt-2">
                    スキャンしてお題を共有
                  </p>
                </div>
                
                {/* Share URL */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#172B4D]">共有URL</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sessionData.shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm text-[#172B4D] font-mono bg-[#F4F5F7] border border-[#DFE1E6] rounded focus:outline-none select-all"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopy}
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          コピー済み
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          コピー
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Expiration */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatExpirationTime(sessionData.expiresAt)}</span>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => window.open(sessionData.shareUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    共有ページを開く
                  </Button>
                  <Button
                    variant="subtle"
                    onClick={onClose}
                  >
                    閉じる
                  </Button>
                </div>
              </div>
            </div>
      </div>
    </>
  )
}