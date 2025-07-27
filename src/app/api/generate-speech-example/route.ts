import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { redis } from '@/lib/redis'
import { Session, ParticipantContent, SpeechExample, SpeechStyle } from '@/types'

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

interface RequestBody {
  sessionId: string
  participantId: string
}

interface SpeechResponse {
  speech: SpeechExample
}

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    temperature: 0.9,
    maxOutputTokens: 2000,
    responseMimeType: 'application/json'
  }
})

// Get style specific instructions
function getStyleInstructions(style?: SpeechStyle): string {
  switch(style) {
    case 'funny':
      return '面白い話やユーモラスなエピソードを中心に、聴衆を笑わせるスピーチにしてください。失敗談や意外な展開を含めると効果的です。'
    case 'moving':
      return '感動的なエピソードや心温まる話を中心に、聴衆の心に響くスピーチにしてください。人との絆や成長の物語を含めると効果的です。'
    case 'educational':
      return '学びや気づきのあるエピソードを中心に、聴衆にとって勉強になるスピーチにしてください。具体的な知識や教訓を含めると効果的です。'
    case 'surprising':
      return '驚きや意外性のあるエピソードを中心に、聴衆をびっくりさせるスピーチにしてください。予想外の展開や発見を含めると効果的です。'
    default:
      return '聴衆の興味を引く魅力的なスピーチにしてください。'
  }
}

// Fallback speech example
const fallbackSpeech: SpeechExample = {
  speech: {
    opening: "皆さん、こんにちは。今日は私にとって特別なテーマについてお話しさせていただきます。",
    body: [
      "このテーマを聞いたとき、まず頭に浮かんだのは私の個人的な経験でした。それは数年前のことですが、今でも鮮明に覚えています。",
      "その経験から学んだことは、人生において本当に大切なものは何かということでした。日々の忙しさの中で、私たちは時として本質を見失いがちです。",
      "しかし、立ち止まって考えてみると、実は答えはとてもシンプルなのかもしれません。それは、私たちの周りにある小さな幸せに気づくことです。"
    ],
    closing: "今日お話ししたことが、皆さんの日常に少しでも新しい視点をもたらすことができれば幸いです。ご清聴ありがとうございました。"
  },
  tips: [
    "個人的な経験を具体的に話すと聴衆の共感を得やすい",
    "抽象的な話から具体的な例に落とし込むと理解しやすい",
    "最後は前向きなメッセージで締めくくると印象的"
  ]
}

export async function POST(request: NextRequest): Promise<NextResponse<SpeechResponse | { error: string }>> {
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

    // Fetch participant content
    const content = await redis.get<ParticipantContent>(`session:${sessionId}:participant:${participantId}`)
    if (!content || !content.keywords) {
      return NextResponse.json(
        { error: '関連キーワードが見つかりません' },
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

    const styleInstructions = getStyleInstructions(session.speechStyle)

    const prompt = `
お題「${topic}」と関連キーワード「${content.keywords}」を使って、3分間のスピーチ例を作成してください。

要件:
- 関連キーワードをできるだけ多く自然に組み込む
- 3分で話せる分量（800-900文字程度）
- 具体的なエピソードや例を含める
- ${styleInstructions}

スピーチの構成:
1. 導入（1段落）: 聴衆の注意を引く始まり
2. 本文（3段落）: メインの内容を3つのポイントで展開
3. 結び（1段落）: 印象的な締めくくり

出力形式:
以下のJSON形式で出力してください:
{
  "speech": {
    "opening": "導入部分のテキスト",
    "body": [
      "本文の第1段落",
      "本文の第2段落",
      "本文の第3段落"
    ],
    "closing": "結びの部分のテキスト"
  },
  "tips": [
    "このスピーチのポイント1",
    "このスピーチのポイント2",
    "このスピーチのポイント3"
  ]
}
`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response
      const responseData = JSON.parse(response.text()) as SpeechExample
      
      // Validation
      if (!responseData.speech || !responseData.speech.opening || !responseData.speech.body || !responseData.speech.closing) {
        throw new Error('Invalid response format')
      }

      // Update content in Redis
      content.speechExample = responseData
      content.speechGeneratedAt = new Date().toISOString()
      
      await redis.set(
        `session:${sessionId}:participant:${participantId}`,
        content,
        24 * 60 * 60 // 24 hours
      )
      
      return NextResponse.json({ speech: responseData })
      
    } catch (apiError) {
      console.error('Speech generation failed:', apiError)
      
      // Update content with fallback in Redis
      content.speechExample = fallbackSpeech
      content.speechGeneratedAt = new Date().toISOString()
      
      await redis.set(
        `session:${sessionId}:participant:${participantId}`,
        content,
        24 * 60 * 60 // 24 hours
      )
      
      return NextResponse.json({ speech: fallbackSpeech })
    }
  } catch (error) {
    console.error('Route handler error:', error)
    return NextResponse.json(
      { error: 'スピーチ例の生成に失敗しました' },
      { status: 500 }
    )
  }
}