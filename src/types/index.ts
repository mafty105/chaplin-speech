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