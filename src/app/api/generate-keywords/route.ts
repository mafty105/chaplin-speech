import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { redis } from '@/lib/redis'
import { Session, ParticipantContent } from '@/types'

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

interface RequestBody {
  sessionId: string
  participantId: string
}

interface KeywordsResponse {
  keywords: string
}

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    temperature: 0.9,
    maxOutputTokens: 500,
    responseMimeType: 'application/json'
  }
})

// Fallback associations for when API is unavailable
const fallbackAssociations: Record<string, string> = {
  'あなたにとっての人生': '挑戦、成長、家族、幸せ、目標',
  '学生時代のこと': '友達、部活、勉強、青春、思い出',
  '最近ハマっていること': '趣味、楽しみ、発見、時間、充実',
  '好きな動物': '癒し、可愛い、性格、ペット、自然',
  '理想の休日': 'リラックス、趣味、家族、旅行、充実',
  '大切にしている言葉': '座右の銘、励まし、教訓、成長、人生',
  '子供の頃の夢': '憧れ、将来、純粋、挑戦、成長',
  '今年の目標': '成長、挑戦、計画、努力、達成',
  '感謝している人': '恩師、家族、友人、支え、成長',
  '忘れられない思い出': '感動、経験、成長、人生、宝物'
}

export async function POST(request: NextRequest): Promise<NextResponse<KeywordsResponse | { error: string }>> {
  try {
    const body = await request.json() as RequestBody
    const { sessionId, participantId } = body

    // Fetch session from Redis
    const session = await redis.get<Session>(`session:${sessionId}`)
    if (!session) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    // Find participant and topic
    const participant = session.participants.find(p => p.id === participantId)
    if (!participant) {
      return NextResponse.json(
        { error: '参加者が見つかりません' },
        { status: 404 }
      )
    }

    const topic = session.topics[participantId]
    if (!topic) {
      return NextResponse.json(
        { error: 'お題が見つかりません' },
        { status: 404 }
      )
    }

    const prompt = `
「${topic}」というお題から連想されるキーワードを5個生成してください。

要件:
- チャップリン方式のスピーチで使いやすい言葉
- 具体的で話を広げやすいキーワード
- お題との関連性が明確
- 1-2語の名詞または形容詞
- カンマ区切りで出力

良い例（「好きな動物」の場合）: 癒し、可愛い、性格、ペット、自然
悪い例: 動物、生き物、好き、嫌い、普通 ← 抽象的すぎる

出力形式:
以下のJSON形式で出力してください:
{
  "keywords": "キーワード1、キーワード2、キーワード3、キーワード4、キーワード5"
}
`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response
      const responseData = JSON.parse(response.text()) as { keywords: string }
      
      if (!responseData.keywords) {
        throw new Error('Invalid response format')
      }

      // Store in Redis
      const content: ParticipantContent = {
        keywords: responseData.keywords,
        keywordsGeneratedAt: new Date().toISOString(),
        speechExample: null,
        speechGeneratedAt: null
      }
      
      await redis.set(
        `session:${sessionId}:participant:${participantId}`,
        content,
        24 * 60 * 60 // 24 hours
      )
      
      return NextResponse.json({ keywords: responseData.keywords })
      
    } catch (apiError) {
      console.error('Keywords generation failed:', apiError)
      
      // Use fallback
      const defaultKeywords = '挑戦、成長、経験、学び、未来'
      const keywords = fallbackAssociations[topic] || defaultKeywords
      
      // Store fallback in Redis
      const content: ParticipantContent = {
        keywords,
        keywordsGeneratedAt: new Date().toISOString(),
        speechExample: null,
        speechGeneratedAt: null
      }
      
      await redis.set(
        `session:${sessionId}:participant:${participantId}`,
        content,
        24 * 60 * 60 // 24 hours
      )
      
      return NextResponse.json({ keywords })
    }
  } catch (error) {
    console.error('Route handler error:', error)
    return NextResponse.json(
      { error: '関連キーワードの生成に失敗しました' },
      { status: 500 }
    )
  }
}