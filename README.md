# AI支出管理アプリ

React + Firebase + Netlify で構築した支出管理アプリケーション

## 機能

- ダッシュボード（月別支出、カテゴリ別グラフ）
- 支出入力フォーム
- カテゴリ管理（夫婦別負担率設定）
- Excel一括取り込み
- 夫婦別負担額の自動計算

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Firebase設定

1. Firebase Console でプロジェクトを作成
2. Authentication を有効化（Email/Password）
3. Firestore Database を作成
4. `.env.example` を `.env` にコピーして設定値を入力

```bash
cp .env.example .env
```

### 3. Firestore セキュリティルール

Firebase Console で以下のルールを設定：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. 初期カテゴリの作成

Firestore Console で `categories` コレクションに以下のドキュメントを手動作成：

```json
{
  "name": "食費",
  "shareRatio": {
    "husband": 0.5,
    "wife": 0.5
  }
}
```

## 開発サーバー起動

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

## Netlify デプロイ

1. Netlify にログイン
2. 「New site from Git」を選択
3. リポジトリを接続
4. Build settings は自動検出（netlify.toml を使用）
5. Environment variables に Firebase 設定を追加

## Excel取り込みフォーマット

| 日付 | カテゴリ | 金額 | メモ |
|------|----------|------|------|
| 2024-01-01 | 食費 | 5000 | スーパー |

## 技術スタック

- React 19
- TypeScript
- Material-UI
- Firebase (Firestore, Auth, Storage)
- Recharts
- SheetJS (xlsx)
- Vite
- Netlify
