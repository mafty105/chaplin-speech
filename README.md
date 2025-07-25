# ChaplinSpeech MVP

チャップリン方式でスピーチ力を鍛える練習アプリケーション

## 機能

- 参加人数に応じたお題の自動生成
- お題からの連想ワード生成（チャップリン方式）
- API使用量の監視と制限
- セッションストレージによるキャッシュ機能
- レスポンシブデザイン対応
- Google AdSense広告配置（プレースホルダー）

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、Google Gemini APIキーを設定：

```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

APIキーは[Google AI Studio](https://makersuite.google.com/app/apikey)から取得できます。

### 3. 開発サーバーの起動

```bash
pnpm dev
```

http://localhost:4321 でアプリケーションが起動します。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **スタイリング**: Tailwind CSS
- **言語**: TypeScript
- **外部API**: Google Gemini API (gemini-1.5-flash)
- **パッケージマネージャー**: pnpm

## API制限

- **分あたり**: 15リクエスト
- **日あたり**: 1500リクエスト（安全マージンで1400に制限）
- 制限到達時は自動的にフォールバックデータを使用

## プロダクション展開

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)にプロジェクトをインポート
2. 環境変数`NEXT_PUBLIC_GEMINI_API_KEY`を設定
3. デプロイ実行

### Google AdSense統合

プロダクション環境では、AdBannerコンポーネントを実際のGoogle AdSenseコードに置き換えてください。

## 今後の拡張予定

- ユーザー認証機能
- お題の履歴保存
- スピーチ録音機能
- SNSシェア機能
- より高度な連想アルゴリズム
