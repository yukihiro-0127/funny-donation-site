# ⚡ クイックスタートガイド

5分で決済機能付き募金サイトを起動する方法

## 📦 必要なもの

- Node.js（v14以上）
- Stripeアカウント（無料）

## 🚀 3ステップで起動

### ステップ1: Node.jsのインストール

Node.jsがインストールされていない場合：

**Mac:**
```bash
# Homebrewを使用
brew install node

# または公式サイトからダウンロード
# https://nodejs.org/
```

**Windows:**
```
公式サイトからインストーラーをダウンロード
https://nodejs.org/
```

確認：
```bash
node --version
npm --version
```

### ステップ2: Stripe APIキーの取得

1. [Stripe](https://stripe.com/jp)にアクセスしてアカウント作成（無料）
2. ダッシュボードにログイン
3. 左上の「テストモード」に切り替え
4. 「開発者」→「APIキー」に移動
5. 以下をコピー：
   - **公開可能キー**: `pk_test_...`
   - **シークレットキー**: `sk_test_...`

### ステップ3: サイトの起動

```bash
# プロジェクトディレクトリに移動
cd funny-donation-site

# 依存関係をインストール
npm install

# 環境変数ファイルを作成
cp .env.example .env

# .envファイルを編集（テキストエディタで開く）
# 以下の行を編集してStripe APIキーを設定：
# STRIPE_SECRET_KEY=sk_test_あなたのシークレットキー
# STRIPE_PUBLISHABLE_KEY=pk_test_あなたの公開可能キー

# サーバーを起動
npm start
```

ブラウザで開く：
```
http://localhost:3000
```

## 🧪 テスト決済

### テストカード情報

- **カード番号**: `4242 4242 4242 4242`
- **有効期限**: `12/34`（任意の未来の日付）
- **CVC**: `123`（任意の3桁）
- **郵便番号**: `123-4567`（任意）

### 決済フロー

1. 金額を選択（¥100、¥500、¥1,000、¥5,000）
2. 「クレジットカード」を選択
3. テストカード情報を入力
4. 「この馬鹿げた夢を応援する」をクリック
5. 決済完了！🎉

## 🎯 次のステップ

### PayPay決済を追加

1. [PayPay for Developers](https://developer.paypay.ne.jp/)でアカウント作成
2. APIキーを取得
3. `.env`ファイルに追加：
```env
PAYPAY_API_KEY=your_api_key
PAYPAY_API_SECRET=your_api_secret
PAYPAY_MERCHANT_ID=your_merchant_id
```

### 本番環境へ移行

1. Stripeダッシュボードで「本番モード」に切り替え
2. 本番用のAPIキーを取得
3. `.env`ファイルを更新
4. HTTPS対応のサーバーにデプロイ

詳細は [`SETUP.md`](SETUP.md) を参照してください。

## ❓ トラブルシューティング

### サーバーが起動しない

```bash
# Node.jsのバージョン確認
node --version  # v14以上が必要

# 依存関係を再インストール
rm -rf node_modules
npm install
```

### 決済が失敗する

- `.env`ファイルが存在するか確認
- Stripe APIキーが正しく設定されているか確認
- テストモードのキーを使用しているか確認
- ブラウザのコンソールでエラーを確認

### カード入力フォームが表示されない

- サーバーが起動しているか確認（`http://localhost:3000`）
- ブラウザのコンソールでエラーを確認
- Stripeスクリプトが読み込まれているか確認

## 📞 ヘルプ

問題が解決しない場合：

1. [`SETUP.md`](SETUP.md) の詳細ガイドを確認
2. [Stripeドキュメント](https://stripe.com/docs)を参照
3. ブラウザのコンソールとサーバーログを確認

---

**楽しい募金活動を！** 🎪💸