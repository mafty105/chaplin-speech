import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { Session, SessionResponse } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    
    // Check if Redis is available
    const isRedisAvailable = await redis.isAvailable()
    if (!isRedisAvailable) {
      return NextResponse.json(
        { session: null, error: 'セッションストレージが利用できません' },
        { status: 503 }
      )
    }

    // Fetch session from Redis
    const session = await redis.get<Session>(`session:${sessionId}`)
    
    if (!session) {
      return NextResponse.json(
        { session: null, error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    // Check if session has expired
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { session: null, error: 'セッションの有効期限が切れています' },
        { status: 410 }
      )
    }

    return NextResponse.json({ session } as SessionResponse)
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { session: null, error: 'セッションの取得に失敗しました' },
      { status: 500 }
    )
  }
}