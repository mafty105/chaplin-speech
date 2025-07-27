import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'
import { Session, Participant, SpeechStyle } from '@/types'

interface CreateSessionRequest {
  participants: string[] | number
  speechStyle?: SpeechStyle
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateSessionRequest
    const { participants, speechStyle } = body

    // Generate unique session ID
    let sessionId: string
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      sessionId = nanoid(10)
      isUnique = !(await redis.exists(`session:${sessionId}`))
      attempts++
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique session ID')
    }

    // Create participants
    const participantList: Participant[] = Array.isArray(participants)
      ? participants.map((name, index) => ({
          id: nanoid(8),
          name,
          topicId: `topic-${index}`
        }))
      : Array.from({ length: participants }, (_, index) => ({
          id: nanoid(8),
          name: `参加者${index + 1}`,
          topicId: `topic-${index}`
        }))

    // Create session object
    const session: Session = {
      id: sessionId!,
      participants: participantList,
      speechStyle,
      topics: {},
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    // Store session in Redis
    const stored = await redis.set(`session:${sessionId!}`, session)
    if (!stored) {
      throw new Error('Failed to store session')
    }

    // Generate redirect URL
    const redirectUrl = `/session/${sessionId!}`

    return NextResponse.json({ 
      sessionId: sessionId!,
      redirectUrl 
    })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'セッションの作成に失敗しました' },
      { status: 500 }
    )
  }
}