'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Users, RefreshCw } from 'lucide-react'
import TopicsList from '@/components/TopicsList'
import AboutSection from '@/components/AboutSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberStepper } from '@/components/ui/number-stepper'
import { Topic } from '@/types'
import { generateTopics } from '@/lib/api-client'

export default function Home() {
  const [participants, setParticipants] = useState<number>(1)
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
      const topicTexts = await generateTopics(participants)
      
      const newTopics: Topic[] = topicTexts.map((text, i) => ({
        id: `topic-${Date.now()}-${i}`,
        text,
        associations: null,
        associationGeneratedAt: null
      }))
      
      setTopics(newTopics)
      setHasGenerated(true)
      
      // Save to session storage
      sessionStorage.setItem('topics', JSON.stringify(newTopics))
      sessionStorage.setItem('topicsGeneratedAt', new Date().toISOString())
    } catch (err) {
      setError('お題の生成に失敗しました。しばらく待ってからお試しください。')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
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
                  参加人数の設定
                </CardTitle>
                <CardDescription>
                  スピーチ練習に参加する人数を入力してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
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
                  <Button
                    onClick={handleGenerateTopics}
                    disabled={isGenerating}
                    isLoading={isGenerating}
                    className="w-full sm:w-auto sm:ml-auto"
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
                    {isGenerating ? '生成中...' : hasGenerated ? 'お題を再生成' : 'お題を生成'}
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