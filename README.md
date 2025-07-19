# 応用情報技術者試験 勉強アプリ

友達と一緒に応用情報技術者試験の勉強ができるWebアプリケーションです。

## 主な機能

### 🔥 ストリーク機能
- Duolingoのような連続学習日数の記録
- 毎日の学習習慣を楽しく維持

### 📚 過去問練習
- 応用情報技術者試験の過去問を解く
- 分野別の学習が可能
- 正答率の記録と分析

### 👥 友達との比較
- フレンド機能
- 学習進捗の比較
- ランキング表示

### 📊 学習記録
- 日々の学習時間記録
- 解いた問題数の記録
- 学習統計とグラフ表示

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **アイコン**: Lucide React
- **デプロイ**: Vercel

## 開発環境のセットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone <your-repo-url>
cd ouyou-study-app

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリを確認できます。

## スクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクションビルドを作成
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintでコードをチェック

## プロジェクト構造

```
src/
├── app/
│   ├── globals.css     # グローバルスタイル
│   ├── layout.tsx      # ルートレイアウト
│   └── page.tsx        # ホームページ
├── components/         # 再利用可能コンポーネント
├── lib/               # ユーティリティ関数
└── types/             # TypeScript型定義
```

## Vercelでのデプロイ

1. Vercelアカウントを作成
2. GitHubリポジトリを接続
3. 自動デプロイが設定されます

## 今後の実装予定

- [ ] ユーザー認証（NextAuth.js）
- [ ] データベース連携（Prisma + PostgreSQL）
- [ ] 過去問データのAPI連携
- [ ] フレンド機能
- [ ] プッシュ通知
- [ ] レスポンシブデザインの改善
- [ ] ダークモード対応

## コントリビューション

プルリクエストやイシューの作成を歓迎します！

## ライセンス

MIT License
