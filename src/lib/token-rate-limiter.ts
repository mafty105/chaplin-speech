import { redis } from './redis'

// Token-based rate limit configuration
const TOKEN_LIMITS = {
  perMinute: parseInt(process.env.GEMINI_TOKEN_LIMIT_PER_MINUTE || '10000'), // 10k tokens per minute
  perHour: parseInt(process.env.GEMINI_TOKEN_LIMIT_PER_HOUR || '100000'), // 100k tokens per hour
  perDay: parseInt(process.env.GEMINI_TOKEN_LIMIT_PER_DAY || '1000000') // 1M tokens per day
}

// Time windows in seconds
const TIME_WINDOWS = {
  minute: 60,
  hour: 3600,
  day: 86400
}

export interface TokenUsageMetadata {
  promptTokenCount?: number
  candidatesTokenCount?: number
  totalTokenCount?: number
  cachedContentTokenCount?: number
}

export class TokenRateLimitError extends Error {
  constructor(
    message: string,
    public resetIn: number,
    public limit: number,
    public remaining: number,
    public windowType: 'minute' | 'hour' | 'day'
  ) {
    super(message)
    this.name = 'TokenRateLimitError'
  }
}

/**
 * Check token rate limit globally for the entire application
 * @param estimatedTokens - Estimated tokens for the upcoming request (optional)
 * @returns Object with allowed status and metadata
 */
export async function checkTokenRateLimit(
  estimatedTokens: number = 0
): Promise<{
  allowed: boolean
  remainingTokens: {
    minute: number
    hour: number
    day: number
  }
  resetIn: {
    minute: number
    hour: number
    day: number
  }
  currentUsage: {
    minute: number
    hour: number
    day: number
  }
}> {
  const now = Date.now()
  const currentSecond = Math.floor(now / 1000)
  
  // Use a global key for entire application
  const globalKey = 'global'
  
  // Get current usage for all time windows
  const minuteUsage = await getTokenUsage(globalKey, 'minute', currentSecond)
  const hourUsage = await getTokenUsage(globalKey, 'hour', currentSecond)
  const dayUsage = await getTokenUsage(globalKey, 'day', currentSecond)
  
  // Calculate remaining tokens
  const remainingTokens = {
    minute: TOKEN_LIMITS.perMinute - minuteUsage,
    hour: TOKEN_LIMITS.perHour - hourUsage,
    day: TOKEN_LIMITS.perDay - dayUsage
  }
  
  // Calculate reset times
  const resetIn = {
    minute: TIME_WINDOWS.minute - (currentSecond % TIME_WINDOWS.minute),
    hour: TIME_WINDOWS.hour - (currentSecond % TIME_WINDOWS.hour),
    day: TIME_WINDOWS.day - (currentSecond % TIME_WINDOWS.day)
  }
  
  // Check if request would exceed any limit
  const wouldExceedMinute = minuteUsage + estimatedTokens > TOKEN_LIMITS.perMinute
  const wouldExceedHour = hourUsage + estimatedTokens > TOKEN_LIMITS.perHour
  const wouldExceedDay = dayUsage + estimatedTokens > TOKEN_LIMITS.perDay
  
  const allowed = !wouldExceedMinute && !wouldExceedHour && !wouldExceedDay
  
  return {
    allowed,
    remainingTokens,
    resetIn,
    currentUsage: {
      minute: minuteUsage,
      hour: hourUsage,
      day: dayUsage
    }
  }
}

/**
 * Record token usage after a successful API call
 * @param usageMetadata - Token usage metadata from Gemini API response
 */
export async function recordTokenUsage(
  usageMetadata: TokenUsageMetadata
): Promise<void> {
  const tokenCount = usageMetadata.totalTokenCount || 0
  if (tokenCount === 0) return
  
  const now = Date.now()
  const currentSecond = Math.floor(now / 1000)
  
  // Use a global key for entire application
  const globalKey = 'global'
  
  // Record usage for all time windows
  await incrementTokenUsage(globalKey, 'minute', currentSecond, tokenCount)
  await incrementTokenUsage(globalKey, 'hour', currentSecond, tokenCount)
  await incrementTokenUsage(globalKey, 'day', currentSecond, tokenCount)
}

/**
 * Get token usage for a specific time window
 */
