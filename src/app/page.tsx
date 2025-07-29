import Image from 'next/image'
import ParticipantInput from '@/components/ParticipantInput'
import AboutSection from '@/components/AboutSection'
import { createSession } from './actions'

export default function Home() {

  return (
    <div className="min-h-screen">
      <div className="max-w-[480px] mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/logo.svg" alt="ChaplinSpeech Logo" width={24} height={24} />
            <h1 className="text-2xl font-bold text-black">ChaplinSpeech</h1>
          </div>
          <p className="text-sm text-[#6B778C] leading-5">チャップリン方式でスピーチ力を鍛えよう</p>
        </header>

        <main className="space-y-6">
          <ParticipantInput onSubmit={createSession} />
          <AboutSection />
        </main>
      </div>
    </div>
  )
}
