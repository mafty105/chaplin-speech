import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Shield, RefreshCw, Scale } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import './terms.css'

export default function TermsPage() {
  const sections = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'サービスの概要',
      content: [
        'ChaplinSpeech（以下、「本サービス」）は、チャップリン方式を用いたスピーチ練習支援ウェブアプリケーションです。',
        '',
        '本サービスでは以下の機能を提供します：',
        '• AIによるスピーチお題の自動生成',
        '• 連想ワードの生成',
        '• スピーチ例の提供',
        '• QRコードによるお題の共有',
        '',
        '本利用規約は、本サービスの利用に関する条件を定めるものです。'
      ]
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: '利用条件',
      content: [
        '本サービスを利用することにより、以下に同意したものとみなされます：',
        '',
        '• 本利用規約およびプライバシーポリシーに同意すること',
        '• 日本国内の法令を遵守すること',
        '• 他者の権利を侵害しないこと',
        '• 本サービスを適切な目的で使用すること',
        '',
        '年齢制限は特に設けていませんが、未成年者は保護者の同意を得て利用してください。'
      ]
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: '禁止事項',
      content: [
        '以下の行為を禁止します：',
        '',
        '• 本サービスへの不正アクセスや攻撃',
        '• 過度なリクエストによるサービスへの負荷',
        '• 不適切なコンテンツの生成を意図した利用',
        '• 商業目的での無断使用',
        '• 本サービスのリバースエンジニアリング',
        '• その他、運営が不適切と判断する行為',
        '',
        '違反が認められた場合、サービスの利用を制限する場合があります。'
      ]
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: '知的財産権',
      content: [
        '• 本サービスのデザイン、ロゴ、コードは運営に帰属します',
        '• AIが生成したコンテンツは、ユーザーが自由に利用できます',
        '• ただし、生成されたコンテンツの利用は自己責任となります',
        '',
        'チャップリン方式は一般的な練習方法であり、本サービスはその実装の一つです。'
      ]
    },
    {
      icon: <Scale className="w-5 h-5" />,
      title: '免責事項',
      content: [
        '本サービスは「現状のまま」提供されます：',
        '',
        '• サービスの継続性、正確性、完全性は保証されません',
        '• AIが生成するコンテンツの品質は保証されません',
        '• サービスの利用により生じた損害について責任を負いません',
        '• 外部サービス（Google Gemini API等）の障害による影響は免責されます',
        '',
        '本サービスは個人の練習用ツールであり、プロフェッショナルな用途での利用は推奨しません。'
      ]
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: '規約の変更',
      content: [
        '本利用規約は、以下の場合に変更される可能性があります：',
        '',
        '• 法令の変更',
        '• サービス内容の変更',
        '• その他、運営上必要と判断した場合',
        '',
        '重要な変更がある場合は、サービス上で通知します。',
        '変更後も継続して利用する場合、変更後の規約に同意したものとみなされます。'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="max-w-[720px] mx-auto px-4 py-8">
        <header className="mb-8 fade-slide-down">
          <Link href="/">
            <Button variant="subtle" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          
          <h1 className="text-2xl font-bold text-[#172B4D] mb-2">
            利用規約
          </h1>
          <p className="text-sm">
            最終更新日：2024年12月
          </p>
        </header>

        <div className="mb-8 fade-slide-up animation-delay-100">
          <Card>
            <CardContent className="py-6">
              <p className="text-[#172B4D] leading-7">
                本利用規約（以下、「本規約」）は、ChaplinSpeechの利用条件を定めるものです。
                本サービスを利用することにより、本規約に同意したものとみなされます。
                同意いただけない場合は、本サービスの利用をお控えください。
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`fade-slide-left animation-delay-${200 + index * 100}`}
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

        <div className="mt-8 fade-slide-up animation-delay-800">
          <Card className="bg-[#E3FCEF] border-[#ABF5D1]">
            <CardContent className="py-6">
              <h3 className="font-medium text-[#172B4D] mb-2">
                準拠法および管轄裁判所
              </h3>
              <p className="text-sm text-[#172B4D] leading-6">
                本規約の解釈および適用は、日本法に準拠するものとします。
                本サービスに関して生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 fade-slide-up animation-delay-900">
          <Card className="bg-[#FFEBE6] border-[#FFBDAD]">
            <CardContent className="py-6">
              <h3 className="font-medium text-[#172B4D] mb-2">
                お問い合わせ
              </h3>
              <p className="text-sm text-[#172B4D] leading-6">
                本規約に関するご質問は、以下のGitHubリポジトリのIssueページよりお問い合わせください：
                <br />
                <Link 
                  href="https://github.com/mafty105/chaplin-speech" 
                  className="text-[#0052CC] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://github.com/mafty105/chaplin-speech
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}