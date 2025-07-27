import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { ParticipantContent } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; participantId: string }> }
) {
  try {
    const { sessionId, participantId } = await params
    
    // Check if Redis is available
    const isRedisAvailable = await redis.isAvailable()
    if (!isRedisAvailable) {
      return NextResponse.json(
        { content: null, error: 'セッションストレージが利用できません' },
        { status: 503 }
      )
    }

    // Fetch participant content from Redis
    const content = await redis.get<ParticipantContent>(`session:${sessionId}:participant:${participantId}`)
    
    return NextResponse.json({ content: content || null })
  } catch (error) {
    console.error('Participant content fetch error:', error)
    return NextResponse.json(
      { content: null, error: 'コンテンツの取得に失敗しました' },
      { status: 500 }
    )
  }
}