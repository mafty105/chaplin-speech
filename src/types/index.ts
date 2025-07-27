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

export interface Session {
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