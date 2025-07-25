import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Move API key to server-only environment variable
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

// Type definitions
interface AssociationsResponse {
  associations: string
  isFromCache?: boolean
}

interface RequestBody {
  topic: string
}

// Model configuration
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    temperature: 0.9, // Higher creativity for associations
    maxOutputTokens: 500,
    responseMimeType: 'application/json'
  }
})

// Fallback associations
const fallbackAssociations: Record<string, string> = {
  '時間': '時間 → 時計 → 針 → 方向 → 道 → 旅 → 冒険 → 勇気',
  '友情': '友情 → 絆 → 糸 → 結ぶ → 約束 → 信頼 → 宝物 → 光',
  '挑戦': '挑戦 → 山 → 頂上 → 景色 → 視野 → 広がり → 可能性 → 未来',
  '感謝': '感謝 → 心 → 温かさ → 太陽 → エネルギー → 活力 → 成長 → 実り',
  '成長': '成長 → 木 → 根 → 大地 → 恵み → 豊かさ → 幸せ → 笑顔',
  '夢': '夢 → 星 → 夜空 → 無限 → 宇宙 → 探検 → 発見 → 驚き',
  '変化': '変化 → 蝶 → 羽ばたき → 自由 → 風 → 流れ → 川 → 海',
  '勇気': '勇気 → 炎 → 情熱 → 赤 → バラ → 美 → 芸術 → 創造',
  '希望': '希望 → 朝日 → 始まり → スタート → 一歩 → 前進 → 道のり → 到達',
  '笑顔': '笑顔 → 花 → 春 → 芽吹き → 生命 → 鼓動 → リズム → 音楽'
}

// Validation function
function validateRequestBody(body: any): body is RequestBody {
  return typeof body.topic === 'string' && body.topic.length > 0
}

export async function POST(request: NextRequest): Promise<NextResponse<AssociationsResponse | { error: string }>> {
  try {
    const body = await request.json()
    
    // Request validation
    if (!validateRequestBody(body)) {
      return NextResponse.json(
        { error: 'お題を指定してください' },
        { status: 400 }
      )
    }

    const { topic } = body

    const prompt = `
      「${topic}」という言葉から連想ゲームをしてください。
      以下のルールに従って8個の言葉を連想してください：
      
      1. 最初の言葉は「${topic}」
      2. 各ステップで前の言葉から自然に連想される言葉を選ぶ
      3. できるだけ関連性がある連想をする
      4. どの言葉もスピーチのテーマとして使えるようにする
      5. ネガティブな言葉は避ける
      
      良い例（「学生時代のこと」の場合）:
      学生時代のこと → 友人 → 部活動 → 努力 → 成長 → 自信 → 挑戦 → 未来
      理由: 各単語が自然に繋がり、どれもスピーチの題材になる

      良い例（「最近ハマっていること」の場合）:
      最近ハマっていること → 趣味 → 時間 → 充実 → 楽しさ → 笑顔 → 幸せ → 感謝
      理由: 趣味から派生する感情や価値観へと自然に繋がっている

      良い例（「好きな動物」の場合）:
      好きな動物 → ペット → 家族 → 愛情 → 絆 → 思い出 → 写真 → 宝物
      理由: 動物から人との関係性、大切なものへと連想が広がっている
      
      悪い例（「学生時代のこと」の場合）:
      学生時代のこと → 勉強 → 苦痛 → 絶望 → 闇 → 悪 → 破壊 → 終末
      理由: ネガティブすぎて、スピーチに向かない
      
      悪い例（「学生時代のこと」の場合）:
      学生時代のこと → 鉛筆 → 黒鉛 → 炭素 → 原子 → 量子 → 物理学 → アインシュタイン
      理由: 連想が専門的すぎて、一般的なスピーチには不向き
      
      悪い例（「好きな動物」の場合）:
      好きな動物 → 犬 → 猫 → うさぎ → ハムスター → インコ → 金魚 → カメ
      理由: 単に動物を列挙しているだけで、連想になっていない
      
      以下のJSON形式で出力してください:
      {
        "associations": "${topic} → 連想1 → 連想2 → 連想3 → 連想4 → 連想5 → 連想6 → 連想7"
      }
    `

    try {
      const result = await model.generateContent(prompt)
      const response = result.response
      
      // With responseSchema, the response is guaranteed to be valid JSON
      const responseData = JSON.parse(response.text()) as { associations: string }
      
      // Validate format
      if (!responseData.associations || 
          !responseData.associations.includes('→') || 
          !responseData.associations.startsWith(topic)) {
        throw new Error('Invalid response format')
      }
      
      return NextResponse.json({ 
        associations: responseData.associations 
      } satisfies AssociationsResponse)
      
    } catch (apiError) {
      console.error('Association generation failed, using fallback:', apiError)
      
      // Return fallback associations
      const fallback = fallbackAssociations[topic] || 
        `${topic} → 発想 → アイデア → 創造 → 革新 → 未来 → 希望 → 実現`
      
      return NextResponse.json({ 
        associations: fallback,
        isFromCache: true 
      } satisfies AssociationsResponse)
    }
  } catch (error) {
    console.error('Route handler error:', error)
    return NextResponse.json(
      { error: '連想ワードの生成に失敗しました' },
      { status: 500 }
    )
  }
}