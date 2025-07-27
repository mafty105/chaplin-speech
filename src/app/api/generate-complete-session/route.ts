import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { nanoid } from 'nanoid'
import { redis, SESSION_TTL } from '@/lib/redis'
import { 
  GenerateCompleteSessionRequest, 
  GenerateCompleteSessionResponse, 
  EnhancedTopic,
  Session 
} from '@/types'

// API configuration
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(API_KEY)

// Model configurations
const topicsModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 500,
  }
})

const associationsModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    temperature: 0.9,
    maxOutputTokens: 200,
  }
})

const speechModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    temperature: 0.85,
    maxOutputTokens: 2000,
    responseMimeType: 'application/json'
  }
})

// Validation
function validateRequest(body: any): body is GenerateCompleteSessionRequest {
  return (
    typeof body.participants === 'number' &&
    body.participants >= 1 &&
    body.participants <= 10
  )
}

// Generate unique session ID
async function generateUniqueSessionId(): Promise<string> {
  const maxAttempts = 10
  
  for (let i = 0; i < maxAttempts; i++) {
    const sessionId = nanoid(8)
    const key = `session:${sessionId}`
    
    const exists = await redis.exists(key)
    if (!exists) {
      return sessionId
    }
  }
  
  throw new Error('セッションIDの生成に失敗しました')
}

// Generate topics
async function generateTopics(participants: number): Promise<string[]> {
  const prompt = `
スピーチ練習のためのお題を${participants}個生成してください。
お題は、チャップリン方式で単語の連想がしやすいものにしてください。

以下の条件を満たすお題を生成してください：
- 個人的な経験や思い出を語りやすいお題
- 具体的でイメージしやすいお題
- 連想ゲームがしやすいお題
- 1-2分のスピーチに適したお題

良い例:
- "あなたにとっての人生"
- "学生時代のこと"
- "最近ハマっていること"
- "好きな動物"
- "子供の頃の夢"
- "心に残る言葉"
- "理想の休日"
- "大切な人への感謝"

悪い例（避けてください）:
- "愛" ← 単語だけは連想が難しい
- "世界平和について" ← 抽象的すぎる
- "量子力学の基礎" ← 専門的すぎる

${participants}個のお題を改行で区切って出力してください。
余計な番号や記号は付けないでください。`

  const result = await topicsModel.generateContent(prompt)
  const response = result.response
  const topics = response.text()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, participants)
  
  return topics
}

// Generate associations
async function generateAssociations(topic: string): Promise<string> {
  const prompt = `
「${topic}」というお題から連想される単語を8個、連想ゲーム形式でつなげてください。

ルール：
1. 前の単語から自然に連想される単語を選ぶ
2. 単語は2-4文字程度の短いものが望ましい
3. 最後の単語は前向きで印象的なものにする
4. 矢印（→）でつなげる

良い例（「学生時代のこと」の場合）:
学生時代のこと → 友人 → 部活動 → 努力 → 成長 → 自信 → 挑戦 → 未来

悪い例（避けてください）:
学生時代のこと → 勉強 → 勉強 → 勉強 ← 同じ単語の繰り返し
学生時代のこと → 友達 → カレーライス → 黄色 → バナナ ← 関連性が薄い

出力形式：
${topic} → 単語1 → 単語2 → 単語3 → 単語4 → 単語5 → 単語6 → 単語7 → 単語8`

  const result = await associationsModel.generateContent(prompt)
  return result.response.text().trim()
}

// Generate speech
async function generateSpeech(topic: string, associations: string): Promise<any> {
  const prompt = `
あなたは優秀なスピーチライターです。
与えられたお題について、1-2分程度の短いスピーチ原稿を作成してください。

与えられた情報:
- スピーチのお題: "${topic}"
- 連想ワード（ヒント）: ${associations}

重要な注意事項:
- スピーチは「${topic}」についてのスピーチです
- 連想ワードは発想のヒントとして参考にしてください
- 連想ワードの中から特定の言葉を選んで話す必要はありません
- 「${topic}」から自由に発想を広げてスピーチを作成してください

以下の構成でスピーチを作成してください:

1. 導入（opening）: 
   - 聴衆の注意を引く開始
   - 「${topic}」についての導入
   - 50-80文字程度

2. 本文（body）: 
   - 3つの段落で構成
   - 各段落は80-120文字程度
   - 個人的な経験や具体例を含める
   - 連想ワードからインスピレーションを得た内容を含めても良い
   - 聴衆が共感できる内容

3. 締めくくり（closing）:
   - 印象的な結び
   - 聴衆への問いかけや行動の促し
   - 50-80文字程度

4. スピーチのポイント（tips）:
   - このスピーチを効果的にするための3つのアドバイス
   - 各20-40文字程度

以下のJSON形式で出力してください:
{
  "speech": {
    "opening": "導入文",
    "body": ["第1段落", "第2段落", "第3段落"],
    "closing": "締めくくり文"
  },
  "tips": ["ポイント1", "ポイント2", "ポイント3"]
}`

  const result = await speechModel.generateContent(prompt)
  const response = result.response
  
  try {
    return JSON.parse(response.text())
  } catch (error) {
    console.error('Failed to parse speech response:', error)
    throw new Error('スピーチの生成に失敗しました')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: '参加人数は1〜10人で指定してください' },
        { status: 400 }
      )
    }

    // Check Redis availability
    const isRedisAvailable = await redis.isAvailable()
    if (!isRedisAvailable) {
      return NextResponse.json(
        { error: '共有機能は現在利用できません' },
        { status: 503 }
      )
    }

    // Generate all content
    console.log('Generating topics...')
    const topicTexts = await generateTopics(body.participants)
    
    // Create enhanced topics with all content
    const enhancedTopics: EnhancedTopic[] = []
    
    for (let i = 0; i < topicTexts.length; i++) {
      const topicText = topicTexts[i]
      const topicId = `topic-${Date.now()}-${i}`
      
      console.log(`Generating associations for topic ${i + 1}...`)
      const associations = await generateAssociations(topicText)
      
      console.log(`Generating speech for topic ${i + 1}...`)
      const speechExample = await generateSpeech(topicText, associations)
      
      enhancedTopics.push({
        id: topicId,
        text: topicText,
        associations,
        associationGeneratedAt: new Date().toISOString(),
        speechExample
      })
    }

    // Generate unique session ID
    const sessionId = await generateUniqueSessionId()
    const key = `session:${sessionId}`
    
    // Create session
    const createdAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + SESSION_TTL * 1000).toISOString()
    
    const session: Session = {
      id: sessionId,
      topics: enhancedTopics,
      participants: body.participants,
      createdAt,
      expiresAt
    }
    
    // Save to Redis
    const saved = await redis.set(key, session, SESSION_TTL)
    if (!saved) {
      return NextResponse.json(
        { error: 'セッションの保存に失敗しました' },
        { status: 500 }
      )
    }
    
    // Create response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (request.headers.get('host') ? `http://${request.headers.get('host')}` : 'http://localhost:4321')
    
    const response: GenerateCompleteSessionResponse = {
      sessionId,
      redirectUrl: `${baseUrl}/session/${sessionId}`
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Complete session generation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'セッションの作成に失敗しました'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}