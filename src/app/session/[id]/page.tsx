'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Calendar, Clock, AlertCircle, Loader2, Sparkles, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Session, EnhancedTopic } from '@/types'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function SharedSessionPage({ params }: PageProps) {
  const { id: sessionId } = use(params)
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'セッションの取得に失敗しました')
        }

        if (!data.session) {
          throw new Error('セッションが見つかりません')
        }

        setSession(data.session)
      } catch (err) {
        console.error('Session fetch error:', err)
        setError(err instanceof Error ? err.message : 'セッションの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiration = new Date(expiresAt)
    const diff = expiration.getTime() - now.getTime()
    
    if (diff <= 0) return '期限切れ'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `残り${hours}時間${minutes}分`
    }
    return `残り${minutes}分`
  }

  const handleUseTopics = () => {
    if (!session) return
    
    // Save topics to session storage
    sessionStorage.setItem('topics', JSON.stringify(session.topics))
    sessionStorage.setItem('topicsGeneratedAt', session.createdAt)
    
    // Redirect to home page
    router.push('/')
  }

  const toggleTopicExpansion = (topicId: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev)
      if (newSet.has(topicId)) {
        newSet.delete(topicId)
      } else {
        newSet.add(topicId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0052CC] mx-auto" />
          <p className="mt-4 text-[#6B778C]">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
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
              <AlertCircle className="w-12 h-12 text-[#DE350B] mx-auto mb-3" />
              <p className="text-[#172B4D] font-medium mb-2">
                {error || 'セッションが見つかりません'}
              </p>
              <p className="text-sm text-[#6B778C]">
                共有リンクが期限切れか、URLが正しくない可能性があります。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isExpired = new Date(session.expiresAt) < new Date()

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="max-w-[480px] mx-auto px-4 py-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="subtle" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-[#0052CC]" />
            <h1 className="text-2xl font-bold text-[#172B4D]">
              スピーチ練習セッション
            </h1>
          </div>
          <p className="text-sm text-[#6B778C]">
            お題と連想ワード、スピーチ例を確認できます
          </p>
        </motion.header>

        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">セッション情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-[#6B778C]" />
                  <span className="text-[#6B778C]">参加人数:</span>
                  <span className="font-medium text-[#172B4D]">{session.participants}人</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-[#6B778C]" />
                  <span className="text-[#6B778C]">作成日時:</span>
                  <span className="font-medium text-[#172B4D]">{formatDate(session.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[#6B778C]" />
                  <span className="text-[#6B778C]">有効期限:</span>
                  <span className={`font-medium ${isExpired ? 'text-[#DE350B]' : 'text-[#172B4D]'}`}>
                    {getTimeRemaining(session.expiresAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Topics List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">お題一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {session.topics.map((topic, index) => {
                  const isExpanded = expandedTopics.has(topic.id)
                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="border border-[#DFE1E6] rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleTopicExpansion(topic.id)}
                        className="w-full p-4 bg-[#F4F5F7] hover:bg-[#EBECF0] transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-2">
                            <Badge variant="subtle" size="sm" className="mt-0.5">
                              {index + 1}
                            </Badge>
                            <p className="text-sm text-[#172B4D] font-medium">{topic.text}</p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#6B778C] flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#6B778C] flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 bg-white space-y-4">
                          {/* Associations */}
                          {topic.associations && (
                            <div>
                              <h4 className="text-xs font-medium text-[#6B778C] mb-2">連想ワード</h4>
                              <p className="text-sm text-[#172B4D] font-mono bg-[#F4F5F7] p-3 rounded">
                                {topic.associations}
                              </p>
                            </div>
                          )}
                          
                          {/* Speech Example */}
                          {topic.speechExample && (
                            <div>
                              <h4 className="text-xs font-medium text-[#6B778C] mb-2 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                スピーチ例
                              </h4>
                              <div className="space-y-3">
                                <div className="bg-[#F4F5F7] p-3 rounded">
                                  <p className="text-xs font-medium text-[#6B778C] mb-1">導入</p>
                                  <p className="text-sm text-[#172B4D]">{topic.speechExample.speech.opening}</p>
                                </div>
                                
                                <div className="space-y-2">
                                  {topic.speechExample.speech.body.map((paragraph, i) => (
                                    <div key={i} className="bg-[#F4F5F7] p-3 rounded">
                                      <p className="text-xs font-medium text-[#6B778C] mb-1">本文 {i + 1}</p>
                                      <p className="text-sm text-[#172B4D]">{paragraph}</p>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="bg-[#F4F5F7] p-3 rounded">
                                  <p className="text-xs font-medium text-[#6B778C] mb-1">締めくくり</p>
                                  <p className="text-sm text-[#172B4D]">{topic.speechExample.speech.closing}</p>
                                </div>
                                
                                <div className="border-t pt-3">
                                  <p className="text-xs font-medium text-[#6B778C] mb-2">スピーチのポイント</p>
                                  <ul className="space-y-1">
                                    {topic.speechExample.tips.map((tip, i) => (
                                      <li key={i} className="text-sm text-[#172B4D] flex items-start gap-2">
                                        <span className="text-[#0052CC]">•</span>
                                        <span>{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="primary"
            className="w-full"
            onClick={handleUseTopics}
            disabled={isExpired}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            このお題を使って練習する
          </Button>
          
          {isExpired && (
            <p className="text-xs text-[#DE350B] text-center mt-2">
              このセッションは期限切れです
            </p>
          )}
          
          <p className="text-xs text-[#6B778C] text-center mt-3">
            ヒント: お題をクリックすると連想ワードとスピーチ例が表示されます
          </p>
        </motion.div>
      </div>
    </div>
  )
}