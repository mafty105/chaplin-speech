import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, MessageSquare, ArrowLeft } from 'lucide-react'
import { redis } from '@/lib/redis'
import { Session, ParticipantContent } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KeywordsSection } from '@/components/KeywordsSection'
import { SpeechExampleSection } from '@/components/SpeechExampleSection'

interface ParticipantPageProps {
  params: Promise<{
    sessionId: string
    participantId: string
  }>
}

async function getParticipantContent(sessionId: string, participantId: string): Promise<ParticipantContent | null> {
  try {
    const contentKey = `content:${sessionId}:${participantId}`
    const content = await redis.get(contentKey) as ParticipantContent | null
    return content
  } catch {
    return null
  }
}

export default async function ParticipantPage({ params: paramsPromise }: ParticipantPageProps) {
  const params = await paramsPromise
  
  // Fetch session data
  const session = await redis.get(`session:${params.sessionId}`) as Session | null
  
  if (!session) {
    notFound()
  }

  // Find participant
  const participant = session.participants.find(p => p.id === params.participantId)
  
  if (!participant) {
    notFound()
  }

  // Get participant content
  const content = await getParticipantContent(params.sessionId, params.participantId)
  
  const topic = session.topics[participant.id]

  return (
    <div className="min-h-screen">
      <div className="max-w-[600px] mx-auto px-4 py-8">
        <header className="mb-8">
          <Link
            href={`/session/${params.sessionId}`}
            className="inline-flex items-center gap-2 mb-4 text-[#0052CC] hover:text-[#0065FF]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">セッション管理に戻る</span>
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-[#0052CC]" />
              <h1 className="text-2xl font-bold text-[#172B4D]">スピーチ練習</h1>
            </div>
            <p className="text-sm text-[#6B778C]">{participant.name}</p>
          </div>
        </header>

        <main className="space-y-6">
          {/* Topic Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                お題
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-[#172B4D] break-words">{topic}</p>
            </CardContent>
          </Card>

          {/* Keywords Section */}
          <KeywordsSection
            sessionId={params.sessionId}
            participantId={params.participantId}
            keywords={content?.keywords || null}
          />

          {/* Speech Example Section */}
          <SpeechExampleSection
            sessionId={params.sessionId}
            participantId={params.participantId}
            speechExample={content?.speechExample || null}
            showSection={!!content?.keywords}
            duration={session.speechDuration || 2}
          />
        </main>
      </div>
    </div>
  )
}