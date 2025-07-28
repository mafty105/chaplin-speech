'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  User,
  Loader2,
  Share2,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'
import { Session, SessionResponse, SpeechStyle } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { generateQRCode } from '@/lib/api-client'
import {
  SessionPageSkeleton,
  SpeechStyleSkeleton,
  SessionInfoSkeleton,
  ParticipantListSkeleton,
  ShareSectionSkeleton,
} from '@/components/SessionPageSkeleton'

interface SessionPageProps {
  params: Promise<{ sessionId: string }>
}

export default function SessionPage({ params: paramsPromise }: SessionPageProps) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string>('')
  const [speechStyle, setSpeechStyle] = useState<SpeechStyle>('none')

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${params.sessionId}`)
        if (!response.ok) {
          throw new Error('セッションが見つかりません')
        }

        const data: SessionResponse = await response.json()
        if (data.error || !data.session) {
          throw new Error(data.error || 'セッションの読み込みに失敗しました')
        }

        setSession(data.session)
        setSpeechStyle(data.session.speechStyle || 'none')

        // Generate share URL
        const baseUrl = window.location.origin
        const url = `${baseUrl}/session/${params.sessionId}`
        setShareUrl(url)

        // Generate QR code
        const qrCode = await generateQRCode(url)
        setQrCodeUrl(qrCode)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [params.sessionId])

  const handleGenerateTopics = async () => {
    if (!session) return

    setIsGeneratingTopics(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: params.sessionId,
          speechStyle: speechStyle,
        }),
      })

      if (!response.ok) {
        throw new Error('お題の生成に失敗しました')
      }

      // Refresh session data
      const sessionResponse = await fetch(`/api/sessions/${params.sessionId}`)
      const data: SessionResponse = await sessionResponse.json()
      if (data.session) {
        setSession(data.session)
        // Update local speechStyle to match what was saved
        setSpeechStyle(data.session.speechStyle || 'none')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お題の生成に失敗しました')
    } finally {
      setIsGeneratingTopics(false)
    }
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
  }

  const hasTopics = session ? Object.keys(session.topics).length > 0 : false

  return (
    <div className="min-h-screen">
      <div className="max-w-[600px] mx-auto px-4 py-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-4 text-[#0052CC] hover:text-[#0065FF] transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">ChaplinSpeech</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#172B4D]">スピーチ練習セッション</h1>
        </motion.header>

        {error ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-[#DE350B]">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <SessionPageSkeleton />
        ) : !session ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-[#DE350B]">
                <AlertCircle className="w-5 h-5" />
                <p>セッションが見つかりません</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <main className="space-y-6">
          {/* Speech Style Selection */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
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
                  disabled={isGeneratingTopics || hasTopics}
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
          </motion.div>

          {/* Session Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">セッション情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[#6B778C]" />
                  <span className="text-[#6B778C]">作成日時:</span>
                  <span className="text-[#172B4D]">
                    {new Date(session.createdAt).toLocaleString('ja-JP')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-[#6B778C]" />
                  <span className="text-[#6B778C]">参加人数:</span>
                  <span className="text-[#172B4D]">{session.participants.length}人</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Topics Generation */}
          {!hasTopics && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">お題の生成</CardTitle>
                  <CardDescription>参加者ごとにスピーチのお題を生成します</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleGenerateTopics}
                    disabled={isGeneratingTopics}
                    isLoading={isGeneratingTopics}
                    className="w-full"
                    variant="primary"
                  >
                    {!isGeneratingTopics && <Sparkles className="w-4 h-4" />}
                    お題を生成
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Participants List */}
          {hasTopics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">参加者一覧</CardTitle>
                  <CardDescription>各参加者のページでスピーチ練習を開始できます</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {session.participants.map((participant) => (
                      <Link
                        key={participant.id}
                        href={`/session/${params.sessionId}/${participant.id}`}
                        className="block group"
                      >
                        <Card className="border-[#DFE1E6] hover:border-[#0052CC] hover:shadow-md transition-all cursor-pointer group-hover:bg-[#F7F8F9]">
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-[#E2E5E9] group-hover:bg-[#0052CC] transition-colors flex items-center justify-center">
                                  <User className="w-5 h-5 text-[#6B778C] group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-[#172B4D] group-hover:text-[#0052CC] transition-colors truncate">
                                    {participant.name}
                                  </p>
                                  {session.topics[participant.id] && (
                                    <p className="text-sm text-[#6B778C] truncate">
                                      お題: {session.topics[participant.id]}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[#0052CC] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                  練習を開始
                                </span>
                                <div className="w-8 h-8 rounded-full bg-[#F4F5F7] group-hover:bg-[#0052CC] transition-colors flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-[#6B778C] group-hover:text-white transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
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
                      コピー
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
          </motion.div>

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
        )}
      </div>
    </div>
  )
}
