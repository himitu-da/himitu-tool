// タイマーのドラッグ操作拡張
document.addEventListener('DOMContentLoaded', function() {
    // 要素取得
    const timerDisplay = document.getElementById('timer-display');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    
    // ドラッグ関連の変数
    let isDragging = false;
    let startY = 0;
    let startX = 0;
    let currentValue = 0;
    let startTime = 0;
    let dragAxis = null; // 'x' or 'y' or null
    const dragThreshold = 5; // ドラッグと判定する最小移動量
    const dragSensitivity = 0.5; // ドラッグの感度調整（値が大きいほど小さな動きで大きく変わる）
    
    // アニメーション用
    let lastDragUpdate = 0;
    const dragUpdateThrottle = 50; // ms間隔でアップデート
    
    // ドラッグ開始
    function handleDragStart(e) {
        if (window.timerInterval) return; // タイマー実行中は操作不可
        
        // タッチイベントとマウスイベントの座標を統一
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        isDragging = true;
        startX = clientX;
        startY = clientY;
        dragAxis = null; // 初期状態ではドラッグ方向未定
        
        // 現在の時間値を取得
        const mins = parseInt(minutesInput.value, 10) || 0;
        const secs = parseInt(secondsInput.value, 10) || 0;
        currentValue = mins * 60 + secs;
        startTime = currentValue;
        
        // ドラッグ中のスタイル適用
        timerDisplay.classList.add('dragging');
        
        // ドラッグ中と終了のイベントリスナーを追加
        if (e.type === 'mousedown') {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
        }
        
        // モバイルでのスクロール防止
        e.preventDefault();
    }
    
    // ドラッグ中
    function handleDragMove(e) {
        if (!isDragging) return;
        
        // 現在時刻を取得してスロットリング
        const now = Date.now();
        if (now - lastDragUpdate < dragUpdateThrottle) return;
        lastDragUpdate = now;
        
        // タッチイベントとマウスイベントの座標を統一
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        // 最初の動きでドラッグ方向を決定（X軸かY軸）
        if (dragAxis === null) {
            if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
                dragAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
            } else {
                return; // しきい値未満ならまだ方向決定しない
            }
        }
        
        // ドラッグ方向に応じた値の計算
        let delta = 0;
        if (dragAxis === 'x') {
            // X軸: 左右ドラッグ - 秒単位の調整
            delta = Math.round(deltaX * dragSensitivity);
        } else {
            // Y軸: 上下ドラッグ - 分単位の調整（上=増加、下=減少）
            delta = Math.round(-deltaY * dragSensitivity) * 60;
        }
        
        // 新しい値を計算（最小値は0）
        let newValue = Math.max(0, startTime + delta);
        
        // 最大値の制限（例: 99分59秒）
        const maxSeconds = 99 * 60 + 59;
        newValue = Math.min(newValue, maxSeconds);
        
        // 値が変わった場合のみ更新
        if (newValue !== currentValue) {
            currentValue = newValue;
            
            // 分と秒に変換
            const newMins = Math.floor(newValue / 60);
            const newSecs = newValue % 60;
            
            // 入力欄に反映
            minutesInput.value = String(newMins).padStart(2, '0');
            secondsInput.value = String(newSecs).padStart(2, '0');
            
            // タイマー表示を更新
            if (typeof window.updateInitialTimeFromInputs === 'function') {
                window.updateInitialTimeFromInputs();
            }
            
            // ドラッグ中の視覚的フィードバック
            const direction = delta > 0 ? 'increase' : 'decrease';
            updateDragFeedback(direction, newValue);
        }
    }
    
    // ドラッグ終了
    function handleDragEnd(e) {
        if (!isDragging) return;
        
        isDragging = false;
        dragAxis = null;
        
        // ドラッグ中のスタイルを削除
        timerDisplay.classList.remove('dragging', 'drag-increase', 'drag-decrease');
        
        // イベントリスナーを削除
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        
        // 軽い振動フィードバック（対応デバイスのみ）
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }
    
    // ドラッグ中の視覚的フィードバック
    function updateDragFeedback(direction, value) {
        // 前回のドラッグ方向クラスを削除
        timerDisplay.classList.remove('drag-increase', 'drag-decrease');
        
        // 新しいドラッグ方向クラスを追加
        timerDisplay.classList.add(`drag-${direction}`);
        
        // ドラッグ量に応じたスケール効果
        const scale = 1 + Math.min(0.08, Math.abs(value - startTime) / 1000);
        timerDisplay.style.transform = `scale(${scale})`;
        
        // 軽い振動フィードバック（頻度を制限、対応デバイスのみ）
        if ('vibrate' in navigator && Math.abs(value - startTime) % 60 === 0) {
            navigator.vibrate(5);
        }
    }
    
    // CSS変数を追加して、ドラッグ中のスタイルを定義
    const style = document.createElement('style');
    style.textContent = `
        #timer-display.dragging {
            cursor: ns-resize;
            transition: transform 0.1s ease-out, color 0.2s ease-out;
        }
        
        #timer-display.drag-increase {
            color: var(--timer-primary-color, #28a745);
        }
        
        #timer-display.drag-decrease {
            color: var(--timer-warning-color, #ffc107);
        }
        
        /* 値が0に近づくとアラート色に */
        #timer-display.drag-decrease[data-value="0"] {
            color: var(--timer-danger-color, #dc3545);
        }
    `;
    document.head.appendChild(style);
    
    // イベントリスナーの設定
    timerDisplay.addEventListener('mousedown', handleDragStart);
    timerDisplay.addEventListener('touchstart', handleDragStart, { passive: false });
    timerDisplay.addEventListener('touchmove', handleDragMove, { passive: false });
    timerDisplay.addEventListener('touchend', handleDragEnd);
    
    // スクロールが発生しないようにする（タッチデバイスでのスワイプ操作時）
    timerDisplay.addEventListener('touchmove', function(e) {
        if (isDragging) {
            e.preventDefault();
        }
    }, { passive: false });
    
    console.log("タイマードラッグ操作機能が読み込まれました");
});
