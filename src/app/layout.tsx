import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://charlie-talk.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Charlie Talk - チャップリン方式スピーチ練習 | あがり症克服・雑談力向上・会話力アップに効果的",
    template: "%s | Charlie Talk"
  },
  description: "チャップリン方式でスピーチ力を鍛える練習アプリ。お題から連想する言葉を繋げて創造力と即興力を向上させましょう。あがり症克服、雑談力向上、会話力アップに効果的。",
  keywords: ["スピーチ練習", "チャップリン方式", "プレゼンテーション", "コミュニケーション", "あがり症", "雑談力", "会話力", "即興スピーチ", "連想ゲーム"],
  authors: [{ name: "Charlie Talk Team" }],
  creator: "Charlie Talk",
  publisher: "Charlie Talk",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Charlie Talk - チャップリン方式スピーチ練習 | あがり症克服・雑談力向上・会話力アップ",
    description: "チャップリン方式でスピーチ力を鍛える練習アプリ。お題から連想する言葉を繋げて創造力と即興力を向上させましょう。",
    url: siteUrl,
    siteName: "Charlie Talk",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Charlie Talk - チャップリン方式スピーチ練習 | あがり症克服・雑談力向上・会話力アップ",
    description: "チャップリン方式でスピーチ力を鍛える練習アプリ。お題から連想する言葉を繋げて創造力と即興力を向上させましょう。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon.ico', rel: 'shortcut icon' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180' }
    ]
  },
  manifest: '/favicon/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#FAFBFC] text-[#172B4D]`}
      >
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
