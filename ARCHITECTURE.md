# アーキテクチャドキュメント

## プロジェクト構造

```
sishutsu/
├── public/                 # 静的ファイル
├── src/
│   ├── components/        # 共通コンポーネント
│   │   └── Layout.tsx    # アプリケーションレイアウト
│   ├── firebase/         # Firebase 設定
│   │   └── config.ts     # Firebase 初期化
│   ├── hooks/            # カスタムフック
│   │   ├── useAuth.ts    # 認証フック
│   │   ├── useCategories.ts  # カテゴリ管理フック
│   │   └── useExpenses.ts    # 支出管理フック
│   ├── pages/            # ページコンポーネント
│   │   ├── Dashboard.tsx     # ダッシュボード
│   │   ├── ExpenseInput.tsx  # 支出入力
│   │   ├── Categories.tsx    # カテゴリ管理
│   │   ├── ExcelImport.tsx   # Excel取り込み
│   │   ├── Settings.tsx      # 設定
│   │   └── Login.tsx         # ログイン
│   ├── types/            # TypeScript 型定義
│   │   └── index.ts
│   ├── utils/            # ユーティリティ関数
│   │   ├── calculations.ts   # 計算ロジック
│   │   ├── excelImport.ts    # Excel取り込み
│   │   └── seedData.ts       # 初期データ
│   ├── App.tsx           # ルーティング設定
│   ├── main.tsx          # エントリーポイント
│   └── vite-env.d.ts     # 環境変数型定義
├── .env.example          # 環境変数テンプレート
├── .gitignore
├── firebase.json         # Firebase 設定
├── firestore.rules       # Firestore セキュリティルール
├── firestore.indexes.json # Firestore インデックス
├── netlify.toml          # Netlify 設定
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── SETUP.md
└── ARCHITECTURE.md
```

## 技術スタック

### フロントエンド
- **React 19**: UI ライブラリ
- **TypeScript**: 型安全性
- **Vite**: ビルドツール
- **Material-UI**: UI コンポーネント
- **React Router**: ルーティング
- **Recharts**: グラフ描画
- **date-fns**: 日付操作

### バックエンド（BaaS）
- **Firebase Authentication**: ユーザー認証
- **Firestore**: NoSQL データベース
- **Firebase Storage**: ファイルストレージ（将来的に）

### データ処理
- **SheetJS (xlsx)**: Excel ファイル処理
- **Papaparse**: CSV ファイル処理

### ホスティング
- **Netlify**: 静的サイトホスティング

## データモデル

### Firestore コレクション

#### expenses
```typescript
{
  id: string;              // 自動生成
  userId: string;          // ユーザーID
  date: string;            // 日付 (YYYY-MM-DD)
  categoryId: string;      // カテゴリID
  amount: number;          // 金額
  memo?: string;           // メモ
  husbandAmount: number;   // たかし負担額
  wifeAmount: number;      // まみ負担額
}
```

#### categories
```typescript
{
  id: string;              // 自動生成
  name: string;            // カテゴリ名
  shareRatio: {
    husband: number;       // たかし負担率 (0-1)
    wife: number;          // まみ負担率 (0-1)
  }
}
```

## 主要機能

### 1. 認証（Authentication）
- メール/パスワード認証
- Firebase Authentication を使用
- ログイン状態の永続化

### 2. ダッシュボード
- 月別総支出表示
- たかし・まみ別負担額表示
- 前月比較
- カテゴリ別グラフ（円グラフ、棒グラフ）
- 月別推移グラフ（折れ線グラフ）

### 3. 支出入力
- 日付、カテゴリ、金額、メモの入力
- 自動的にたかし・まみ別負担額を計算
- 支出一覧表示
- 削除機能

### 4. カテゴリ管理
- カテゴリの追加・編集・削除
- たかし・まみ別負担率の設定
- カテゴリ一覧表示

### 5. Excel 取り込み
- Excel/CSV ファイルのアップロード
- データプレビュー
- 一括インポート
- カテゴリ名の自動マッピング

### 6. 設定
- アカウント情報表示
- 将来的な拡張用

## データフロー

### 支出入力フロー
```
1. ユーザーが支出情報を入力
2. カテゴリの負担率を取得
3. たかし・まみ別負担額を自動計算
4. Firestore に保存
5. リアルタイムで一覧に反映
```

### Excel 取り込みフロー
```
1. ユーザーが Excel ファイルをアップロード
2. SheetJS でファイルを解析
3. JSON データに変換
4. カテゴリ名から categoryId を取得
5. 各行のたかし・まみ別負担額を計算
6. Firestore に一括保存
```

### ダッシュボード表示フロー
```
1. Firestore から支出データを取得
2. 月別・カテゴリ別に集計
3. グラフ用データに変換
4. Recharts で可視化
```

## セキュリティ

### Firestore セキュリティルール
- ユーザーは自分の支出データのみ読み書き可能
- カテゴリは認証済みユーザー全員が読み書き可能
- userId による厳密なアクセス制御

### 環境変数
- Firebase 設定は環境変数で管理
- `.env` ファイルは Git 管理外
- Netlify の環境変数機能を使用

## パフォーマンス最適化

### Firestore クエリ
- userId と date でインデックス作成
- 必要なデータのみ取得
- useMemo でデータ集計をキャッシュ

### React 最適化
- カスタムフックでロジックを分離
- 不要な再レンダリングを防止
- コンポーネントの適切な分割

## 今後の拡張計画

### Cloud Functions
- 定期的な集計処理
- メール通知
- データバックアップ

### 追加機能
- レシート OCR（Google Cloud Vision API）
- 予算管理
- 固定費テンプレート
- データエクスポート（PDF、Excel）
- 複数ユーザー対応（家族共有）

## デプロイメント

### 開発環境
```bash
npm run dev
```

### 本番ビルド
```bash
npm run build
```

### Netlify デプロイ
- Git push で自動デプロイ
- プレビューデプロイ対応
- 環境変数は Netlify で管理

## テスト戦略（今後）

- Unit Tests: Vitest
- Integration Tests: React Testing Library
- E2E Tests: Playwright
- Firebase Emulator でローカルテスト
