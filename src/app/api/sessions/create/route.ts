import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'
import { Session, Participant, Topic } from '@/types'

interface RequestBody {
  topics: Topic[]
  participants: number
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { topics, participants } = body

    // Generate unique session ID
    let sessionId: string = ''
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      sessionId = nanoid(10)
      isUnique = !(await redis.exists(`session:${sessionId}`))
      attempts++
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique session ID' },
        { status: 500 }
      )
    }

    // Create participants
    const participantList: Participant[] = Array.from({ length: participants }, (_, index) => ({
      id: nanoid(8),
      name: `参加者${index + 1}`,
      topicId: `topic-${index}`,
    }))

    // Map topics to participants
    const topicsMap: Record<string, string> = {}
    participantList.forEach((participant, index) => {
      if (topics[index]) {
        topicsMap[participant.id] = topics[index].text
      }
    })

    // Create session
    const session: Session = {
      id: sessionId,
      participants: participantList,
      speechStyle: undefined,
      topics: topicsMap,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    // Store in Redis
    const stored = await redis.set(`session:${sessionId}`, session)
    if (!stored) {
      return NextResponse.json(
        { error: 'Failed to store session' },
        { status: 500 }
      )
    }

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
    const url = `${baseUrl}/session/${sessionId}`

    return NextResponse.json({
      sessionId,
      url,
      participants: participantList,
    })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'セッションの作成に失敗しました' },
      { status: 500 }
    )
  }
}