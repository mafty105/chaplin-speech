import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Clock, User, Share2 } from 'lucide-react'

export function SessionInfoSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">セッション情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span className="text-black">作成日時:</span>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span className="text-black">参加人数:</span>
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SpeechStyleSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5" />
          スピーチスタイル
        </CardTitle>
        <CardDescription>
          生成されるお題とスピーチ例のスタイルを選択してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ParticipantListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">参加者一覧</CardTitle>
        <CardDescription>各参加者のページでスピーチ練習を開始できます</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-[#DFE1E6]">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ShareSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          共有
        </CardTitle>
        <CardDescription>このURLを共有して他の参加者を招待できます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-[#172B4D] mb-1 block">共有URL</label>
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-9" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#172B4D] mb-3">QRコード</p>
          <Skeleton className="h-[200px] w-[200px] mx-auto" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SessionPageSkeleton() {
  return (
    <div className="space-y-6">
      <SpeechStyleSkeleton />
      <SessionInfoSkeleton />
      <ShareSectionSkeleton />
    </div>
  )
}