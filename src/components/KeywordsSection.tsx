'use client'

import { useState } from 'react'
import { Lightbulb, Sparkles, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { generateKeywords } from '@/app/actions'

interface KeywordsSectionProps {
  sessionId: string
  participantId: string
  keywords: string | null
}

export function KeywordsSection({ sessionId, participantId, keywords: initialKeywords }: KeywordsSectionProps) {
  const [keywords, setKeywords] = useState(initialKeywords)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateKeywords = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      await generateKeywords(sessionId, participantId)
      // The page will be revalidated and show new keywords
    } catch (err) {
      setError(err instanceof Error ? err.message : '関連キーワードの生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          関連キーワード
        </CardTitle>
        <CardDescription>
          お題から連想される言葉を使ってスピーチを組み立てましょう
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!keywords ? (
          <Button
            onClick={handleGenerateKeywords}
            disabled={isGenerating}
            isLoading={isGenerating}
            className="w-full"
            variant="primary"
          >
            {!isGenerating && <Sparkles className="w-4 h-4" />}
            関連キーワードを生成
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-[#172B4D] break-words">{keywords}</p>
            <Button
              onClick={handleGenerateKeywords}
              disabled={isGenerating}
              isLoading={isGenerating}
              variant="subtle"
              size="sm"
            >
              {!isGenerating && <RefreshCw className="w-3 h-3" />}
              再生成
            </Button>
          </div>
        )}
        {error && (
          <p className="text-sm text-[#DE350B] mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}