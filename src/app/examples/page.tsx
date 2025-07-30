'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Sparkles, MessageSquare, ArrowRight, Lightbulb, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Topic } from '@/types'
import { generateSpeechAction } from '@/app/actions'

interface SpeechData {
  speech: {
    opening: string
    body: string[]
    closing: string
  }
  tips: string[]
}

interface GeneratedSpeech extends SpeechData {
  index: number
  loading?: boolean
  error?: string
}

export default function ExamplesPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [speeches, setSpeeches] = useState<GeneratedSpeech[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingAll, setGeneratingAll] = useState(false)

  useEffect(() => {
    // Load topics from session storage
    const loadTopics = () => {
      try {
        const cachedTopics = sessionStorage.getItem('topics')
        if (cachedTopics) {
          const parsedTopics = JSON.parse(cachedTopics) as Topic[]
          setTopics(parsedTopics)
        }
      } catch (err) {
        console.error('Failed to load topics:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTopics()
  }, [])

  // Generate speech for the topic
  const generateSpeechForTopic = async (topic: Topic, index: number): Promise<GeneratedSpeech> => {
    try {
      const speechData = await generateSpeechAction(
        topic.text,
        topic.associations || ''  // Pass empty string if no associations
      )
      return { ...speechData, index, loading: false }
    } catch (error) {
      return { 
        index, 
        loading: false, 
        error: 'スピーチの生成に失敗しました',
        speech: { opening: '', body: [], closing: '' },
        tips: []
      }
    }
  }

  // Generate speeches for all topics
  const generateSpeeches = async () => {
    if (topics.length === 0) return

    setGeneratingAll(true)
    // Initialize all speeches with loading state
    setSpeeches(topics.map((_, index) => ({ 
      index, 
      loading: true, 
      speech: { opening: '', body: [], closing: '' }, 
      tips: [] 
    })))

    // Generate speeches in parallel and update each one as it completes
    const promises = topics.map(async (topic, index) => {
      const speechData = await generateSpeechForTopic(topic, index)
      // Update this specific speech when it's done
      setSpeeches(prev => prev.map(s => 
        s.index === index ? speechData : s
      ))
      return speechData
    })
    
    await Promise.all(promises)
    setGeneratingAll(false)
  }

  // Auto-generate speeches when topics are loaded
  useEffect(() => {
    if (topics.length > 0 && speeches.length === 0) {
      // Initialize all speeches with loading state immediately
      const initialSpeeches = topics.map((_, index) => ({ 
        index, 
        loading: true, 
        speech: { opening: '', body: [], closing: '' }, 
        tips: [] 
      }))
      setSpeeches(initialSpeeches)
      
      // Generate speeches for each topic
      topics.forEach(async (topic, index) => {
        try {
          const speechData = await generateSpeechAction(
            topic.text,
            topic.associations || ''  // Pass empty string if no associations
          )
          setSpeeches(prev => prev.map(s => 
            s.index === index ? { ...speechData, index, loading: false } : s
          ))
        } catch (error) {
          setSpeeches(prev => prev.map(s => 
            s.index === index ? { 
              index, 
              loading: false, 
              error: 'スピーチの生成に失敗しました',
              speech: { opening: '', body: [], closing: '' },
              tips: []
            } : s
          ))
        }
      })
    }
  }, [topics])

  // Regenerate a specific speech
  const regenerateSpeech = async (index: number) => {
    if (index >= topics.length) return

    const topic = topics[index]

    setSpeeches(prev => prev.map(s => 
      s.index === index ? { ...s, loading: true } : s
    ))

    const newSpeech = await generateSpeechForTopic(topic, index)
    
    setSpeeches(prev => prev.map(s => 
      s.index === index ? newSpeech : s
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052CC] mx-auto"></div>
          <p className="mt-4">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFBFC]">
        <div className="max-w-[480px] mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="subtle" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3" />
              <p className="text-black">
                まだスピーチ例を表示できるお題がありません。
              </p>
              <p className="text-sm mt-2">
                ホームに戻って、お題を生成してください。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/">
            <Button variant="subtle" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-6 h-6 text-[#FFAB00]" />
            <h1 className="text-2xl font-bold text-[#172B4D]">
              スピーチ例
            </h1>
          </div>
          <p className="text-sm leading-5">
            生成された各お題についてスピーチ例を表示します
          </p>
        </header>


        {/* Regenerate All Button */}
        <div className="mb-6 text-right">
          <Button
            variant="subtle"
            size="sm"
            onClick={generateSpeeches}
            disabled={generatingAll}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            全て再生成
          </Button>
        </div>

        {/* Generated Speeches */}
        <div className="space-y-6">
          {speeches.map((speech, index) => (
            <div
              key={`speech-${speech.index}`}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-lg">
                      <Sparkles className="w-5 h-5 text-[#FFAB00]" />
                      「{topics[speech.index]?.text}」のスピーチ例
                    </span>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => regenerateSpeech(speech.index)}
                      disabled={speech.loading}
                    >
                      {speech.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          再生成
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Show associations for this topic */}
                  {topics[speech.index]?.associations && !speech.loading && !speech.error && (
                    <div className="bg-[#F4F5F7] p-3 rounded-lg">
                      <p className="text-xs font-medium mb-2">連想ワード:</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {topics[speech.index].associations!.split(' → ').map((word, idx, arr) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Badge variant="subtle" size="sm">
                              {word.trim()}
                            </Badge>
                            {idx < arr.length - 1 && (
                              <ArrowRight className="w-3 h-3" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {speech.loading ? (
                    <div className="py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#0052CC] mx-auto mb-2" />
                      <p className="text-sm">生成中...</p>
                    </div>
                  ) : speech.error ? (
                    <div className="py-8 text-center">
                      <AlertCircle className="w-6 h-6 text-[#DE350B] mx-auto mb-2" />
                      <p className="text-sm">{speech.error}</p>
                    </div>
                  ) : (
                    <>
                      {/* Speech Content */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-[#172B4D] mb-2">導入</h4>
                          <p className="text-sm text-[#172B4D] leading-6 bg-[#DEEBFF] p-3 rounded">
                            {speech.speech.opening}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-[#172B4D] mb-2">本文</h4>
                          <div className="space-y-2">
                            {speech.speech.body.map((paragraph, idx) => (
                              <p key={idx} className="text-sm text-[#172B4D] leading-6">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-[#172B4D] mb-2">締めくくり</h4>
                          <p className="text-sm text-[#172B4D] leading-6 bg-[#E3FCEF] p-3 rounded">
                            {speech.speech.closing}
                          </p>
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-[#172B4D] mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-[#FFAB00]" />
                          このスピーチのポイント
                        </h4>
                        <ul className="space-y-1">
                          {speech.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-[#36B37E] mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* General Tips */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-[#FFAB00]" />
                スピーチ作成のコツ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-[#172B4D] mb-2">1. お題ごとのスピーチ例</h4>
                  <p className="text-sm leading-5">
                    各お題について1つずつスピーチ例が生成されます。
                    連想ワードをヒントに、お題から自由に発想を広げた内容になっています。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[#172B4D] mb-2">2. スピーチのカスタマイズ</h4>
                  <p className="text-sm leading-5">
                    生成されたスピーチ例をベースに、
                    自分の体験や考えを加えてオリジナルのスピーチに仕上げましょう。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[#172B4D] mb-2">3. 連想ワードの活用</h4>
                  <p className="text-sm leading-5">
                    各スピーチに表示されている連想ワードは、
                    スピーチ作成のヒントやインスピレーションとして活用できます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}