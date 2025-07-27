'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ParticipantInput from '@/components/ParticipantInput'
import AboutSection from '@/components/AboutSection'

export default function Home() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateSession = async (participants: string[] | number) => {
    setIsCreating(true)
    setError(null)
    
    try {
      // Call the new session creation API
      const response = await fetch('/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'セッションの作成に失敗しました')
      }

      const data = await response.json()
      
      // Redirect to the session management page
      router.push(data.redirectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セッションの作成に失敗しました。しばらく待ってからお試しください。')
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[480px] mx-auto px-4 py-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-[#0052CC]" />
            <h1 className="text-2xl font-bold text-[#172B4D]">
              ChaplinSpeech
            </h1>
          </div>
          <p className="text-sm text-[#6B778C] leading-5">
            チャップリン方式でスピーチ力を鍛えよう
          </p>
        </motion.header>

        <main className="space-y-6">
          {/* 参加者入力 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ParticipantInput 
              onSubmit={handleCreateSession}
              isLoading={isCreating}
            />
          </motion.div>

          {/* エラー表示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-sm text-[#DE350B] bg-[#FFEBE6] border border-[#FFBDAD] px-3 py-2 rounded">
                {error}
              </div>
            </motion.div>
          )}
        </main>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <AboutSection />
        </motion.div>
      </div>
    </div>
  )
}