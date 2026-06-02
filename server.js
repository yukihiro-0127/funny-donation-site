require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // 静的ファイルを提供

// ルートパス
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Stripe決済インテントの作成
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, reason } = req.body;

        // 金額のバリデーション
        if (!amount || amount < 100) {
            return res.status(400).json({ error: '金額は100円以上である必要があります' });
        }

        // Payment Intentを作成
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'jpy',
            metadata: {
                reason: reason || 'unknown',
                site: '超絶くだらない募金サイト'
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
    } catch (error) {
        console.error('Stripe Payment Intent作成エラー:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stripe Webhookエンドポイント（オプション）
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook署名検証エラー:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // イベントタイプに応じた処理
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('決済成功:', paymentIntent.id);
            // ここでデータベースに記録するなどの処理を追加
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('決済失敗:', failedPayment.id);
            break;
        default:
            console.log(`未処理のイベントタイプ: ${event.type}`);
    }

    res.json({received: true});
});

// PayPay決済エンドポイント（簡易実装）
app.post('/create-paypay-payment', async (req, res) => {
    try {
        const { amount, reason } = req.body;

        // 金額のバリデーション
        if (!amount || amount < 100) {
            return res.status(400).json({ error: '金額は100円以上である必要があります' });
        }

        // 注意: PayPay APIの実装には正式なSDKとAPIキーが必要です
        // これは簡易的なデモ実装です
        
        // 実際のPayPay API実装例:
        // const paypay = require('@paypayopa/paypayopa-sdk-node');
        // paypay.Configure({
        //     clientId: process.env.PAYPAY_API_KEY,
        //     clientSecret: process.env.PAYPAY_API_SECRET,
        //     merchantId: process.env.PAYPAY_MERCHANT_ID,
        //     productionMode: false
        // });

        // デモ用のレスポンス
        const paymentId = 'demo_' + Date.now();
        const paymentUrl = `https://www.paypay.ne.jp/portal/payment/${paymentId}`;

        res.json({
            success: true,
            paymentId: paymentId,
            paymentUrl: paymentUrl,
            message: 'PayPay決済URLを生成しました（デモ）',
            note: '実際の運用には正式なPayPay APIキーが必要です'
        });
    } catch (error) {
        console.error('PayPay決済エラー:', error);
        res.status(500).json({ error: error.message });
    }
});

// 決済履歴の取得（オプション）
app.get('/api/donations', async (req, res) => {
    try {
        // 実際の実装ではデータベースから取得
        res.json({
            totalDonors: 1234,
            totalAmount: 567890,
            recentDonations: [
                { amount: 1000, reason: 'ramen', timestamp: new Date() },
                { amount: 500, reason: 'cat', timestamp: new Date() }
            ]
        });
    } catch (error) {
        console.error('募金履歴取得エラー:', error);
        res.status(500).json({ error: error.message });
    }
});

// ヘルスチェック
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        stripe: !!process.env.STRIPE_SECRET_KEY,
        paypay: !!process.env.PAYPAY_API_KEY
    });
});

// エラーハンドリング
app.use((err, req, res, next) => {
    console.error('サーバーエラー:', err.stack);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🎪 超絶くだらない募金サイト サーバー起動`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '設定済み' : '未設定'}`);
    console.log(`💰 PayPay: ${process.env.PAYPAY_API_KEY ? '設定済み' : '未設定'}`);
});

module.exports = app;

// Made with Bob
