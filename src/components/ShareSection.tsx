'use client'

import { useState, useEffect } from 'react'
import { Share2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { generateQRCodeAction } from '@/app/actions'

interface ShareSectionProps {
  sessionId: string
}

export function ShareSection({ sessionId }: ShareSectionProps) {
  const [shareUrl, setShareUrl] = useState<string>('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Generate share URL
    const baseUrl = window.location.origin
    const url = `${baseUrl}/session/${sessionId}`
    setShareUrl(url)

    // Generate QR code
    generateQRCodeAction(url).then(result => setQrCodeUrl(result.qrCode)).catch(console.error)
  }, [sessionId])

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          共有
        </CardTitle>
        <CardDescription>このURLを共有して他の参加者を招待できます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-[#172B4D] mb-1 block">共有URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 min-w-0 px-3 py-2 border border-[#DFE1E6] rounded text-sm text-[#172B4D] bg-[#F4F5F7] truncate"
            />
            <Button onClick={copyShareUrl} variant="secondary" size="sm">
              {copied ? 'コピー済み' : 'コピー'}
            </Button>
          </div>
        </div>

        {qrCodeUrl && (
          <div className="text-center">
            <p className="text-sm font-medium text-[#172B4D] mb-3">QRコード</p>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="mx-auto"
              width={200}
              height={200}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}