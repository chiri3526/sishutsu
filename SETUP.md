# セットアップガイド

## 1. Firebase プロジェクトの設定

### 1.1 Firebase Console での設定

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト「sishutsu」を選択（プロジェクトID: sishutsu-beed7）

### 1.2 Authentication の有効化

1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブで「メール/パスワード」を有効化

### 1.3 Firestore Database の作成

1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「本番環境モードで開始」を選択
4. ロケーションを選択（asia-northeast1 推奨）

### 1.4 Firestore セキュリティルールの設定

1. Firestore Database の「ルール」タブを開く
2. 以下のルールを貼り付けて「公開」

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expenseId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 1.5 Firebase 設定情報の取得

1. プロジェクト設定（歯車アイコン）を開く
2. 「全般」タブの「マイアプリ」セクションで「ウェブアプリを追加」
3. アプリのニックネームを入力（例：sishutsu-web）
4. 表示される設定情報をコピー

## 2. ローカル環境のセットアップ

### 2.1 環境変数の設定

`.env.example` を `.env` にコピー：

```bash
cp .env.example .env
```

`.env` ファイルを編集して、Firebase の設定情報を入力：

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=sishutsu-beed7.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=sishutsu-beed7.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=724257229704
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 2.2 依存パッケージのインストール

```bash
npm install
```

### 2.3 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開く

## 3. 初期データの作成

### 3.1 ユーザー登録

1. アプリを開いて「新規登録」タブをクリック
2. メールアドレスとパスワードを入力して登録

### 3.2 カテゴリの作成

1. ログイン後、左メニューから「カテゴリ管理」を選択
2. 「新規追加」ボタンをクリック
3. 以下のカテゴリを作成：

| カテゴリ名 | 夫負担率 | 妻負担率 |
|-----------|---------|---------|
| 食費 | 50 | 50 |
| 電気代 | 50 | 50 |
| 水道代 | 50 | 50 |
| ガス代 | 50 | 50 |
| 通信費 | 50 | 50 |
| 家賃 | 50 | 50 |
| 交通費 | 60 | 40 |
| 医療費 | 50 | 50 |
| 娯楽費 | 50 | 50 |
| 日用品 | 50 | 50 |

### 3.3 サンプルデータの取り込み（オプション）

1. 左メニューから「Excel取り込み」を選択
2. プロジェクトルートの `sample-import.csv` をExcel形式に変換
3. ファイルをアップロードして「インポート実行」

## 4. Netlify へのデプロイ

### 4.1 Netlify アカウントの準備

1. [Netlify](https://www.netlify.com/) にログイン
2. 「Add new site」→「Import an existing project」を選択

### 4.2 リポジトリの接続

1. GitHub/GitLab/Bitbucket からリポジトリを選択
2. ビルド設定は自動検出される（netlify.toml を使用）

### 4.3 環境変数の設定

「Site settings」→「Environment variables」で以下を追加：

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=sishutsu-beed7.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=sishutsu-beed7.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=724257229704
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 4.4 デプロイ

「Deploy site」をクリックしてデプロイ開始

## 5. トラブルシューティング

### Firestore のアクセス権限エラー

- セキュリティルールが正しく設定されているか確認
- ユーザーがログインしているか確認

### カテゴリが表示されない

- Firestore に categories コレクションが作成されているか確認
- カテゴリ管理画面から手動で作成

### Excel 取り込みエラー

- Excel ファイルの列名が正しいか確認（日付、カテゴリ、金額、メモ）
- カテゴリ名が Firestore に登録されているものと一致しているか確認

## 6. 今後の拡張

- AI 分析機能の実装（OpenAI API 連携）
- レシート OCR 機能
- 予算管理機能
- 月次レポート自動生成
- Cloud Functions によるバッチ処理
