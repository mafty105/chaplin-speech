'use server'

import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'
import { Session, Participant, SpeechStyle, ParticipantContent } from '@/types'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { generateQRCodeDataURL } from '@/lib/qr-generator'

export async function createSession(participants: string[] | number) {
  let sessionId: string = ''
  
  try {
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
  } catch (error) {
    console.error('Session creation error:', error)
    throw error
  }
  
  // Redirect should be outside the try-catch to avoid catching NEXT_REDIRECT
  redirect(`/session/${sessionId}`)
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
      return `
      特に重要: 面白い話が作りやすいお題を選んでください。
      - いい例: ["もっとも辛かった映画", "過去一番赤面した話", "友人との珍事件", "まずい料理を作ってしまった話"]
      `
    case 'moving':
      return `特に重要: 感動的な話が作りやすいお題を選んでください。
      - いい例: ["祖父との思い出", "部活動の思い出", "人生で一番の努力", "自分を祝ってもらった話"]
      `
    case 'educational':
      return `特に重要: 勉強になる話が作りやすいお題を選んでください。
      - いい例: ["最近一番タメになった本", "仕事での教訓", "勉強不足で損をした話", "自分の失敗を踏まえた教訓"]
      `
    case 'surprising':
      return `特に重要: びっくりする話が作りやすいお題を選んでください。
      - いい例: ["最近知って驚いたこと", "旅先での不思議な出来事", "不思議な共通点がある人", "不思議な夢"]
      `
    default:
      return ''
  }
}

export async function generateTopics(sessionId: string, speechStyle: SpeechStyle, duration: 1 | 2 | 3 = 2) {
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
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              topics: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.STRING
                }
              }
            },
            required: ['topics']
          }
        }
      })
      
      const prompt = `
スピーチ練習用のお題を${participants}個生成してください。
${styleInstructions}

要件:
- 1-4単語程度の名詞または概念
- スピーチしやすい適度な抽象度
- 重複しない内容
- 日本語で出力

良い例: ["あなたにとっての人生", "学生時代のこと", "最近ハマっていること", "好きな動物", "理想の休日", "大切にしている言葉"]

悪い例（避けてください）: ["愛", "夢", "希望", "時間", "友情"] ← 単語だけは連想が難しい
悪い例（避けてください）: ["政治について", "経済問題", "戦争と平和", "宗教"] ← 重すぎる話題
悪い例（避けてください）: ["量子力学", "相対性理論", "DNA", "発明"] ← 専門的すぎる
悪い例（避けてください）: ["未来への希望", "記憶の断片", "沈黙の力"] ← 抽象的すぎる
悪い例（避けてください）: ["ペットのこと", "自分の子ども", "結婚相手"] ← 万人に共通しない
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
    session.speechDuration = duration
    
    await redis.set(`session:${sessionId}`, session)

    revalidatePath(`/session/${sessionId}`)
    
    // Return the updated session data
    return { success: true, topics: topicsMap, speechStyle, duration }
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
「${topic}」というお題から連想される言葉を10個程度、カンマ区切りで出力してください。

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
    
    // Return the generated keywords
    return { keywords }
  } catch (error) {
    console.error('Keyword generation error:', error)
    throw error
  }
}

export async function generateSpeechExample(sessionId: string, participantId: string, duration: 1 | 2 | 3 = 2) {
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
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              speech: {
                type: SchemaType.OBJECT,
                properties: {
                  opening: { type: SchemaType.STRING },
                  body: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                  },
                  closing: { type: SchemaType.STRING }
                },
                required: ['opening', 'body', 'closing']
              },
              tips: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
              }
            },
            required: ['speech', 'tips']
          }
        }
      })
      
      const targetLength = duration * 300 // 300 characters per minute
      const styleInstruction = session.speechStyle && session.speechStyle !== 'none' 
        ? `\nスピーチスタイル: ${session.speechStyle === 'funny' ? '面白い話' : 
            session.speechStyle === 'moving' ? '感動する話' : 
            session.speechStyle === 'educational' ? '勉強になる話' : 
            session.speechStyle === 'surprising' ? 'びっくりする話' : ''}`
        : ''
      
      const prompt = `
