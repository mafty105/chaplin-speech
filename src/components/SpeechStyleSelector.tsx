'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Sparkles, Clock } from 'lucide-react'
import { SpeechStyle } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { generateTopics } from '@/app/actions'

interface SpeechStyleSelectorProps {
  sessionId: string
  initialSpeechStyle?: SpeechStyle
  initialDuration?: 1 | 2 | 3
  hasTopics: boolean
}

export function SpeechStyleSelector({ sessionId, initialSpeechStyle = 'none', initialDuration = 2, hasTopics }: SpeechStyleSelectorProps) {
  const router = useRouter()
  const [speechStyle, setSpeechStyle] = useState<SpeechStyle>(initialSpeechStyle)
  const [duration, setDuration] = useState<1 | 2 | 3>(initialDuration)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateTopics = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      await generateTopics(sessionId, speechStyle, duration)
      // Refresh the page to show the generated topics
      router.refresh()
    } catch (err: any) {
      // NEXT_REDIRECT is not an actual error - it's how Next.js handles redirects
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        // The redirect is happening, no need to set loading to false
        return
      }
      setError(err instanceof Error ? err.message : 'お題の生成に失敗しました')
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5" />
            スピーチスタイル
          </CardTitle>
          <CardDescription>
            生成されるお題とスピーチ例のスタイルを選択してください
            {!hasTopics && (
              <span className="block mt-1 text-xs text-[#6B778C]">
                ※スタイルは「お題を生成」ボタンをクリックした時に適用されます
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={speechStyle}
            onValueChange={(value) => setSpeechStyle(value as SpeechStyle)}
            disabled={isGenerating || hasTopics}
          >
            <RadioGroupItem value="none">指定なし</RadioGroupItem>
            <RadioGroupItem value="funny">面白い話</RadioGroupItem>
            <RadioGroupItem value="moving">感動する話</RadioGroupItem>
            <RadioGroupItem value="educational">勉強になる話</RadioGroupItem>
            <RadioGroupItem value="surprising">びっくりする話</RadioGroupItem>
          </RadioGroup>
          {hasTopics && (
            <p className="text-xs text-[#6B778C] mt-3">
              ※お題が生成済みのため、スタイルは変更できません
            </p>
          )}
        </CardContent>
      </Card>

      {/* Duration Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            スピーチの長さ
          </CardTitle>
          <CardDescription>
            スピーチ例の長さを選択してください
            {!hasTopics && (
              <span className="block mt-1 text-xs text-[#6B778C]">
                ※長さは「お題を生成」ボタンをクリックした時に適用されます
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={duration.toString()}
            onValueChange={(value) => setDuration(parseInt(value) as 1 | 2 | 3)}
            disabled={isGenerating || hasTopics}
            className="flex gap-4"
          >
            <RadioGroupItem value="1">1分</RadioGroupItem>
            <RadioGroupItem value="2">2分</RadioGroupItem>
            <RadioGroupItem value="3">3分</RadioGroupItem>
          </RadioGroup>
          {hasTopics && (
            <p className="text-xs text-[#6B778C] mt-3">
              ※お題が生成済みのため、長さは変更できません
            </p>
          )}
        </CardContent>
      </Card>

      {!hasTopics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">お題の生成</CardTitle>
            <CardDescription>参加者ごとにスピーチのお題を生成します</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateTopics}
              disabled={isGenerating}
              isLoading={isGenerating}
              className="w-full"
              variant="primary"
            >
              {!isGenerating && <Sparkles className="w-4 h-4" />}
              お題を生成
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-sm text-[#DE350B] bg-[#FFEBE6] border border-[#FFBDAD] px-3 py-2 rounded">
          {error}
        </div>
      )}
    </>
  )
}