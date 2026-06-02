// 決済処理用のJavaScriptファイル

let stripe = null;
let elements = null;
let cardElement = null;
let selectedPaymentMethod = 'stripe';
let isServerMode = false;

// Stripeの初期化
async function initializeStripe() {
    try {
        // サーバーが起動しているか確認
        const healthCheck = await fetch('/health').catch(() => null);
        
        if (healthCheck && healthCheck.ok) {
            isServerMode = true;
            console.log('サーバーモード: 実際の決済が可能です');
            
            // サーバーから公開可能キーを取得
            const response = await fetch('/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 100, reason: 'test' })
            });
            
            const data = await response.json();
            
            if (data.publishableKey) {
                stripe = Stripe(data.publishableKey);
                elements = stripe.elements();
                
                // カード要素を作成
                cardElement = elements.create('card', {
                    style: {
                        base: {
                            fontSize: '18px',
                            color: '#333',
                            fontFamily: '"Segoe UI", sans-serif',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#e74c3c',
                            iconColor: '#e74c3c'
                        },
                    },
                    hidePostalCode: true
                });
                
                cardElement.mount('#card-element');
                
                // エラー表示
                cardElement.on('change', (event) => {
                    const displayError = document.getElementById('card-errors');
                    if (event.error) {
                        displayError.textContent = event.error.message;
                    } else {
                        displayError.textContent = '';
                    }
                });
                
                console.log('Stripe初期化完了');
            }
        } else {
            // デモモード
            isServerMode = false;
            console.log('デモモード: 実際の決済は行われません');
            
            // デモ用のカード入力フォームを表示
            const cardElement = document.getElementById('card-element');
            cardElement.innerHTML = `
                <div class="demo-card-form">
                    <div class="demo-notice">
                        <strong>⚠️ デモモード</strong><br>
                        サーバーが起動していないため、実際の決済は行われません。<br>
                        <small>実際の決済を行うには、サーバーを起動してください（npm start）</small>
                    </div>
                    <input type="text" placeholder="カード番号: 4242 4242 4242 4242" class="demo-input" disabled>
                    <div class="demo-input-row">
                        <input type="text" placeholder="MM/YY" class="demo-input demo-input-small" disabled>
                        <input type="text" placeholder="CVC" class="demo-input demo-input-small" disabled>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Stripe初期化エラー:', error);
        isServerMode = false;
    }
}

// 決済方法の切り替え
function setupPaymentMethodToggle() {
    const paymentButtons = document.querySelectorAll('.payment-method-btn');
    const stripeForm = document.getElementById('stripe-form');
    const paypayForm = document.getElementById('paypay-form');
    
    paymentButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // すべてのボタンからactiveクラスを削除
            paymentButtons.forEach(b => b.classList.remove('active'));
            // クリックされたボタンにactiveクラスを追加
            this.classList.add('active');
            
            selectedPaymentMethod = this.dataset.method;
            
            // フォームの表示切り替え
            if (selectedPaymentMethod === 'stripe') {
                stripeForm.style.display = 'block';
                paypayForm.style.display = 'none';
            } else {
                stripeForm.style.display = 'none';
                paypayForm.style.display = 'block';
            }
        });
    });
}

// Stripe決済処理
async function processStripePayment(amount, reason) {
    // デモモードの場合
    if (!isServerMode) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    demo: true,
                    message: 'デモモード: 実際の決済は行われていません'
                });
            }, 1000);
        });
    }
    
    try {
        // Payment Intentを作成
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, reason })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // カード情報で決済を確認
        const { error, paymentIntent } = await stripe.confirmCardPayment(
            data.clientSecret,
            {
                payment_method: {
                    card: cardElement,
                }
            }
        );
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (paymentIntent.status === 'succeeded') {
            return { success: true, paymentIntent };
        } else {
            throw new Error('決済が完了しませんでした');
        }
    } catch (error) {
        console.error('Stripe決済エラー:', error);
        throw error;
    }
}

// PayPay決済処理
async function processPayPayPayment(amount, reason) {
    // デモモード
    if (!isServerMode) {
        return new Promise((resolve) => {
            setTimeout(() => {
                alert('PayPay決済ページが開きます（デモモード）\n実際の運用には正式なPayPay APIキーとサーバーが必要です');
                resolve({
                    success: true,
                    demo: true,
                    message: 'デモモード: 実際の決済は行われていません'
                });
            }, 500);
        });
    }
    
    try {
        const response = await fetch('/create-paypay-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, reason })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // PayPay決済ページを開く（実際の実装では）
        if (data.paymentUrl) {
            // 新しいウィンドウでPayPay決済ページを開く
            window.open(data.paymentUrl, '_blank');
            
            // デモ用のメッセージ
            alert('PayPay決済ページが開きます（デモモード）\n実際の運用には正式なPayPay APIキーが必要です');
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('PayPay決済エラー:', error);
        throw error;
    }
}

// 決済ボタンのイベントハンドラを更新
function updateDonateButtonHandler() {
    const originalDonateBtn = document.getElementById('donateBtn');
    const newDonateBtn = originalDonateBtn.cloneNode(true);
    originalDonateBtn.parentNode.replaceChild(newDonateBtn, originalDonateBtn);
    
    newDonateBtn.addEventListener('click', async function() {
        if (selectedAmount <= 0) {
            alert('募金額を選択してください！');
            return;
        }
        
        // ボタンを無効化
        this.disabled = true;
        this.querySelector('.btn-text').textContent = '処理中...';
        
        try {
            let result;
            
            if (selectedPaymentMethod === 'stripe') {
                result = await processStripePayment(selectedAmount, selectedReason);
            } else if (selectedPaymentMethod === 'paypay') {
                result = await processPayPayPayment(selectedAmount, selectedReason);
            }
            
            if (result.success) {
                // 成功時の処理
                const modal = document.getElementById('thankYouModal');
                const amountSpan = document.getElementById('donatedAmount');
                const modalText = document.querySelector('.modal-text');
                
                amountSpan.textContent = selectedAmount.toLocaleString();
                
                // デモモードの場合は注意書きを追加
                if (result.demo) {
                    modalText.innerHTML = `あなたの<span id="donatedAmount">${selectedAmount.toLocaleString()}</span>円が、世界一くだらない夢の実現に使われます。<br><small style="color: #e74c3c; margin-top: 10px; display: block;">（デモモード: 実際の決済は行われていません）</small>`;
                }
                
                modal.style.display = 'block';
                
                // 統計を更新
                updateStats();
                updateProgress(selectedReason, selectedAmount);
            }
        } catch (error) {
            alert('決済エラー: ' + error.message + '\n\nサーバーを起動してください: npm start');
        } finally {
            // ボタンを再度有効化
            this.disabled = false;
            this.querySelector('.btn-text').textContent = 'この馬鹿げた夢を応援する 🚀';
        }
    });
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // Stripeを初期化
    initializeStripe();
    
    // 決済方法の切り替えを設定
    setupPaymentMethodToggle();
    
    // 募金ボタンのハンドラを更新
    updateDonateButtonHandler();
});

// Made with Bob
