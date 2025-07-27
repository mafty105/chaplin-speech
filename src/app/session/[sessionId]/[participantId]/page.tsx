'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, User, Loader2, MessageSquare, Lightbulb, ArrowLeft, RefreshCw } from 'lucide-react'
import { Session, SessionResponse, ParticipantContent, SpeechExample } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ParticipantPageProps {
  params: Promise<{ 
    sessionId: string
    participantId: string
  }>
}

export default function ParticipantPage({ params: paramsPromise }: ParticipantPageProps) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [participant, setParticipant] = useState<Session['participants'][0] | null>(null)
  const [content, setContent] = useState<ParticipantContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false)
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch session and participant data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session
        const response = await fetch(`/api/sessions/${params.sessionId}`)
        if (!response.ok) {
          throw new Error('セッションが見つかりません')
        }
        
        const data: SessionResponse = await response.json()
        if (data.error || !data.session) {
          throw new Error(data.error || 'セッションの読み込みに失敗しました')
        }
        
        setSession(data.session)
        
        // Find participant
        const currentParticipant = data.session.participants.find(
          p => p.id === params.participantId
        )
        
        if (!currentParticipant) {
          throw new Error('参加者が見つかりません')
        }
        
        setParticipant(currentParticipant)
        
        // Fetch participant content
        const contentResponse = await fetch(
          `/api/sessions/${params.sessionId}/participants/${params.participantId}`
        )
        
        if (contentResponse.ok) {
          const contentData = await contentResponse.json()
          setContent(contentData.content)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.sessionId, params.participantId])

  const handleGenerateKeywords = async () => {
    setIsGeneratingKeywords(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: params.sessionId,
          participantId: params.participantId
        })
      })

      if (!response.ok) {
        throw new Error('関連キーワードの生成に失敗しました')
      }

      const data = await response.json()
      setContent(prev => ({
        ...prev,
        keywords: data.keywords,
        keywordsGeneratedAt: new Date().toISOString(),
        speechExample: null,
        speechGeneratedAt: null
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '関連キーワードの生成に失敗しました')
    } finally {
      setIsGeneratingKeywords(false)
    }
  }

  const handleGenerateSpeech = async () => {
    setIsGeneratingSpeech(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate-speech-example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: params.sessionId,
          participantId: params.participantId
        })
      })

      if (!response.ok) {
        throw new Error('スピーチ例の生成に失敗しました')
      }

      const data = await response.json()
      setContent(prev => ({
        ...prev!,
        speechExample: data.speech,
        speechGeneratedAt: new Date().toISOString()
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スピーチ例の生成に失敗しました')
    } finally {
      setIsGeneratingSpeech(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
      </div>
    )
  }

  if (error || !session || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3">
              <p className="text-[#DE350B]">{error || 'データが見つかりません'}</p>
              <Button onClick={() => router.push('/')} variant="secondary">
                ホームに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const topic = session.topics[participant.id]

  return (
    <div className="min-h-screen">
      <div className="max-w-[600px] mx-auto px-4 py-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href={`/session/${params.sessionId}`}
            className="inline-flex items-center gap-2 mb-4 text-[#0052CC] hover:text-[#0065FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">セッション管理に戻る</span>
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-[#0052CC]" />
              <h1 className="text-2xl font-bold text-[#172B4D]">
                スピーチ練習
              </h1>
            </div>
            <p className="text-sm text-[#6B778C]">
              {participant.name}
            </p>
          </div>
        </motion.header>

        <main className="space-y-6">
          {/* Topic Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  お題
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-[#172B4D]">{topic}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Keywords Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
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
                {!content?.keywords ? (
                  <Button
                    onClick={handleGenerateKeywords}
                    disabled={isGeneratingKeywords}
                    isLoading={isGeneratingKeywords}
                    className="w-full"
                    variant="primary"
                  >
                    {!isGeneratingKeywords && <Sparkles className="w-4 h-4" />}
                    関連キーワードを生成
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[#172B4D]">{content.keywords}</p>
                    <Button
                      onClick={handleGenerateKeywords}
                      disabled={isGeneratingKeywords}
                      isLoading={isGeneratingKeywords}
                      variant="subtle"
                      size="sm"
                    >
                      {!isGeneratingKeywords && <RefreshCw className="w-3 h-3" />}
                      再生成
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Speech Example Section */}
          {content?.keywords && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">スピーチ例</CardTitle>
                  <CardDescription>
                    関連キーワードを使った3分間スピーチの例です
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!content.speechExample ? (
                    <Button
                      onClick={handleGenerateSpeech}
                      disabled={isGeneratingSpeech}
                      isLoading={isGeneratingSpeech}
                      className="w-full"
                      variant="primary"
                    >
                      {!isGeneratingSpeech && <Sparkles className="w-4 h-4" />}
                      スピーチ例を生成
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {/* Opening */}
                      <div>
                        <h4 className="font-medium text-[#172B4D] mb-2">導入</h4>
                        <p className="text-[#172B4D] leading-relaxed">
                          {content.speechExample.speech.opening}
                        </p>
                      </div>

                      {/* Body */}
                      <div>
                        <h4 className="font-medium text-[#172B4D] mb-2">本文</h4>
                        <div className="space-y-3">
                          {content.speechExample.speech.body.map((paragraph, index) => (
                            <p key={index} className="text-[#172B4D] leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Closing */}
                      <div>
                        <h4 className="font-medium text-[#172B4D] mb-2">結び</h4>
                        <p className="text-[#172B4D] leading-relaxed">
                          {content.speechExample.speech.closing}
                        </p>
                      </div>

                      {/* Tips */}
                      {content.speechExample.tips && content.speechExample.tips.length > 0 && (
                        <div className="mt-6 p-4 bg-[#F4F5F7] rounded-lg">
                          <h4 className="font-medium text-[#172B4D] mb-2">💡 スピーチのコツ</h4>
                          <ul className="space-y-1">
                            {content.speechExample.tips.map((tip, index) => (
                              <li key={index} className="text-sm text-[#172B4D]">
                                • {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button
                        onClick={handleGenerateSpeech}
                        disabled={isGeneratingSpeech}
                        isLoading={isGeneratingSpeech}
                        variant="subtle"
                        size="sm"
                        className="mt-4"
                      >
                        {!isGeneratingSpeech && <RefreshCw className="w-3 h-3" />}
                        別の例を生成
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-[#DE350B] bg-[#FFEBE6] border border-[#FFBDAD] px-3 py-2 rounded"
            >
              {error}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}