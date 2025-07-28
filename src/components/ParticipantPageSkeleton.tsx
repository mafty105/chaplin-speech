import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Lightbulb, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function TopicCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          お題
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-3/4" />
      </CardContent>
    </Card>
  )
}

export function KeywordsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          関連キーワード
        </CardTitle>
        <CardDescription>
          お題から連想される言葉を使ってスピーチを組み立てましょう
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export function SpeechExampleCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">スピーチ例</CardTitle>
        <CardDescription>関連キーワードを使った3分間スピーチの例です</CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export function ParticipantPageSkeleton({ sessionId }: { sessionId: string }) {
  return (
    <>
      <header className="mb-8">
        <Link
          href={`/session/${sessionId}`}
          className="inline-flex items-center gap-2 mb-4 text-[#0052CC] hover:text-[#0065FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">セッション管理に戻る</span>
        </Link>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-[#0052CC]" />
            <h1 className="text-2xl font-bold text-[#172B4D]">スピーチ練習</h1>
          </div>
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </header>

      <main className="space-y-6">
        <TopicCardSkeleton />
        <KeywordsCardSkeleton />
      </main>
    </>
  )
}