import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Move API key to server-only environment variable
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

// Type definitions
interface SpeechResponse {
  speech: {
    opening: string
    body: string[]
    closing: string
  }
  tips: string[]
  isFromCache?: boolean
}

interface RequestBody {
  topic: string
  associations: string
}

// Model configuration
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    temperature: 0.85,
    maxOutputTokens: 2000,
    responseMimeType: 'application/json'
  }
})

// Validation function
function validateRequestBody(body: any): body is RequestBody {
  return typeof body.topic === 'string' && 
         typeof body.associations === 'string' &&
         body.topic.length > 0 &&
         body.associations.length > 0
}

export async function POST(request: NextRequest): Promise<NextResponse<SpeechResponse | { error: string }>> {
  try {
    const body = await request.json()
    
    // Request validation
    if (!validateRequestBody(body)) {
      return NextResponse.json(
        { error: 'お題と連想ワードを指定してください' },
        { status: 400 }
      )
    }

    const { topic, associations } = body

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
}

注意事項:
- 自然で話しやすい日本語を使用
- 堅すぎず、親しみやすいトーン
- 「${topic}」を中心にスピーチを組み立てる
- 1-2分で話せる長さ（全体で300-500文字程度）
`

    try {
      const result = await model.generateContent(prompt)
      const response = result.response
      
      // Parse JSON response
      const responseData = JSON.parse(response.text()) as SpeechResponse
      
      // Validation
      if (!responseData.speech || !responseData.tips) {
        throw new Error('Invalid response format')
      }
      
      return NextResponse.json(responseData)
      
    } catch (apiError) {
      console.error('Speech generation failed:', apiError)
      
      // Fallback speech
      const fallbackSpeech: SpeechResponse = {
        speech: {
          opening: `皆さん、今日は「${topic}」についてお話しさせていただきます。`,
          body: [
            `「${topic}」というテーマを聞いて、私はある思い出が鮮明に蘇ってきました。それは、私の人生観を変えた一つの出来事でした。`,
            `誰もが「${topic}」について、それぞれの経験や想いを持っているはずです。私にとってそれは、日常の中で見過ごしていた大切なものに気づかせてくれる機会でした。`,
            `今振り返ると、「${topic}」は私たちの生活のあちこちに存在しています。大切なのは、それに気づき、向き合う勇気を持つことかもしれません。`
          ],
          closing: `皆さんも、ご自身の「${topic}」について、もう一度考えてみませんか。きっと新しい発見があるはずです。`,
        },
        tips: [
          '個人的な体験を具体的に語る',
          '聴衆が共感できるエピソードを選ぶ',
          '最後は行動への呼びかけで締める'
        ],
        isFromCache: true
      }
      
      return NextResponse.json(fallbackSpeech)
    }
  } catch (error) {
    console.error('Route handler error:', error)
    return NextResponse.json(
      { error: 'スピーチの生成に失敗しました' },
      { status: 500 }
    )
  }
}