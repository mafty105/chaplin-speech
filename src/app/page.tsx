import { Metadata } from 'next'
import Image from 'next/image'
import ParticipantInput from '@/components/ParticipantInput'
import AboutSection from '@/components/AboutSection'
import { createSession } from './actions'

export const metadata: Metadata = {
  title: 'チャップリン方式スピーチ練習を始める',
  description: 'Charlie Talkでチャップリン方式のスピーチ練習を始めましょう。参加者を追加してセッションを開始し、お題から連想する言葉を繋げて即興スピーチ力を鍛えます。',
  openGraph: {
    title: 'Charlie Talk - チャップリン方式スピーチ練習を始める',
    description: 'チャップリン方式でスピーチ力を鍛える練習アプリ。お題から連想する言葉を繋げて創造力と即興力を向上させましょう。',
  },
}

export default function Home() {

  return (
    <div className="min-h-screen">
      <div className="max-w-[480px] mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/logo.svg" alt="ChaplinSpeech Logo" width={24} height={24} />
            <h1 className="text-2xl font-bold">Charlie Talk</h1>
          </div>
          <p className="text-sm leading-5">チャップリンの連想法で会話力を鍛えよう</p>
        </header>

        <main className="space-y-6">
          <ParticipantInput onSubmit={createSession} />
          <AboutSection />
        </main>
      </div>
    </div>
  )
}
