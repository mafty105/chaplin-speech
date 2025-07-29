import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, User, Clock, AlertCircle } from 'lucide-react'
import { redis } from '@/lib/redis'
import { Session } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SpeechStyleSelector } from '@/components/SpeechStyleSelector'
import { ShareSection } from '@/components/ShareSection'

interface SessionPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function SessionPage({ params: paramsPromise }: SessionPageProps) {
  const params = await paramsPromise
  
  // Fetch session data server-side
  const session = await redis.get(`session:${params.sessionId}`) as Session | null
  
  if (!session) {
    notFound()
  }

  const hasTopics = Object.keys(session.topics).length > 0

  return (
    <div className="min-h-screen">
      <div className="max-w-[600px] mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-4 text-[#0052CC] hover:text-[#0065FF]"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">ChaplinSpeech</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#172B4D]">スピーチ練習セッション</h1>
        </header>

        <main className="space-y-6">
          {/* Speech Style Selection and Topic Generation */}
          <SpeechStyleSelector 
            sessionId={params.sessionId} 
            initialSpeechStyle={session.speechStyle}
            initialDuration={session.speechDuration}
            hasTopics={hasTopics}
          />

          {/* Participants List */}
          {hasTopics && (
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
                      <Card className="border-[#DFE1E6] hover:border-[#0052CC] hover:shadow-md cursor-pointer group-hover:bg-[#F7F8F9]">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-[#E2E5E9] group-hover:bg-[#0052CC] flex items-center justify-center">
                                <User className="w-5 h-5 text-[#6B778C] group-hover:text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[#172B4D] group-hover:text-[#0052CC] truncate">
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
                              <span className="text-sm text-[#0052CC] font-medium opacity-0 group-hover:opacity-100">
                                練習を開始
                              </span>
                              <div className="w-8 h-8 rounded-full bg-[#F4F5F7] group-hover:bg-[#0052CC] flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-[#6B778C] group-hover:text-white"
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
          )}

          {/* Share Section */}
          <ShareSection sessionId={params.sessionId} />
        </main>
      </div>
    </div>
  )
}