「${topic}」というお題で、以下の関連キーワードを使った${duration}分間のスピーチ例を作成してください。

関連キーワード: ${content.keywords}
${styleInstruction}

要件:
- 全体で${targetLength}文字程度の長さ
- 関連キーワードを自然に取り入れる
- 日本語で出力
- 聞き手を惹きつける内容
- 句読点は適切に使用し、読点（、）の過剰な使用は避ける
- 導入、本文（2-3段落）、結びの構成だが、セクション名は出力しない
- 段落間は自然につながるようにする

良い例（句読点の使い方）:
「私が初めて犬を飼ったのは小学生の頃でした。名前はポチ。とても元気な子犬で、毎日の散歩が楽しみでした。」

悪い例（読点が多すぎる）:
「私が、初めて、犬を飼ったのは、小学生の頃で、名前は、ポチと言いました。」

悪い例（句読点が全くない）:
「私が初めて犬を飼ったのは小学生の頃でした名前はポチとても元気な子犬で毎日の散歩が楽しみでした」

構成:
- opening: 導入部分（セクション名は不要）
- body: 本文（2-3段落の配列、セクション名は不要）
- closing: 結びの部分（セクション名は不要）
- tips: スピーチのコツ（2つ程度）
`
      
      const result = await model.generateContent(prompt)
      const response = result.response
      speechExample = JSON.parse(response.text())
    } catch (error) {
      console.error('AI generation failed, using fallback:', error)
      // Fallback speech example
      const keywords = content.keywords.split(',').map(k => k.trim())
      const openings = {
        1: `今日は「${topic}」についてお話しします。このお題を聞いて私は${keywords[0]}のことを思い出しました。`,
        2: `今日は「${topic}」についてお話しさせていただきます。このお題を聞いて私は${keywords[0]}のことを思い出しました。`,
        3: `今日は「${topic}」についてお話しさせていただきます。このお題を聞いて私は${keywords[0]}のことを思い出しました。`
      }
      
      const bodies = {
        1: [
          `${topic}について考えるとき私たちは様々な${keywords[1]}や${keywords[2]}を思い浮かべることでしょう。それぞれの人にとって${topic}は異なる意味を持っています。私自身の経験では${topic}は${keywords[3]}と深く結びついています。`
        ],
        2: [
          `${topic}について考えるとき私たちは様々な${keywords[1]}や${keywords[2]}を思い浮かべることでしょう。それぞれの人にとって${topic}は異なる意味を持っています。`,
          `私自身の経験では${topic}は${keywords[3]}と深く結びついています。それは単なる${keywords[4]}ではなく私たちの人生において重要な役割を果たしているのです。${topic}を通して私は多くのことを学びました。`
        ],
        3: [
          `${topic}について考えるとき私たちは様々な${keywords[1]}や${keywords[2]}を思い浮かべることでしょう。それぞれの人にとって${topic}は異なる意味を持っています。`,
          `私自身の経験では${topic}は${keywords[3]}と深く結びついています。それは単なる${keywords[4]}ではなく私たちの人生において重要な役割を果たしているのです。${topic}を通して私は多くのことを学びました。特に印象的だったのは${keywords[5] || keywords[0]}との出会いです。この経験は私の人生観を大きく変えました。`,
          `${topic}について考えることで私たちは自分自身をより深く理解することができます。`
        ]
      }
      
      const closings = {
        1: `皆さんもぜひ自分なりの${topic}について考えてみてください。`,
        2: `皆さんもぜひ自分なりの${topic}について考えてみてください。きっと新しい発見があるはずです。`,
        3: `皆さんもぜひ自分なりの${topic}について考えてみてください。きっと新しい発見があるはずです。そしてその発見が皆さんの人生をより豊かにしてくれることでしょう。`
      }
      
      speechExample = {
        speech: {
          opening: openings[duration] || openings[2],
          body: bodies[duration] || bodies[2],
          closing: closings[duration] || closings[2]
        },
        tips: [
          '個人的な体験を具体的に話すと聞き手の共感を得やすくなります',
          '関連キーワードを自然に織り交ぜながら話に一貫性を持たせましょう'
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
    
    // Return the generated speech example
    return { speechExample, duration }
  } catch (error) {
    console.error('Speech example generation error:', error)
    throw error
  }
}

export async function generateQRCodeAction(url: string) {
  try {
    const qrCodeDataUrl = await generateQRCodeDataURL(url)
    return { qrCode: qrCodeDataUrl }
  } catch (error) {
    console.error('QR code generation error:', error)
    throw new Error('Failed to generate QR code')
  }
}

export async function generateAssociationsAction(topic: string) {
  try {
    let associations = ''
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite',
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 300
        }
      })
      
      const prompt = `
