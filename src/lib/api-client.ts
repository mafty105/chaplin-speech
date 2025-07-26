// Client-side API functions to call server actions

export async function generateTopics(participants: number): Promise<string[]> {
  try {
    const response = await fetch('/api/generate-topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participants }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate topics')
    }

    const data = await response.json()
    return data.topics
  } catch (error) {
    console.error('Error generating topics:', error)
    throw error
  }
}

export async function generateAssociations(topic: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-associations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate associations')
    }

    const data = await response.json()
    return data.associations
  } catch (error) {
    console.error('Error generating associations:', error)
    throw error
  }
}

export interface SpeechData {
  speech: {
    opening: string
    body: string[]
    closing: string
  }
  tips: string[]
}

export async function generateSpeech(
  topic: string, 
  associations: string
): Promise<SpeechData> {
  try {
    const response = await fetch('/api/generate-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, associations }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate speech')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error generating speech:', error)
    throw error
  }
}