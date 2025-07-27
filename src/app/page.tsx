'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Users, RefreshCw, Loader2, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import TopicsList from '@/components/TopicsList'
import AboutSection from '@/components/AboutSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberStepper } from '@/components/ui/number-stepper'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Topic, SpeechStyle } from '@/types'

export default function Home() {
  const router = useRouter()
  const [participants, setParticipants] = useState<number>(1)
  const [speechStyle, setSpeechStyle] = useState<SpeechStyle>('none')
  const [topics, setTopics] = useState<Topic[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedTopics = sessionStorage.getItem('topics')
        const generatedAt = sessionStorage.getItem('topicsGeneratedAt')
        
        if (cachedTopics && generatedAt) {
          const parsedTopics = JSON.parse(cachedTopics) as Topic[]
          setTopics(parsedTopics)
          setHasGenerated(true)
        }
      } catch (err) {
        console.error('Failed to load cached data:', err)
      }
    }

    loadCachedData()
  }, [])

  const handleGenerateTopics = async () => {
    if (hasGenerated) {
      const confirmed = confirm('お題を再生成しますか？既存のお題は削除されます。')
      if (!confirmed) return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      // Call the new complete session generation API
      const response = await fetch('/api/generate-complete-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants, speechStyle })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'セッションの作成に失敗しました')
      }

      const data = await response.json()
      
      // Clear session storage since we're redirecting
      sessionStorage.removeItem('topics')
      sessionStorage.removeItem('topicsGeneratedAt')
      
      // Redirect to the session page
      router.push(data.redirectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お題の生成に失敗しました。しばらく待ってからお試しください。')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[480px] mx-auto px-4 py-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-[#0052CC]" />
            <h1 className="text-2xl font-bold text-[#172B4D]">
              ChaplinSpeech
            </h1>
          </div>
          <p className="text-sm text-[#6B778C] leading-5">
            チャップリン方式でスピーチ力を鍛えよう
          </p>
        </motion.header>

        <main className="space-y-6">
          {/* 人数入力セクション */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-[#6B778C]" />
                  練習の設定
                </CardTitle>
                <CardDescription>
                  スピーチ練習の参加人数とスタイルを設定してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 参加人数 */}
                <div>
                  <h3 className="text-sm font-medium text-[#172B4D] mb-3">参加人数</h3>
                  <div className="flex items-center gap-3">
                    <NumberStepper
                      value={participants}
                      onChange={setParticipants}
                      min={1}
                      max={10}
                      disabled={isGenerating}
                    />
                    <span className="text-[#172B4D] text-base font-medium">人</span>
                  </div>
                </div>

                {/* スピーチスタイル */}
                <div>
                  <h3 className="text-sm font-medium text-[#172B4D] mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#6B778C]" />
                    スピーチスタイル
                  </h3>
                  <p className="text-xs text-[#172B4D] mb-3">
                    生成されるお題とスピーチ例のスタイルを選択してください
                  </p>
                  <RadioGroup
                    value={speechStyle}
                    onValueChange={(value) => setSpeechStyle(value as SpeechStyle)}
                    disabled={isGenerating}
                  >
                    <RadioGroupItem value="none">指定なし</RadioGroupItem>
                    <RadioGroupItem value="funny">面白い話</RadioGroupItem>
                    <RadioGroupItem value="moving">感動する話</RadioGroupItem>
                    <RadioGroupItem value="educational">勉強になる話</RadioGroupItem>
                    <RadioGroupItem value="surprising">びっくりする話</RadioGroupItem>
                  </RadioGroup>
                </div>

                {/* 生成ボタン */}
                <div className="pt-2">
                  <Button
                    onClick={handleGenerateTopics}
                    disabled={isGenerating}
                    isLoading={isGenerating}
                    className="w-full"
                    variant={hasGenerated ? "secondary" : "primary"}
                  >
                    {!isGenerating && (
                      <>
                        {hasGenerated ? (
                          <RefreshCw className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </>
                    )}
                    {isGenerating ? 'セッションを作成中...' : hasGenerated ? 'お題を再生成' : 'お題を生成'}
                  </Button>
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <div className="text-sm text-[#DE350B] bg-[#FFEBE6] border border-[#FFBDAD] px-3 py-2 rounded">
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* お題リスト */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TopicsList 
              topics={topics}
              participants={participants}
              hasGenerated={hasGenerated}
              onTopicsUpdate={setTopics}
            />
          </motion.div>
        </main>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <AboutSection />
        </motion.div>
      </div>
    </div>
  )
}