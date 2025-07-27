import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { SessionResponse } from '@/types'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SessionResponse>> {
  try {
    const { id: sessionId } = await params
    
    // Validate session ID format
    if (!sessionId || sessionId.length !== 8) {
      return NextResponse.json(
        { session: null, error: 'セッションIDが無効です' },
        { status: 400 }
      )
    }

    // Check if Redis is available
    const isRedisAvailable = await redis.isAvailable()
    if (!isRedisAvailable) {
      return NextResponse.json(
        { session: null, error: '共有機能は現在利用できません' },
        { status: 503 }
      )
    }

    // Retrieve session from Redis
    const key = `session:${sessionId}`
    const session = await redis.get(key)
    
    if (!session) {
      return NextResponse.json(
        { session: null, error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }
    
    // Get TTL to check if session is about to expire
    const ttl = await redis.ttl(key)
    if (ttl > 0 && ttl < 300) { // Less than 5 minutes
      console.log(`Session ${sessionId} expires in ${ttl} seconds`)
    }
    
    return NextResponse.json({ session })
    
  } catch (error) {
    console.error('Session retrieval error:', error)
    
    return NextResponse.json(
      { session: null, error: 'セッションの取得に失敗しました' },
      { status: 500 }
    )
  }
}