import { ArrowLeft, Shield, Eye, Database, Clock, UserCheck, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  const sections = [
    {
      icon: <Database className="w-5 h-5" />,
      title: '収集する情報',
      content: [
        '本サービスでは、以下の情報を一時的に収集・処理します：',
        '• 生成されたスピーチのお題',
        '• 連想ワード',
        '• AIが生成したスピーチ例',
        '• セッションID（共有機能使用時）',
        '',
        '※ 個人を特定できる情報（氏名、メールアドレス、電話番号等）は一切収集しません。'
      ]
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: '情報の利用目的',
      content: [
        '収集した情報は以下の目的でのみ使用します：',
        '• スピーチ練習用コンテンツの生成',
        '• QRコード共有機能の提供',
        '• サービスの品質向上',
        '',
        'Google Gemini APIを使用してコンテンツを生成しますが、入力内容はGoogleのプライバシーポリシーに従って処理されます。'
      ]
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'データの保存期間',
      content: [
        '• セッションデータ：24時間後に自動削除',
        '• ブラウザのセッションストレージ：ブラウザを閉じると削除',
        '• クッキー：使用していません',
        '',
        '共有されたセッションは24時間後に自動的に削除され、復元することはできません。'
      ]
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'データの保護',
      content: [
        '以下の対策によりデータを保護しています：',
        '• HTTPS通信による暗号化',
        '• APIキーのサーバーサイド管理',
        '• Redis（Upstash）による安全なデータストレージ',
        '• 24時間での自動データ削除'
      ]
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: '第三者への提供',
      content: [
        '本サービスは、ユーザーの情報を第三者に販売、貸与、または共有することはありません。',
        '',
        'ただし、以下のサービスを利用しています：',
        '• Google Gemini API（コンテンツ生成）',
        '• Upstash Redis（セッションデータの一時保存）',
        '',
        'これらのサービスは、それぞれのプライバシーポリシーに従って動作します。'
      ]
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: 'お問い合わせ',
      content: [
        'プライバシーポリシーに関するご質問は、GitHubのIssueページよりお問い合わせください。',
        '',
        'GitHub: https://github.com/mafty105/chaplin-speech'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="max-w-[720px] mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/">
            <Button variant="subtle" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          
          <h1 className="text-2xl font-bold text-[#172B4D] mb-2">
            プライバシーポリシー
          </h1>
          <p className="text-sm">
            最終更新日：2024年12月
          </p>
        </header>

        <div className="mb-8">
          <Card>
            <CardContent className="py-6">
              <p className="text-[#172B4D] leading-7">
                ChaplinSpeech（以下、「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
                本プライバシーポリシーは、本サービスがどのような情報を収集し、どのように使用・保護するかを説明するものです。
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-[#0052CC]">{section.icon}</span>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.content.map((paragraph, i) => (
                      <p key={i} className="text-sm text-[#172B4D] leading-6">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Card className="bg-[#DEEBFF] border-[#B3D4FF]">
            <CardContent className="py-6">
              <h3 className="font-medium text-[#172B4D] mb-2">
                プライバシーポリシーの変更
              </h3>
              <p className="text-sm text-[#172B4D] leading-6">
                本プライバシーポリシーは、必要に応じて更新される場合があります。
                重要な変更がある場合は、本サービス上で通知します。
                継続的な利用により、変更後のプライバシーポリシーに同意したものとみなされます。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}