「${topic}」というお題から連想されるキーワードを10個生成してください。

要件:
- キーワードは「→」で繋いでください
- 各キーワードは簡潔に（1-3語程度）
- スピーチで使いやすい言葉を選ぶ
- 日本語で出力

良い例:
犬 → 散歩 → 公園 → 子ども → 笑顔 → 幸せ → 家族 → 絆 → 思い出 → 成長

悪い例（避けてください）:
犬 → 犬種 → 血統書 → ブリーダー → 繁殖 ← 専門的すぎる
`
      
      const result = await model.generateContent(prompt)
      associations = result.response.text().trim()
    } catch (error) {
      console.error('AI generation failed, using fallback:', error)
      // Fallback associations
      const fallbackWords = [
        '始まり', '出会い', '発見', '挑戦', '成長', 
        '経験', '喜び', '感謝', '未来', '希望'
      ]
      associations = fallbackWords.join(' → ')
    }
    
    return { associations }
  } catch (error) {
    console.error('Association generation error:', error)
    throw error
  }
}

export async function generateSpeechAction(topic: string, associations: string) {
  try {
    let speechData = null
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite',
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              speech: {
                type: SchemaType.OBJECT,
                properties: {
                  opening: { type: SchemaType.STRING },
                  body: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                  },
                  closing: { type: SchemaType.STRING }
                },
                required: ['opening', 'body', 'closing']
              },
              tips: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
              }
            },
            required: ['speech', 'tips']
          }
        }
      })
      
      const prompt = `
「${topic}」というお題で、以下の連想キーワードを参考にした3分間のスピーチ例を作成してください。

連想キーワード: ${associations}

要件:
- 導入、本文（2-3段落）、結びの構成だが、セクション名は出力しない
- 連想キーワードを適度に取り入れる（全てを使う必要はない）
- 日本語で出力
- 聞き手を惹きつける内容
- 3分で話せる長さ（800-1000文字程度）
- 句読点は適切に使用し、読点（、）の過剰な使用は避ける
- 段落間は自然につながるようにする

構成:
- opening: 導入部分（セクション名は不要）
- body: 本文（2-3段落の配列、セクション名は不要）
- closing: 結びの部分（セクション名は不要）
- tips: スピーチのコツ（2-3個）
`
      
      const result = await model.generateContent(prompt)
      const response = result.response
      speechData = JSON.parse(response.text())
    } catch (error) {
      console.error('AI generation failed, using fallback:', error)
      // Fallback speech
      const words = associations.split('→').map(w => w.trim())
      speechData = {
        speech: {
          opening: `今日は「${topic}」についてお話しさせていただきます。このお題を聞いて、私は${words[0] || 'いろいろなこと'}を思い浮かべました。`,
          body: [
            `${topic}というものは、私たちの日常生活の中で様々な形で現れます。それは時に${words[1] || '新しい発見'}をもたらし、時に${words[2] || '大切な気づき'}を与えてくれます。`,
            `私自身の経験を振り返ってみると、${topic}に関連した${words[3] || '思い出'}がたくさんあります。それらの経験は、私に${words[4] || '成長の機会'}を与えてくれました。`
          ],
          closing: `${topic}について考えることで、私たちは自分自身をより深く理解することができます。皆さんもぜひ、自分なりの${topic}について考えてみてください。`
        },
        tips: [
          '個人的な体験を具体的に話すと、聞き手の共感を得やすくなります',
          '連想キーワードを自然に織り交ぜながら、話に一貫性を持たせましょう'
        ]
      }
    }
    
    return speechData
  } catch (error) {
    console.error('Speech generation error:', error)
    throw error
  }
}