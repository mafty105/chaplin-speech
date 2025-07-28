'use server'

import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'
import { Session, Participant } from '@/types'
import { redirect } from 'next/navigation'

export async function createSession(participants: string[] | number) {
  try {
    let sessionId: string = ''
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

    const participantList: Participant[] = Array.isArray(participants)
      ? participants.map((name, index) => ({
          id: nanoid(8),
          name,
          topicId: `topic-${index}`,
        }))
      : Array.from({ length: participants }, (_, index) => ({
          id: nanoid(8),
          name: `参加者${index + 1}`,
          topicId: `topic-${index}`,
        }))

    const session: Session = {
      id: sessionId,
      participants: participantList,
      speechStyle: undefined,
      topics: {},
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    }

    const stored = await redis.set(`session:${sessionId}`, session)
    if (!stored) {
      throw new Error('Failed to store session')
    }
    
    redirect(`/session/${sessionId}`)
  } catch (error) {
    console.error('Session creation error:', error)
    throw error
  }
}