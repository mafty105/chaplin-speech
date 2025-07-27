import { createClient } from 'redis'

// Simplified Redis client type
type RedisClient = ReturnType<typeof createClient>

// Global Redis client instance
let redisClient: RedisClient | null = null
let connectionPromise: Promise<RedisClient | null> | null = null

// Redis connection options
const REDIS_OPTIONS = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries: number) => {
      if (retries > 3) {
        console.error('Redis: Max reconnection attempts reached')
        return false
      }
      return Math.min(retries * 100, 3000)
    }
  }
}

// Session TTL (24 hours in seconds)
export const SESSION_TTL = 24 * 60 * 60

/**
 * Get or create Redis client connection
 * Returns null if Redis is unavailable (graceful degradation)
 */
export async function getRedisClient(): Promise<RedisClient | null> {
  // Return existing client if connected
  if (redisClient?.isReady) {
    return redisClient
  }

  // Return ongoing connection attempt
  if (connectionPromise) {
    return connectionPromise
  }

  // Create new connection
  connectionPromise = createRedisConnection()
  return connectionPromise
}

/**
 * Create Redis connection with error handling
 */
async function createRedisConnection(): Promise<RedisClient | null> {
  try {
    const client = createClient(REDIS_OPTIONS)

    // Error handlers
    client.on('error', (err) => {
      console.error('Redis Client Error:', err.message)
    })

    client.on('connect', () => {
      console.log('Redis: Connected successfully')
    })

    client.on('ready', () => {
      console.log('Redis: Ready to accept commands')
    })

    // Connect to Redis
    await client.connect()
    
    redisClient = client
    return client
  } catch (error) {
    console.error('Redis: Failed to connect:', error)
    connectionPromise = null
    return null
  }
}

/**
 * Safe Redis operations with error handling
 */
export const redis = {
  /**
   * Set a value with TTL
   */
  async set(key: string, value: any, ttl: number = SESSION_TTL): Promise<boolean> {
    try {
      const client = await getRedisClient()
      if (!client) return false

      const serialized = JSON.stringify(value)
      await client.setEx(key, ttl, serialized)
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  },

  /**
   * Get a value
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient()
      if (!client) return null

      const value = await client.get(key)
      if (!value) return null

      return JSON.parse(value) as T
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient()
      if (!client) return false

      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  },

  /**
   * Delete a key
   */
  async del(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient()
      if (!client) return false

      await client.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  },

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      const client = await getRedisClient()
      if (!client) return -1

      return await client.ttl(key)
    } catch (error) {
      console.error('Redis TTL error:', error)
      return -1
    }
  },

  /**
   * Check if Redis is available
   */
  async isAvailable(): Promise<boolean> {
    const client = await getRedisClient()
    return client?.isReady || false
  }
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit()
      redisClient = null
      connectionPromise = null
      console.log('Redis: Connection closed')
    } catch (error) {
      console.error('Redis: Error closing connection:', error)
    }
  }
}