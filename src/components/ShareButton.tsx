'use client'

import { useState } from 'react'
import { Share2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import QRCodeModal from '@/components/QRCodeModal'
import { Topic, CreateSessionResponse } from '@/types'

interface ShareButtonProps {
  topics: Topic[]
  participants: number
  disabled?: boolean
}

export default function ShareButton({ topics, participants, disabled }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [sessionData, setSessionData] = useState<CreateSessionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleShare = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topics,
          participants
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '共有リンクの作成に失敗しました')
      }

      setSessionData(data)
      setShowModal(true)
    } catch (err) {
      console.error('Share error:', err)
      setError(err instanceof Error ? err.message : '共有リンクの作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleShare}
        disabled={disabled || isLoading || topics.length === 0}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            共有準備中...
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            共有する
          </>
        )}
      </Button>

      {error && (
        <div className="text-sm text-[#DE350B] mt-2">
          {error}
        </div>
      )}

      {showModal && sessionData && (
        <QRCodeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          sessionData={sessionData}
        />
      )}
    </>
  )
}