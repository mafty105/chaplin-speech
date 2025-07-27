'use client'

import { motion } from 'framer-motion'
import { Info, Target, Users, Zap, BookOpen, Trophy, Film, Share2, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutSection() {
  const features = [
    {
      icon: <Target className="w-4 h-4" />,
      title: "即興力の向上",
      description: "与えられたお題から瞬時に連想を広げる力を養います"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      title: "創造性の刺激",
      description: "予期しない言葉の組み合わせから新しいアイデアが生まれます"
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      title: "語彙力の拡大",
      description: "連想を通じて、普段使わない言葉との出会いがあります"
    },
    {
      icon: <Share2 className="w-4 h-4" />,
      title: "QRコードで簡単共有",
      description: "生成したお題をQRコードで仲間と即座に共有できます"
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      title: "AI生成のスピーチ例",
      description: "各お題に対してAIが生成した参考スピーチを確認できます"
    }
  ]

  const targetUsers = [
    "プレゼンテーションスキルを向上させたいビジネスパーソン",
    "人前で話すことに自信をつけたい学生",
    "創造的な発想力を鍛えたいクリエイター",
    "コミュニケーション能力を高めたい全ての方"
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="w-5 h-5 text-[#6B778C]" />
          ChaplinSpeechとは
        </CardTitle>
        <CardDescription>
          チャーリー・チャップリンが実践していたスピーチ練習法をデジタル化
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* What is it */}
        <div>
          <h3 className="font-medium text-[#172B4D] mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFAB00]" />
            チャップリン方式とは？
          </h3>
          <p className="text-sm text-[#6B778C] leading-5">
            チャップリン方式は、与えられたお題から連想ゲームのように言葉を繋げていき、
            そのお題についてスピーチを行う練習方法です。
            連想ワードは発想のヒントとして活用し、予期しないテーマでも即座に話を組み立てる力が身につきます。
          </p>
        </div>

        {/* Chaplin's Story */}
        <div className="bg-[#F4F5F7] p-4 rounded border border-[#DFE1E6]">
          <h3 className="font-medium text-[#172B4D] mb-2 flex items-center gap-2">
            <Film className="w-4 h-4 text-[#6B778C]" />
            チャップリンの物語
          </h3>
          <p className="text-sm text-[#6B778C] leading-5 mb-3">
            彼は往年、話の上手な人として知られており、世界中の人が彼の話を聞くのを楽しみにしていました。
          </p>
          <p className="text-sm text-[#6B778C] leading-5 mb-3">
            ところがチャップリンは、若い頃に話し下手で悩んでいたそうです。
            人前で話せばすぐに上がってしまうし、言いたいことをきちんと伝えられませんでした。
          </p>
          <p className="text-sm text-[#6B778C] leading-5">
            そこで、チャップリンは、苦手意識を克服し、
            「突然指名されても、聞き手の印象に残る話をしたい」と考え、
            スピーチの練習を始めました。
          </p>
          <div className="mt-3 p-3 bg-[#E6FCFF] border border-[#B3F5FF] rounded">
            <p className="text-xs text-[#0747A6] text-center font-medium">
              話し下手だった青年が、努力によって<br />
              世界中から愛される話し手になった
            </p>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="font-medium text-[#172B4D] mb-3">このアプリでできること</h3>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3"
              >
                <div className="text-[#0052CC] mt-0.5">{feature.icon}</div>
                <div>
                  <h4 className="font-medium text-[#172B4D] text-sm">{feature.title}</h4>
                  <p className="text-xs text-[#6B778C] mt-0.5">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Target Users */}
        <div>
          <h3 className="font-medium text-[#172B4D] mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#36B37E]" />
            こんな方におすすめ
          </h3>
          <ul className="space-y-1.5">
            {targetUsers.map((user, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-sm text-[#6B778C] flex items-start gap-2"
              >
                <span className="text-[#36B37E] mt-0.5">•</span>
                <span>{user}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* How to use */}
        <div className="bg-[#DEEBFF] border border-[#B3D4FF] p-4 rounded">
          <h3 className="font-medium text-[#172B4D] mb-2">使い方</h3>
          <ol className="space-y-1.5 text-sm text-[#172B4D]">
            <li className="flex gap-2">
              <span className="font-semibold text-[#0052CC]">1.</span>
              参加人数を入力して「お題を生成」をクリック
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[#0052CC]">2.</span>
              自動的に専用セッションページへ移動します
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[#0052CC]">3.</span>
              お題をクリックすると連想ワードとスピーチ例が表示されます
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[#0052CC]">4.</span>
              QRコードでお題を仲間と共有して一緒に練習！
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}