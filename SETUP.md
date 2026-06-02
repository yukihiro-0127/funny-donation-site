# 🚀 セットアップガイド

このガイドでは、Stripe決済とPayPay決済を統合した募金サイトのセットアップ方法を説明します。

## 📋 前提条件

- Node.js (v14以上)
- npm または yarn
- Stripeアカウント（テストモード）
- PayPayアカウント（オプション）

## 🔧 インストール手順

### 1. 依存関係のインストール

```bash
cd funny-donation-site
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成します：

```bash
cp .env.example .env
```

### 3. Stripe APIキーの取得と設定

#### Stripeアカウントの作成
1. [Stripe](https://stripe.com/jp)にアクセス
2. アカウントを作成（無料）
3. ダッシュボードにログイン

#### APIキーの取得
1. Stripeダッシュボードで「開発者」→「APIキー」に移動
2. **テストモード**に切り替え（重要！）
3. 以下のキーをコピー：
   - 公開可能キー（`pk_test_...`で始まる）
   - シークレットキー（`sk_test_...`で始まる）

#### .envファイルに設定
```env
STRIPE_SECRET_KEY=sk_test_あなたのシークレットキー
STRIPE_PUBLISHABLE_KEY=pk_test_あなたの公開可能キー
```

### 4. PayPay APIキーの設定（オプション）

PayPay決済を有効にする場合：

1. [PayPay for Developers](https://developer.paypay.ne.jp/)にアクセス
2. アカウントを作成
3. APIキーを取得
4. `.env`ファイルに追加：

```env
PAYPAY_API_KEY=your_api_key
PAYPAY_API_SECRET=your_api_secret
PAYPAY_MERCHANT_ID=your_merchant_id
```

**注意**: 現在のPayPay実装はデモ版です。実際の運用には正式なSDKの統合が必要です。

## 🎯 サーバーの起動

### 開発モード（自動再起動）
```bash
npm run dev
```

### 本番モード
```bash
npm start
```

サーバーが起動したら、ブラウザで以下にアクセス：
```
http://localhost:3000
```

## 🧪 テスト方法

### Stripeテストカード

Stripeのテストモードでは、以下のテストカード番号を使用できます：

#### 成功するカード
- **カード番号**: `4242 4242 4242 4242`
- **有効期限**: 任意の未来の日付（例：12/34）
- **CVC**: 任意の3桁（例：123）
- **郵便番号**: 任意（例：123-4567）

#### 3Dセキュア認証が必要なカード
- **カード番号**: `4000 0027 6000 3184`

#### 決済が失敗するカード
- **カード番号**: `4000 0000 0000 0002`

詳細は[Stripeテストカード一覧](https://stripe.com/docs/testing)を参照してください。

### PayPayテスト

現在の実装はデモモードです。実際のPayPay決済をテストするには、PayPay Sandboxアカウントが必要です。

## 📊 動作確認

### 1. ヘルスチェック
```bash
curl http://localhost:3000/health
```

期待される応答：
```json
{
  "status": "ok",
  "timestamp": "2026-06-02T08:00:00.000Z",
  "stripe": true,
  "paypay": false
}
```

### 2. 決済フロー
1. 金額を選択（¥100、¥500、¥1,000、¥5,000）
2. 決済方法を選択（クレジットカード or PayPay）
3. カード情報を入力（Stripeの場合）
4. 「この馬鹿げた夢を応援する」ボタンをクリック
5. 決済完了モーダルが表示される

## 🔒 セキュリティ

### 重要な注意事項

1. **本番環境では必ずHTTPSを使用**
   - Let's Encryptなどで無料のSSL証明書を取得

2. **環境変数を絶対に公開しない**
   - `.env`ファイルはGitにコミットしない
   - `.gitignore`に`.env`が含まれていることを確認

3. **テストモードと本番モードを区別**
   - 開発中は必ずStripeのテストモードを使用
   - 本番環境に移行する際は、本番用のAPIキーに切り替え

4. **Webhookの設定**
   - 本番環境では、Stripe Webhookを設定して決済イベントを受信

## 🚀 本番環境へのデプロイ

### Herokuへのデプロイ例

```bash
# Heroku CLIのインストール
# https://devcenter.heroku.com/articles/heroku-cli

# Herokuアプリの作成
heroku create your-app-name

# 環境変数の設定
heroku config:set STRIPE_SECRET_KEY=sk_live_your_key
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_your_key

# デプロイ
git push heroku main

# アプリを開く
heroku open
```

### Vercel/Netlifyへのデプロイ

これらのプラットフォームは静的サイトホスティングに特化しているため、バックエンドサーバーは別途デプロイが必要です。

推奨構成：
- フロントエンド: Vercel/Netlify
- バックエンド: Heroku/Railway/Render

## 🐛 トラブルシューティング

### サーバーが起動しない
- Node.jsのバージョンを確認（v14以上）
- `npm install`を再実行
- `.env`ファイルが存在するか確認

### Stripe決済が失敗する
- APIキーが正しく設定されているか確認
- テストモードのキーを使用しているか確認
- ブラウザのコンソールでエラーメッセージを確認

### カード入力フォームが表示されない
- Stripeスクリプトが読み込まれているか確認
- ブラウザのコンソールでエラーを確認
- サーバーが正常に起動しているか確認

## 📞 サポート

問題が解決しない場合：
1. ブラウザのコンソールログを確認
2. サーバーのログを確認
3. [Stripeドキュメント](https://stripe.com/docs)を参照
4. GitHubのIssuesで質問

## 📚 参考リンク

- [Stripe API ドキュメント](https://stripe.com/docs/api)
- [Stripe.js リファレンス](https://stripe.com/docs/js)
- [PayPay API ドキュメント](https://developer.paypay.ne.jp/docs)
- [Express.js ドキュメント](https://expressjs.com/)

---

**楽しい募金活動を！** 🎉