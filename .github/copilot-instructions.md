# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## プロジェクト概要
このプロジェクトは応用情報技術者試験の勉強アプリです。友達と一緒に学習し、お互いの進捗を比較できる機能を提供します。

## 技術スタック
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma (データベース)
- NextAuth.js (認証)
- Vercel (デプロイ)

## 主要機能
1. **過去問練習**: 応用情報技術者試験の過去問を解く
2. **ストリーク機能**: 連続学習日数の記録（Duolingoライク）
3. **学習進捗記録**: 日々の学習時間と問題解答数の記録
4. **友達との比較**: フレンド機能と進捗比較
5. **ダッシュボード**: 学習統計とグラフ表示

## コーディング規約
- TypeScriptを使用し、型安全性を重視
- Tailwind CSSでレスポンシブデザイン
- App Routerのlayout.tsxとpage.tsxパターンを使用
- サーバーコンポーネントとクライアントコンポーネントを適切に分離
- API RouteでRESTful APIを実装

## ディレクトリ構造
```
src/
├── app/
│   ├── api/           # API routes
│   ├── auth/          # 認証関連ページ
│   ├── dashboard/     # ダッシュボード
│   ├── practice/      # 過去問練習
│   └── friends/       # フレンド機能
├── components/        # 再利用可能コンポーネント
├── lib/              # ユーティリティ関数
└── types/            # TypeScript型定義
```

## データモデル
- User: ユーザー情報
- Study: 学習記録
- Question: 過去問データ
- Answer: 解答記録
- Friendship: フレンド関係
- Streak: ストリーク記録