async function getTokenUsage(
  key: string,
  window: 'minute' | 'hour' | 'day',
  currentSecond: number
): Promise<number> {
  const windowStart = Math.floor(currentSecond / TIME_WINDOWS[window]) * TIME_WINDOWS[window]
  const redisKey = `tokens:${window}:${key}:${windowStart}`
  
  try {
    const usage = await redis.get<string>(redisKey)
    return usage ? parseInt(usage) : 0
  } catch (error) {
    console.error('Token rate limiter get error:', error)
    return 0
  }
}

/**
 * Increment token usage for a specific time window
 */
async function incrementTokenUsage(
  key: string,
  window: 'minute' | 'hour' | 'day',
  currentSecond: number,
  tokens: number
): Promise<void> {
  const windowStart = Math.floor(currentSecond / TIME_WINDOWS[window]) * TIME_WINDOWS[window]
  const redisKey = `tokens:${window}:${key}:${windowStart}`
  
  try {
    const client = await redis.isAvailable()
    if (!client) return
    
    const redisClient = await (redis as any).getRedisClient()
    if (!redisClient) return
    
    // Use Redis INCRBY command for atomic increment
    await redisClient.incrBy(redisKey, tokens)
    await redisClient.expire(redisKey, TIME_WINDOWS[window] + 60) // Add 60s buffer
  } catch (error) {
    console.error('Token rate limiter increment error:', error)
  }
}

/**
 * Format reset time for user display
 */
export function formatResetTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60)
    return `${minutes}分`
  } else {
    const hours = Math.ceil(seconds / 3600)
    return `${hours}時間`
  }
}

/**
 * Get the most restrictive limit that would be exceeded
 */
export function getMostRestrictiveLimit(
  remainingTokens: { minute: number; hour: number; day: number }
): { window: 'minute' | 'hour' | 'day'; remaining: number; limit: number } {
  const limits = [
    { window: 'minute' as const, remaining: remainingTokens.minute, limit: TOKEN_LIMITS.perMinute },
    { window: 'hour' as const, remaining: remainingTokens.hour, limit: TOKEN_LIMITS.perHour },
    { window: 'day' as const, remaining: remainingTokens.day, limit: TOKEN_LIMITS.perDay }
  ]
  
  // Sort by remaining tokens (ascending) to find the most restrictive
  return limits.sort((a, b) => a.remaining - b.remaining)[0]
}

/**
 * Wrap an async function with token-based rate limiting
 */
export async function withTokenRateLimit<T extends { response: { usageMetadata?: TokenUsageMetadata } }>(
  fn: () => Promise<T>,
  estimatedTokens: number = 1000 // Default estimate
): Promise<T> {
  // Check rate limit globally
  const rateLimitStatus = await checkTokenRateLimit(estimatedTokens)
  
  if (!rateLimitStatus.allowed) {
    const mostRestrictive = getMostRestrictiveLimit(rateLimitStatus.remainingTokens)
    const resetTimeStr = formatResetTime(rateLimitStatus.resetIn[mostRestrictive.window])
    
    throw new TokenRateLimitError(
      `APIのトークン制限に達しました。${resetTimeStr}後に再度お試しください。` +
      `（${mostRestrictive.window === 'minute' ? '分間' : mostRestrictive.window === 'hour' ? '時間' : '日間'}制限）`,
      rateLimitStatus.resetIn[mostRestrictive.window],
      mostRestrictive.limit,
      mostRestrictive.remaining,
      mostRestrictive.window
    )
  }
  
  try {
    // Execute the function
    const result = await fn()
    
    // Record actual token usage from response
    if (result.response?.usageMetadata) {
      await recordTokenUsage(result.response.usageMetadata)
    }
    
    return result
  } catch (error) {
    // Don't record usage on error
    throw error
  }
}

/**
 * Get current token usage statistics globally
 */
export async function getTokenUsageStats(): Promise<{
  usage: {
    minute: number
    hour: number
    day: number
  }
  limits: {
    minute: number
    hour: number
    day: number
  }
  percentages: {
    minute: number
    hour: number
    day: number
  }
}> {
  const status = await checkTokenRateLimit()
  
  return {
    usage: status.currentUsage,
    limits: {
      minute: TOKEN_LIMITS.perMinute,
      hour: TOKEN_LIMITS.perHour,
      day: TOKEN_LIMITS.perDay
    },
    percentages: {
      minute: Math.round((status.currentUsage.minute / TOKEN_LIMITS.perMinute) * 100),
      hour: Math.round((status.currentUsage.hour / TOKEN_LIMITS.perHour) * 100),
      day: Math.round((status.currentUsage.day / TOKEN_LIMITS.perDay) * 100)
    }
  }
}