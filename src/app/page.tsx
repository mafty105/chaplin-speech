import { Sparkles } from 'lucide-react'
import ParticipantInput from '@/components/ParticipantInput'
import AboutSection from '@/components/AboutSection'
import { createSession } from './actions'

export default function Home() {

  return (
    <div className="min-h-screen">
      <div className="max-w-[480px] mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-[#0052CC]" />
          <h1 className="text-2xl font-bold text-[#172B4D]">ChaplinSpeech</h1>
        </div>
        <p className="text-sm text-[#6B778C] leading-5">チャップリン方式でスピーチ力を鍛えよう</p>

        <main className="space-y-6">
          <ParticipantInput onSubmit={createSession} />
        </main>
        <AboutSection />
      </div>
    </div>
  )
}
