'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SpeechExample } from '@/types'
import { generateSpeechExample } from '@/app/actions'

interface SpeechExampleSectionProps {
  sessionId: string
  participantId: string
  speechExample: SpeechExample | null
  showSection: boolean
  duration: 1 | 2 | 3
}

export function SpeechExampleSection({ sessionId, participantId, speechExample: initialExample, showSection, duration }: SpeechExampleSectionProps) {
  const [speechExample, setSpeechExample] = useState(initialExample)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateSpeech = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateSpeechExample(sessionId, participantId, duration)
      // Update the UI immediately with the new speech example
      setSpeechExample(result.speechExample)
    } catch (err: any) {
      // NEXT_REDIRECT is not an actual error - it's how Next.js handles redirects
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        // The redirect is happening, no need to set loading to false
        return
      }
      setError(err instanceof Error ? err.message : 'スピーチ例の生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!showSection) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">スピーチ例</CardTitle>
        <CardDescription>関連キーワードを使った{duration}分間スピーチの例です</CardDescription>
      </CardHeader>
      <CardContent>
        {!speechExample ? (
          <Button
            onClick={handleGenerateSpeech}
            disabled={isGenerating}
            isLoading={isGenerating}
            className="w-full"
            variant="primary"
          >
            {!isGenerating && <Sparkles className="w-4 h-4" />}
            スピーチ例を生成
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Speech content without section labels */}
            <div className="space-y-3">
              <p className="text-[#172B4D] leading-relaxed break-words">
                {speechExample.speech.opening}
              </p>
              {speechExample.speech.body.map((paragraph, index) => (
                <p key={index} className="text-[#172B4D] leading-relaxed break-words">
                  {paragraph}
                </p>
              ))}
              <p className="text-[#172B4D] leading-relaxed break-words">
                {speechExample.speech.closing}
              </p>
            </div>

            {/* Tips */}
            {speechExample.tips && speechExample.tips.length > 0 && (
              <div className="mt-6 p-4 bg-[#F4F5F7] rounded-lg">
                <h4 className="font-medium text-[#172B4D] mb-2">💡 スピーチのコツ</h4>
                <ul className="space-y-1">
                  {speechExample.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-[#172B4D]">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleGenerateSpeech}
              disabled={isGenerating}
              isLoading={isGenerating}
              variant="subtle"
              size="sm"
              className="mt-4"
            >
              {!isGenerating && <RefreshCw className="w-3 h-3" />}
              別の例を生成
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