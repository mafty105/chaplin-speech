import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { redis, SESSION_TTL } from '@/lib/redis'
import { generateQRCodeDataURL, createShareableURL } from '@/lib/qr-generator'
import { CreateSessionRequest, CreateSessionResponse, Session } from '@/types'

// Validation function
function validateRequestBody(body: any): body is CreateSessionRequest {
  return (
    Array.isArray(body.topics) &&
    body.topics.length > 0 &&
    body.topics.every((t: any) => 
      typeof t.id === 'string' && 
      typeof t.text === 'string'
    ) &&
    typeof body.participants === 'number' &&
    body.participants >= 1 &&
    body.participants <= 10
  )
}

/**
 * Generate unique session ID with collision check
 */
async function generateUniqueSessionId(): Promise<string> {
  const maxAttempts = 10
  
  for (let i = 0; i < maxAttempts; i++) {
    const sessionId = nanoid(8)
    const key = `session:${sessionId}`
    
    // Check if this ID already exists
    const exists = await redis.exists(key)
    if (!exists) {
      return sessionId
    }
  }
  
  // If we couldn't generate a unique ID after 10 attempts, throw error
  throw new Error('セッションIDの生成に失敗しました')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    if (!validateRequestBody(body)) {
      return NextResponse.json(
        { error: 'リクエストデータが不正です' },
        { status: 400 }
      )
    }

    // Check if Redis is available
    const isRedisAvailable = await redis.isAvailable()
    if (!isRedisAvailable) {
      return NextResponse.json(
        { error: '共有機能は現在利用できません' },
        { status: 503 }
      )
    }

    // Generate unique session ID
    const sessionId = await generateUniqueSessionId()
    const key = `session:${sessionId}`
    
    // Calculate expiration time
    const createdAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + SESSION_TTL * 1000).toISOString()
    
    // Create session object
    const session: Session = {
      id: sessionId,
      topics: body.topics,
      participants: body.participants,
      createdAt,
      createdBy: body.createdBy,
      expiresAt
    }
    
    // Store in Redis
    const saved = await redis.set(key, session, SESSION_TTL)
    if (!saved) {
      return NextResponse.json(
        { error: 'セッションの保存に失敗しました' },
        { status: 500 }
      )
    }
    
    // Generate QR code and shareable URL
    const shareUrl = createShareableURL(sessionId)
    const qrCodeUrl = await generateQRCodeDataURL(shareUrl)
    
    // Create response
    const response: CreateSessionResponse = {
      sessionId,
      qrCodeUrl,
      shareUrl,
      expiresAt
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Session creation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'セッションの作成に失敗しました'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}