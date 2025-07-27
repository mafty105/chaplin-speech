export interface Topic {
  id: string
  text: string
  associations: string | null
  associationGeneratedAt: string | null
}

export interface ApiUsage {
  dailyCount: number
  lastResetDate: string
  minuteCount: number
  lastMinuteReset: string
}

export interface AdBannerProps {
  slot: string
  width: number
  height: number
  format: 'horizontal' | 'rectangle' | 'mobile'
}

export interface SpeechExample {
  speech: {
    opening: string
    body: string[]
    closing: string
  }
  tips: string[]
}

export interface EnhancedTopic extends Topic {
  speechExample?: SpeechExample
}

export interface Participant {
  id: string
  name: string
  topicId: string
  topic?: string
}

export interface ParticipantContent {
  keywords: string | null
  keywordsGeneratedAt: string | null
  speechExample: SpeechExample | null
  speechGeneratedAt: string | null
}

export interface Session {
  id: string
  participants: Participant[]
  speechStyle?: SpeechStyle
  topics: Record<string, string> // participantId -> topic
  createdAt: string
  createdBy?: string
  expiresAt: string
}

export interface LegacySession {
  id: string
  topics: EnhancedTopic[]
  participants: number
  speechStyle?: SpeechStyle
  createdAt: string
  createdBy?: string
  expiresAt: string
}

export interface CreateSessionRequest {
  topics: Topic[]
  participants: number
  createdBy?: string
}

export interface CreateSessionResponse {
  sessionId: string
  qrCodeUrl: string
  shareUrl: string
  expiresAt: string
}

export type SpeechStyle = 
  | 'none' 
  | 'funny' 
  | 'moving' 
  | 'educational' 
  | 'surprising'

export interface CreateNewSessionRequest {
  participants: string[] | number // Either array of names or participant count
}

export interface CreateNewSessionResponse {
  sessionId: string
  redirectUrl: string
}

export interface GenerateTopicsRequest {
  sessionId: string
  speechStyle: SpeechStyle
}

export interface GenerateKeywordsRequest {
  sessionId: string
  participantId: string
}

export interface GenerateSpeechRequest {
  sessionId: string
  participantId: string
}

export interface GenerateCompleteSessionRequest {
  participants: number
  speechStyle: SpeechStyle
}

export interface GenerateCompleteSessionResponse {
  sessionId: string
  redirectUrl: string
}

export interface SessionResponse {
  session: Session | null
  error?: string
}