import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { nanoid } from 'nanoid'
import { redis, SESSION_TTL } from '@/lib/redis'
import { 
  GenerateCompleteSessionRequest, 
  GenerateCompleteSessionResponse, 
  EnhancedTopic,
  Session,
  SpeechStyle
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
    body.participants <= 10 &&
    typeof body.speechStyle === 'string' &&
    ['none', 'funny', 'moving', 'educational', 'surprising'].includes(body.speechStyle)
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
async function generateTopics(participants: number, speechStyle: SpeechStyle): Promise<string[]> {
  let stylePrompt = ''
  
  switch (speechStyle) {
    case 'funny':
      stylePrompt = `
今回は「面白い話」をするためのお題を生成してください。

以下の条件を満たすお題を生成してください：
- ユーモアのある経験や出来事を話しやすいお題
- 笑いを誘うエピソードが思い浮かびやすいお題
- 失敗談や恥ずかしい経験なども含めて良い
- 聴衆を楽しませる話ができるお題

良い例:
- "私の恥ずかしい失敗談"
- "笑える勘違い"
- "ペットの面白い行動"
- "子供の頃のいたずら"
- "料理の大失敗"
- "面白い偶然の出来事"`
      break
    case 'moving':
      stylePrompt = `
今回は「感動する話」をするためのお題を生成してください。

以下の条件を満たすお題を生成してください：
- 心温まる経験や思い出を話しやすいお題
- 感動的なエピソードが思い浮かびやすいお題
- 人との絆や成長を感じられるお題
- 聴衆の心に響く話ができるお題

良い例:
- "人生を変えた出会い"
- "忘れられない言葉"
- "感謝の気持ち"
- "乗り越えた困難"
- "家族との思い出"
- "誰かに助けられた経験"`
      break
    case 'educational':
      stylePrompt = `
今回は「勉強になる話」をするためのお題を生成してください。

以下の条件を満たすお題を生成してください：
- 学びや気づきのある経験を話しやすいお題
- 教訓やアドバイスを含められるお題
- 実用的な知識や経験を共有できるお題
- 聴衆が何かを学べる話ができるお題

良い例:
- "失敗から学んだこと"
- "読んで良かった本"
- "仕事で得た教訓"
- "効果的だった習慣"
- "スキルの身につけ方"
- "人生の転機での学び"`
      break
    case 'surprising':
      stylePrompt = `
今回は「びっくりする話」をするためのお題を生成してください。

以下の条件を満たすお題を生成してください：
- 予想外の展開や発見を話しやすいお題
- 驚きの体験やエピソードが思い浮かびやすいお題
- 意外性のある出来事を含められるお題
- 聴衆を驚かせる話ができるお題

良い例:
- "信じられない偶然"
- "意外な発見"
- "予想外の結果"
- "驚きの再会"
- "思いがけない幸運"
- "衝撃的な事実"`
      break
    default:
      stylePrompt = `
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
- "大切な人への感謝"`
  }
  
  const prompt = `
スピーチ練習のためのお題を${participants}個生成してください。
お題は、チャップリン方式で単語の連想がしやすいものにしてください。

${stylePrompt}

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
async function generateSpeech(topic: string, associations: string, speechStyle: SpeechStyle): Promise<any> {
  let styleInstruction = ''
  let styleTips: string[] = []
  
  switch (speechStyle) {
    case 'funny':
      styleInstruction = `
このスピーチは「面白い話」として作成してください。
- ユーモアのある内容にする
- 笑いを誘う要素を含める
- 軽快で楽しい雰囲気を作る
- オチや意外な展開を含める`
      styleTips = [
        "表情豊かに、笑顔で話す",
        "間（ま）を効果的に使う",
        "ジェスチャーを活用する"
      ]
      break
    case 'moving':
      styleInstruction = `
このスピーチは「感動する話」として作成してください。
- 心に響く内容にする
- 感情を込めた表現を使う
- 共感を呼ぶエピソードを含める
- 温かみのある締めくくりにする`
      styleTips = [
        "感情を込めて、ゆっくり話す",
        "聴衆と目を合わせる",
        "声に抑揚をつける"
      ]
      break
    case 'educational':
      styleInstruction = `
このスピーチは「勉強になる話」として作成してください。
- 学びや気づきを含む内容にする
- 具体的な例や経験を交える
- 実用的なアドバイスを含める
- 明確な教訓で締めくくる`
      styleTips = [
        "要点を明確に伝える",
        "具体例を効果的に使う",
        "聴衆に問いかける"
      ]
      break
    case 'surprising':
      styleInstruction = `
このスピーチは「びっくりする話」として作成してください。
- 意外性のある内容にする
- 予想外の展開を含める
- 驚きの事実や発見を交える
- インパクトのある締めくくりにする`
      styleTips = [
        "緩急をつけて話す",
        "重要な部分で間を置く",
        "驚きを演出する声のトーン"
      ]
      break
    default:
      styleInstruction = ''
      styleTips = []
  }
  
  const prompt = `
あなたは優秀なスピーチライターです。
与えられたお題について、1-2分程度の短いスピーチ原稿を作成してください。

与えられた情報:
- スピーチのお題: "${topic}"
- 連想ワード（ヒント）: ${associations}
${styleInstruction ? '\nスピーチスタイルの指定:\n' + styleInstruction : ''}

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
${styleTips.length > 0 ? `   - 推奨: ${styleTips.join(', ')}` : ''}

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
        { error: 'リクエストの形式が正しくありません' },
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
    const topicTexts = await generateTopics(body.participants, body.speechStyle)
    
    // Create enhanced topics with all content
    const enhancedTopics: EnhancedTopic[] = []
    
    for (let i = 0; i < topicTexts.length; i++) {
      const topicText = topicTexts[i]
      const topicId = `topic-${Date.now()}-${i}`
      
      console.log(`Generating associations for topic ${i + 1}...`)
      const associations = await generateAssociations(topicText)
      
      console.log(`Generating speech for topic ${i + 1}...`)
      const speechExample = await generateSpeech(topicText, associations, body.speechStyle)
      
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
      speechStyle: body.speechStyle,
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
      (request.headers.get('host') ? `https://${request.headers.get('host')}` : 'http://localhost:4321')
    
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