'use server'

import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'
import { Session, Participant, SpeechStyle, ParticipantContent } from '@/types'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

const API_KEY = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(API_KEY)

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
  '忘れられない思い出'
]

function getStyleInstructions(style: SpeechStyle): string {
  switch(style) {
    case 'funny':
      return `特に重要: 面白い話が作りやすいお題を選んでください。`
    case 'moving':
      return `特に重要: 感動的な話が作りやすいお題を選んでください。`
    case 'educational':
      return `特に重要: 勉強になる話が作りやすいお題を選んでください。`
    case 'surprising':
      return `特に重要: びっくりする話が作りやすいお題を選んでください。`
    default:
      return ''
  }
}

export async function generateTopics(sessionId: string, speechStyle: SpeechStyle) {
  try {
    const session = await redis.get(`session:${sessionId}`) as Session | null
    if (!session) {
      throw new Error('Session not found')
    }

    const participants = session.participants.length
    const styleInstructions = getStyleInstructions(speechStyle)
    
    let topics: string[] = []
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite',
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json'
        }
      })
      
      const prompt = `
チャップリン方式のスピーチ練習用のお題を${participants}個生成してください。
${styleInstructions}

要件:
- 1-4単語程度の名詞または概念
- スピーチしやすい適度な抽象度
- 重複しない内容
- 日本語で出力

出力形式:
以下のJSON形式で出力してください:
{
  "topics": ["お題1", "お題2", "お題3", ...]
}
`
      
      const result = await model.generateContent(prompt)
      const response = result.response
      const responseData = JSON.parse(response.text()) as { topics: string[] }
      
      if (responseData.topics && Array.isArray(responseData.topics)) {
        topics = responseData.topics.slice(0, participants)
      }
    } catch (error) {
      console.error('AI generation failed, using fallback:', error)
    }
    
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

    revalidatePath(`/session/${sessionId}`)
  } catch (error) {
    console.error('Topic generation error:', error)
    throw error
  }
}

export async function generateKeywords(sessionId: string, participantId: string) {
  try {
    const session = await redis.get(`session:${sessionId}`) as Session | null
    if (!session) {
      throw new Error('Session not found')
    }

    const topic = session.topics[participantId]
    if (!topic) {
      throw new Error('Topic not found')
    }

    let keywords = ''
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite',
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 300
        }
      })
      
      const prompt = `
「${topic}」というお題から連想される言葉を20個程度、カンマ区切りで出力してください。

要件:
- 日本語で出力
- スピーチで使いやすい言葉を選ぶ
- 単語、短いフレーズ、概念など様々な形式を含める
- カンマとスペースで区切る

良い例（お題: 好きな動物）:
犬, 猫, ペット, 散歩, しっぽ, 癒し, 家族, 忠実, 毛並み, 鳴き声, 動物園, 野生, 保護, 絆, 成長, 思い出, 責任, 愛情, 一緒に暮らす, かわいい

悪い例（避けてください）:
動物学, 生態系, 分類学, 哺乳類 ← 専門的すぎる
`
      
      const result = await model.generateContent(prompt)
      keywords = result.response.text().trim()
    } catch (error) {
      console.error('AI generation failed, using fallback:', error)
      // Fallback keywords
      const fallbackKeywords: Record<string, string> = {
        'default': '思い出, 経験, 体験, 感情, 成長, 学び, 発見, 出会い, 挑戦, 変化, 日常, 特別, 大切, 価値, 意味, 時間, 場所, 人, きっかけ, 影響'
      }
      keywords = fallbackKeywords.default
    }

    // Save content
    const contentKey = `content:${sessionId}:${participantId}`
    const existingContent = await redis.get(contentKey) as ParticipantContent | null
    
    const updatedContent: ParticipantContent = {
      keywords,
      keywordsGeneratedAt: new Date().toISOString(),
      speechExample: existingContent?.speechExample || null,
      speechGeneratedAt: existingContent?.speechGeneratedAt || null
    }
    
    await redis.set(contentKey, updatedContent)

    revalidatePath(`/session/${sessionId}/${participantId}`)
  } catch (error) {
    console.error('Keyword generation error:', error)
    throw error
  }
}

export async function generateSpeechExample(sessionId: string, participantId: string) {
  try {
    const session = await redis.get(`session:${sessionId}`) as Session | null
    if (!session) {
      throw new Error('Session not found')
    }

    const topic = session.topics[participantId]
    if (!topic) {
      throw new Error('Topic not found')
    }

    const contentKey = `content:${sessionId}:${participantId}`
    const content = await redis.get(contentKey) as ParticipantContent | null
    
    if (!content?.keywords) {
      throw new Error('Keywords not found')
    }

    let speechExample = null
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite',
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2000,
          responseMimeType: 'application/json'
        }
      })
      
      const styleInstruction = session.speechStyle && session.speechStyle !== 'none' 
        ? `\nスピーチスタイル: ${session.speechStyle === 'funny' ? '面白い話' : 
            session.speechStyle === 'moving' ? '感動する話' : 
            session.speechStyle === 'educational' ? '勉強になる話' : 
            session.speechStyle === 'surprising' ? 'びっくりする話' : ''}`
        : ''
      
      const prompt = `
「${topic}」というお題で、以下の関連キーワードを使った3分間のスピーチ例を作成してください。

関連キーワード: ${content.keywords}
${styleInstruction}

要件:
- 導入、本文（2-3段落）、結びの構成
- 関連キーワードを自然に取り入れる
- 日本語で出力
- 聞き手を惹きつける内容
- 3分で話せる長さ（800-1000文字程度）

出力形式（必ずこのJSON形式で）:
{
  "speech": {
    "opening": "導入部分のテキスト",
    "body": [
      "本文の第1段落",
      "本文の第2段落",
      "本文の第3段落（任意）"
    ],
    "closing": "結びの部分のテキスト"
  },
  "tips": [
    "このスピーチを話すときのコツ1",
    "このスピーチを話すときのコツ2"
  ]
}
`
      
      const result = await model.generateContent(prompt)
      const response = result.response
      speechExample = JSON.parse(response.text())
    } catch (error) {
      console.error('AI generation failed, using fallback:', error)
      // Fallback speech example
      speechExample = {
        speech: {
          opening: `今日は「${topic}」についてお話しさせていただきます。このお題を聞いて、私は${content.keywords.split(',')[0]}のことを思い出しました。`,
          body: [
            `${topic}について考えるとき、私たちは様々な${content.keywords.split(',')[1]}や${content.keywords.split(',')[2]}を思い浮かべることでしょう。それぞれの人にとって、${topic}は異なる意味を持っています。`,
            `私自身の経験では、${topic}は${content.keywords.split(',')[3]}と深く結びついています。それは単なる${content.keywords.split(',')[4]}ではなく、私たちの人生において重要な役割を果たしているのです。`
          ],
          closing: `${topic}について考えることで、私たちは自分自身をより深く理解することができます。皆さんも、ぜひ自分なりの${topic}について考えてみてください。`
        },
        tips: [
          '個人的な体験を具体的に話すと、聞き手の共感を得やすくなります',
          '関連キーワードを自然に織り交ぜながら、話に一貫性を持たせましょう'
        ]
      }
    }

    // Update content
    const updatedContent: ParticipantContent = {
      ...content,
      speechExample,
      speechGeneratedAt: new Date().toISOString()
    }
    
    await redis.set(contentKey, updatedContent)

    revalidatePath(`/session/${sessionId}/${participantId}`)
  } catch (error) {
    console.error('Speech example generation error:', error)
    throw error
  }
}