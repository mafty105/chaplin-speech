import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { redis } from '@/lib/redis'
import { Session, SpeechStyle } from '@/types'

// Move API key to server-only environment variable
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

// Type definitions
interface SpeechTopicsResponse {
  topics: string[]
  isFromCache?: boolean
}

interface RequestBody {
  sessionId: string
  speechStyle: SpeechStyle
}

// Model configuration
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 1000,
    responseMimeType: 'application/json'
  }
})

// Fallback topics for when API is unavailable
const fallbackTopics = [
  'あなたにとっての人生',
  '学生時代のこと',
  '最近ハマっていること',
  '好きな動物',
  '理想の休日',
  '大切にしている言葉',
  '子供の頃の夢',
  '今年の目標',
  '感謝している人',
  '忘れられない思い出',
  '印象に残った本',
  '心に残る風景',
  'おすすめの場所',
  '影響を受けた人',
  '挑戦したいこと'
]

// Validation function
function validateRequestBody(body: any): body is RequestBody {
  return typeof body.sessionId === 'string' && 
         body.sessionId.length > 0 &&
         typeof body.speechStyle === 'string'
}

// Get style specific instructions
function getStyleInstructions(style: SpeechStyle): string {
  switch(style) {
    case 'funny':
      return `
特に重要: 面白い話が作りやすいお題を選んでください。
- 日常の失敗談やハプニングが話しやすい話題
- ユーモラスな体験談を引き出しやすいお題
- 笑いを誘う要素がある話題`
    case 'moving':
      return `
特に重要: 感動的な話が作りやすいお題を選んでください。
- 人との絆や思い出に関連する話題
- 感謝や成長が語りやすいお題
- 心温まるエピソードを引き出しやすい話題`
    case 'educational':
      return `
特に重要: 勉強になる話が作りやすいお題を選んでください。
- 学びや発見に関連する話題
- 知識や経験を共有しやすいお題
- 教訓や気づきが語りやすい話題`
    case 'surprising':
      return `
特に重要: びっくりする話が作りやすいお題を選んでください。
- 意外な体験や発見に関連する話題
- 驚きのエピソードを引き出しやすいお題
- 予想外の展開が語りやすい話題`
    default:
      return ''
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<SpeechTopicsResponse | { error: string }>> {
  try {
    const body = await request.json()
    
    // Request validation
    if (!validateRequestBody(body)) {
      return NextResponse.json(
        { error: 'リクエストが無効です' },
        { status: 400 }
      )
    }

    const { sessionId, speechStyle } = body

    // Fetch session from Redis
    const session = await redis.get<Session>(`session:${sessionId}`)
    if (!session) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 404 }
      )
    }

    const participants = session.participants.length
    const styleInstructions = getStyleInstructions(speechStyle)

    const prompt = `
チャップリン方式のスピーチ練習用のお題を${participants}個生成してください。
${styleInstructions}

要件:
- 1-4単語程度の名詞または概念
- スピーチしやすい適度な抽象度
- 重複しない内容
- 日本語で出力

良い例: ["あなたにとっての人生", "学生時代のこと", "最近ハマっていること", "好きな動物", "理想の休日", "大切にしている言葉"]

悪い例（避けてください）: ["愛", "夢", "希望", "時間", "友情"] ← 単語だけは連想が難しい
悪い例（避けてください）: ["政治について", "経済問題", "戦争と平和", "宗教"] ← 重すぎる話題
悪い例（避けてください）: ["量子力学", "相対性理論", "DNA"] ← 専門的すぎる
悪い例（避けてください）: ["未来への希望", "記憶の断片", "沈黙の力"] ← 抽象的すぎる

出力形式:
以下のJSON形式で出力してください:
{
  "topics": ["お題1", "お題2", "お題3", ...]
}
`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response
      
      // With responseSchema, the response is guaranteed to be valid JSON
      const responseData = JSON.parse(response.text()) as { topics: string[] }
      
      // Validation
      if (!responseData.topics || !Array.isArray(responseData.topics)) {
        throw new Error('Invalid response format')
      }
      
      // Get required number of topics
      let topics = responseData.topics.slice(0, participants)
      
      // Fill with fallback if needed
      if (topics.length < participants) {
        const needed = participants - topics.length
        const shuffledFallback = [...fallbackTopics].sort(() => Math.random() - 0.5)
        topics.push(...shuffledFallback.slice(0, needed))
      }
      
      // Update session with topics
      const topicsMap: Record<string, string> = {}
      session.participants.forEach((participant, index) => {
        topicsMap[participant.id] = topics[index]
      })
      
      session.topics = topicsMap
      session.speechStyle = speechStyle
      await redis.set(`session:${sessionId}`, session)
      
      return NextResponse.json({ 
        topics 
      } satisfies SpeechTopicsResponse)
      
    } catch (apiError) {
      console.error('Topic generation failed, using fallback:', apiError)
      
      // Fallback: return shuffled topics for variety
      const shuffledFallback = [...fallbackTopics].sort(() => Math.random() - 0.5)
      const topics = shuffledFallback.slice(0, participants)
      
      // Update session with fallback topics
      const topicsMap: Record<string, string> = {}
      session.participants.forEach((participant, index) => {
        topicsMap[participant.id] = topics[index]
      })
      
      session.topics = topicsMap
      session.speechStyle = speechStyle
      await redis.set(`session:${sessionId}`, session)
      
      return NextResponse.json({ 
        topics,
        isFromCache: true 
      } satisfies SpeechTopicsResponse)
    }
  } catch (error) {
    console.error('Route handler error:', error)
    return NextResponse.json(
      { error: 'お題の生成に失敗しました' },
      { status: 500 }
    )
  }
}