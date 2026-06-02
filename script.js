// 選択された募金理由
let selectedReason = 'ramen';
let selectedAmount = 0;

// 募金理由カードのクリックイベント
document.querySelectorAll('.reason-card').forEach(card => {
    card.addEventListener('click', function() {
        // すべてのカードからactiveクラスを削除
        document.querySelectorAll('.reason-card').forEach(c => c.classList.remove('active'));
        // クリックされたカードにactiveクラスを追加
        this.classList.add('active');
        selectedReason = this.dataset.reason;
    });
});

// 金額ボタンのクリックイベント
document.querySelectorAll('.amount-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // すべてのボタンからselectedクラスを削除
        document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
        // クリックされたボタンにselectedクラスを追加
        this.classList.add('selected');
        selectedAmount = parseInt(this.dataset.amount);
        // カスタム金額をクリア
        document.getElementById('customAmount').value = '';
    });
});

// カスタム金額の入力イベント
document.getElementById('customAmount').addEventListener('input', function() {
    // 金額ボタンの選択を解除
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
    selectedAmount = parseInt(this.value) || 0;
});

// 募金ボタンのクリックイベント
document.getElementById('donateBtn').addEventListener('click', function() {
    if (selectedAmount <= 0) {
        alert('募金額を選択してください！');
        return;
    }

    // モーダルを表示
    const modal = document.getElementById('thankYouModal');
    document.getElementById('donatedAmount').textContent = selectedAmount.toLocaleString();
    modal.style.display = 'block';

    // 統計を更新（アニメーション付き）
    updateStats();

    // プログレスバーを更新
    updateProgress(selectedReason, selectedAmount);

    // ボタンにアニメーション効果
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 100);
});

// モーダルを閉じる
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('thankYouModal').style.display = 'none';
    // フォームをリセット
    resetForm();
});

// モーダルの外側をクリックしても閉じる
window.addEventListener('click', function(event) {
    const modal = document.getElementById('thankYouModal');
    if (event.target === modal) {
        modal.style.display = 'none';
        resetForm();
    }
});

// 統計を更新
function updateStats() {
    const donorsElement = document.getElementById('totalDonors');
    const amountElement = document.getElementById('totalAmount');
    
    // 現在の値を取得
    let currentDonors = parseInt(donorsElement.textContent.replace(/,/g, ''));
    let currentAmount = parseInt(amountElement.textContent.replace(/[¥,]/g, ''));
    
    // 新しい値を計算
    const newDonors = currentDonors + 1;
    const newAmount = currentAmount + selectedAmount;
    
    // アニメーション付きで更新
    animateValue(donorsElement, currentDonors, newDonors, 1000);
    animateValue(amountElement, currentAmount, newAmount, 1000, true);
}

// 数値をアニメーション付きで更新
function animateValue(element, start, end, duration, isCurrency = false) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        const displayValue = Math.floor(current).toLocaleString();
        element.textContent = isCurrency ? `¥${displayValue}` : displayValue;
    }, 16);
}

// プログレスバーを更新
function updateProgress(reason, amount) {
    const reasonCard = document.querySelector(`[data-reason="${reason}"]`);
    if (!reasonCard) return;
    
    const progressBar = reasonCard.querySelector('.progress-bar');
    const progressText = reasonCard.querySelector('.progress-text');
    
    // 現在の進捗を取得
    const currentWidth = parseFloat(progressBar.style.width);
    
    // 新しい進捗を計算（簡易的に+1%）
    const newWidth = Math.min(currentWidth + 1, 100);
    
    // アニメーション付きで更新
    progressBar.style.width = `${newWidth}%`;
    
    // テキストも更新（簡易的）
    if (progressText.textContent.includes('¥')) {
        const match = progressText.textContent.match(/¥([\d,]+)\s*\/\s*¥([\d,]+)/);
        if (match) {
            const current = parseInt(match[1].replace(/,/g, ''));
            const target = parseInt(match[2].replace(/,/g, ''));
            const newCurrent = Math.min(current + amount, target);
            progressText.textContent = `¥${newCurrent.toLocaleString()} / ¥${target.toLocaleString()}達成`;
        }
    } else {
        const match = progressText.textContent.match(/(\d+)\s*\/\s*(\d+)/);
        if (match) {
            const current = parseInt(match[1]);
            const target = parseInt(match[2]);
            const newCurrent = Math.min(current + 1, target);
            progressText.textContent = `${newCurrent}店舗 / ${target}店舗達成`;
        }
    }
}

// フォームをリセット
function resetForm() {
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('customAmount').value = '';
    selectedAmount = 0;
}

// ページ読み込み時のアニメーション
window.addEventListener('load', function() {
    // カードを順番にフェードイン
    const cards = document.querySelectorAll('.reason-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// ランダムな応援メッセージ
const encouragementMessages = [
    "あなたは素晴らしい！",
    "最高の無駄遣いです！",
    "バカバカしさに乾杯！",
    "人生は一度きり！",
    "ナイス判断！",
    "あなたのセンス、最高！"
];

// 募金ボタンにホバーでランダムメッセージ
let originalButtonText = '';
const donateBtn = document.getElementById('donateBtn');

donateBtn.addEventListener('mouseenter', function() {
    originalButtonText = this.querySelector('.btn-text').textContent;
    const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    this.querySelector('.btn-text').textContent = randomMessage;
});

donateBtn.addEventListener('mouseleave', function() {
    this.querySelector('.btn-text').textContent = originalButtonText;
});

// イースターエッグ：Konami Code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateSecretMode();
    }
});

function activateSecretMode() {
    alert('🎉 秘密のモード発動！全ての募金額が10倍になります！（嘘です）');
    document.body.style.animation = 'rainbow 2s infinite';
    
    // レインボーアニメーションを追加
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// スクロールアニメーション
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 統計とテスティモニアルにアニメーションを適用
document.querySelectorAll('.stat-item, .testimonial').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Made with Bob
