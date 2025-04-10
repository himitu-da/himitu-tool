// タイマーUI拡張スクリプト
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の参照
    const timerDisplay = document.getElementById('timer-display');
    const progressRingCircle = document.getElementById('progress-ring-circle');
    const timerContainer = document.querySelector('.timer-container');
    const actionButtons = document.querySelectorAll('#timer-controls button');
    
    // タイマー終了検知のための変数とセットアップ
    let isTimerEnded = false;
    let originalTimerUpdate = null;
    
    // タイマー残り時間に応じた表示強化
    function enhanceTimerDisplay(seconds) {
        // 残り10秒以下で警告表示
        if (seconds <= 10 && seconds > 0) {
            timerDisplay.classList.add('time-critical');
            // 震える効果を追加 (prefers-reduced-motionに配慮)
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                timerContainer.style.animation = 'shake 0.3s ease';
                // アニメーション終了後に削除
                setTimeout(() => {
                    timerContainer.style.animation = '';
                }, 300);
            }
        } else {
            timerDisplay.classList.remove('time-critical');
        }
        
        // タイマー終了時の特別効果
        if (seconds <= 0 && !isTimerEnded) {
            isTimerEnded = true;
            timerDisplay.classList.add('timer-ended');
            // 全画面フラッシュ効果 (任意)
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                const flash = document.createElement('div');
                flash.style.position = 'fixed';
                flash.style.top = '0';
                flash.style.left = '0';
                flash.style.width = '100%';
                flash.style.height = '100%';
                flash.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
                flash.style.zIndex = '9999';
                flash.style.pointerEvents = 'none';
                flash.style.animation = 'fadeOut 1s forwards';
                
                document.body.appendChild(flash);
                
                setTimeout(() => {
                    document.body.removeChild(flash);
                }, 1000);
            }
        }
    }
    
    // タイマーリセット時の表示リセット
    function resetTimerDisplay() {
        isTimerEnded = false;
        timerDisplay.classList.remove('timer-ended', 'time-critical');
    }
    
    // ボタン押下時の触覚フィードバック (対応デバイスのみ)
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            if ('vibrate' in navigator) {
                // ボタンの種類に応じた振動パターン
                if (button.id === 'start-button') {
                    navigator.vibrate(15);
                } else if (button.id === 'stop-button') {
                    navigator.vibrate([10, 30, 10]);
                } else if (button.id === 'reset-button') {
                    navigator.vibrate(20);
                } else {
                    navigator.vibrate(5);
                }
            }
        });
    });

    // 既存のupdateDisplay関数を拡張
    if (typeof window.updateDisplay === 'function') {
        originalTimerUpdate = window.updateDisplay;
        window.updateDisplay = function(seconds) {
            originalTimerUpdate(seconds);
            enhanceTimerDisplay(seconds);
        };
    }
    
    // 既存のresetTimer関数を拡張
    if (typeof window.resetTimer === 'function') {
        const originalResetTimer = window.resetTimer;
        window.resetTimer = function() {
            originalResetTimer();
            resetTimerDisplay();
        };
    }
    
    // CSS変数を使用したテーマカラーの動的調整機能
    function updateColorVariables() {
        const root = document.documentElement;
        // テーマに応じた色を設定
        if (document.body.classList.contains('theme-dark')) {
            root.style.setProperty('--timer-primary-color', '#4CAF50');
            root.style.setProperty('--timer-warning-color', '#FFC107');
            root.style.setProperty('--timer-danger-color', '#F44336');
        } else if (document.body.classList.contains('theme-ocean')) {
            root.style.setProperty('--timer-primary-color', '#00ACC1');
            root.style.setProperty('--timer-warning-color', '#FFAB40');
            root.style.setProperty('--timer-danger-color', '#FF5252');
        } else {
            // デフォルトテーマ
            root.style.setProperty('--timer-primary-color', '#28a745');
            root.style.setProperty('--timer-warning-color', '#ffc107');
            root.style.setProperty('--timer-danger-color', '#dc3545');
        }
    }
    
    // 初期化時に色変数を設定
    updateColorVariables();
    
    // テーマ変更を検知して色変数を更新
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                updateColorVariables();
            }
        });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // フェードイン効果 (ページロード時)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timerContainer.style.opacity = '0';
        timerContainer.style.transform = 'translateY(10px)';
        timerContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            timerContainer.style.opacity = '1';
            timerContainer.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // キーボードショートカット対応
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return; // 入力フィールドでは無効
        
        if (e.key === ' ' || e.key === 'Enter') {
            // スペースまたはEnterでタイマーをスタート/ストップ
            e.preventDefault();
            if (!window.timerInterval) {
                document.getElementById('start-button').click();
            } else {
                document.getElementById('stop-button').click();
            }
        } else if (e.key === 'r' || e.key === 'R') {
            // Rキーでリセット
            document.getElementById('reset-button').click();
        } else if (e.key === 'ArrowUp') {
            // 上矢印キーで1分増加
            document.getElementById('plus-button').click();
        } else if (e.key === 'ArrowDown') {
            // 下矢印キーで1分減少
            document.getElementById('minus-button').click();
        } else if (e.key === 'Escape') {
            // ESCキーで設定モーダルを閉じる
            if (document.getElementById('settings-modal').classList.contains('show')) {
                document.querySelector('.close-button').click();
            }
        }
    });
    
    // キーボードショートカットのヒントを追加
    const keyboardHints = document.createElement('div');
    keyboardHints.className = 'keyboard-hints';
    keyboardHints.innerHTML = `
        <details>
            <summary>⌨️ ショートカット</summary>
            <ul>
                <li><kbd>Space</kbd>/<kbd>Enter</kbd>: スタート/ストップ</li>
                <li><kbd>R</kbd>: リセット</li>
                <li><kbd>↑</kbd>: 1分増加</li>
                <li><kbd>↓</kbd>: 1分減少</li>
                <li><kbd>Esc</kbd>: 設定を閉じる</li>
            </ul>
        </details>
    `;
    
    // キーボードヒントのスタイル
    const style = document.createElement('style');
    style.textContent = `
        .keyboard-hints {
            margin-top: 20px;
            text-align: center;
            font-size: 0.9rem;
            color: #666;
        }
        .keyboard-hints details {
            display: inline-block;
            cursor: pointer;
        }
        .keyboard-hints summary {
            margin-bottom: 10px;
            user-select: none;
        }
        .keyboard-hints ul {
            text-align: left;
            display: inline-block;
            padding-left: 20px;
        }
        .keyboard-hints kbd {
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 3px;
            box-shadow: 0 1px 1px rgba(0,0,0,.2);
            color: #333;
            display: inline-block;
            font-size: 0.8rem;
            line-height: 1;
            padding: 2px 5px;
        }
        /* テーマに応じた調整 */
        body.theme-dark .keyboard-hints {
            color: #ccc;
        }
        body.theme-dark .keyboard-hints kbd {
            background-color: #555;
            border-color: #666;
            color: #eee;
        }
        body.theme-ocean .keyboard-hints {
            color: #006064;
        }
        body.theme-ocean .keyboard-hints kbd {
            background-color: #e0f7fa;
            border-color: #80deea;
            color: #00796b;
        }
    `;
    
    document.head.appendChild(style);
    document.querySelector('main').appendChild(keyboardHints);
    
    // デバイスの向きに応じたレイアウト最適化
    function optimizeForOrientation() {
        if (window.matchMedia("(orientation: portrait)").matches) {
            // 縦向き - デフォルトレイアウト
            timerContainer.style.width = '80%';
            timerContainer.style.maxWidth = '300px';
        } else {
            // 横向き - 横長レイアウト
            timerContainer.style.width = '50%';
            timerContainer.style.maxWidth = '400px';
            // 横向きではボタンを横に並べる調整も可能
        }
    }
    
    // 初期化時に向きを最適化
    optimizeForOrientation();
    
    // 向き変更を検知
    window.addEventListener('orientationchange', optimizeForOrientation);
    window.addEventListener('resize', optimizeForOrientation);
    
    // 現在時刻の表示 (オプション機能)
    function updateCurrentTime() {
        const clockElement = document.getElementById('current-time');
        if (!clockElement) return;
        
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;
    }
    
    // 現在時刻要素が存在する場合のみ実行
    if (document.getElementById('current-time')) {
        setInterval(updateCurrentTime, 1000);
        updateCurrentTime(); // 初期表示
    }
    
    // CSS keyframes アニメーションの追加
    const keyframeStyles = document.createElement('style');
    keyframeStyles.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(keyframeStyles);
    
    console.log("タイマーUI拡張が正常に読み込まれました");
});
