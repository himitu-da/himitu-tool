// タイマーツール スクリプト
const timerDisplay = document.getElementById('timer-display');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const minutesSlider = document.getElementById('minutes-slider');
const secondsSlider = document.getElementById('seconds-slider');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');
const alarmSound = document.getElementById('alarm-sound');
// const progressBar = document.querySelector('.timer-progress-bar'); // 線形プログレスバー削除
const progressRingCircle = document.getElementById('progress-ring-circle'); // 円形プログレスバー
const settingsButton = document.getElementById('settings-button'); // 設定ボタン (ヘッダーに移動したがIDは同じ)
const settingsModal = document.getElementById('settings-modal'); // 設定モーダル
const closeButton = settingsModal.querySelector('.close-button'); // 閉じるボタン
const tabButtons = settingsModal.querySelectorAll('.tab-button'); // タブボタン
const tabContents = settingsModal.querySelectorAll('.tab-content'); // タブコンテンツ
// 設定項目
const defaultMinutesInput = document.getElementById('default-minutes');
const defaultSecondsInput = document.getElementById('default-seconds');
const saveBasicSettingsButton = document.getElementById('save-basic-settings');
const themeRadios = document.querySelectorAll('input[name="theme"]'); // テーマ選択ラジオボタン
// 音声設定要素
const alarmSelect = document.getElementById('alarm-select');
const volumeSlider = document.getElementById('volume-slider');
const volumeValueSpan = document.getElementById('volume-value');
const saveSoundSettingsButton = document.getElementById('save-sound-settings');
// 詳細設定要素
const enableMillisecondsCheckbox = document.getElementById('enable-milliseconds');
const saveAdvancedSettingsButton = document.getElementById('save-advanced-settings');
// クイック設定メニュー要素
const quickSettingsMenu = document.getElementById('quick-settings-menu');


let timerInterval = null;
let totalSeconds = 0;
let initialMinutes = 5; // デフォルト値 (loadSettingsで上書きされる)
let initialSeconds = 0; // デフォルト値 (loadSettingsで上書きされる)
const radius = progressRingCircle.r.baseVal.value;
const circumference = 2 * Math.PI * radius; // 円周

// --- 設定の読み込み/保存 ---
function loadSettings() {
    // --- デフォルト時間設定読み込み ---
    const savedMinutes = localStorage.getItem('timerDefaultMinutes');
    const savedSeconds = localStorage.getItem('timerDefaultSeconds');

    initialMinutes = savedMinutes !== null ? parseInt(savedMinutes, 10) : 5;
    initialSeconds = savedSeconds !== null ? parseInt(savedSeconds, 10) : 0;

    // --- デフォルト時間設定読み込み ---
    // メイン入力欄とスライダーに反映
    minutesInput.value = String(initialMinutes).padStart(2, '0');
    secondsInput.value = String(initialSeconds).padStart(2, '0');
    minutesSlider.value = initialMinutes;
    secondsSlider.value = initialSeconds;

    // 設定モーダル入力欄に反映
    defaultMinutesInput.value = initialMinutes;
    defaultSecondsInput.value = String(initialSeconds).padStart(2, '0');

    // タイマーが動いていない場合のみ表示更新
    if (!timerInterval) {
        updateDisplay(initialMinutes * 60 + initialSeconds);
    }
    console.log("デフォルト時間読み込み完了:", initialMinutes, "分", initialSeconds, "秒");

    // --- テーマ設定読み込み (prefers-color-scheme 対応) ---
    let preferredTheme = localStorage.getItem('timerTheme');
    let themeSource = "localStorage";

    if (!preferredTheme) {
        // localStorageに設定がなければOSの設定を確認
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            preferredTheme = 'dark';
            themeSource = "prefers-color-scheme (dark)";
        } else {
            preferredTheme = 'default'; // デフォルトはライト
            themeSource = "prefers-color-scheme (light/default)";
        }
        // OS設定に基づいて決定したテーマをlocalStorageに保存（次回以降はこれが優先される）
        // localStorage.setItem('timerTheme', preferredTheme); // ←初回のみOS設定を反映させたい場合はコメントアウト
    }

    applyTheme(preferredTheme); // 決定したテーマを適用

    // モーダル内のラジオボタンをチェック状態にする
    const currentThemeRadio = document.querySelector(`input[name="theme"][value="${preferredTheme}"]`);
    if (currentThemeRadio) {
        currentThemeRadio.checked = true;
    }
    console.log(`テーマ読み込み完了: ${preferredTheme} (Source: ${themeSource})`);

    // --- 音声設定読み込み ---
    const savedAlarm = localStorage.getItem('timerAlarmSound') || 'alarm.mp3';
    const savedVolume = localStorage.getItem('timerVolume') || '1';

    alarmSound.src = savedAlarm;
    alarmSound.volume = parseFloat(savedVolume);
    alarmSelect.value = savedAlarm;
    volumeSlider.value = savedVolume;
    volumeValueSpan.textContent = `${Math.round(parseFloat(savedVolume) * 100)}%`;
    console.log("音声設定読み込み完了: 音源=", savedAlarm, "音量=", savedVolume);

    // --- 詳細設定読み込み ---
    const savedEnableMilliseconds = localStorage.getItem('timerEnableMilliseconds') === 'true'; // 文字列 'true' をブール値に変換
    enableMillisecondsCheckbox.checked = savedEnableMilliseconds;
    console.log("詳細設定読み込み完了: ミリ秒表示=", savedEnableMilliseconds);

    // --- ミュート状態読み込み ---
    const savedMuted = localStorage.getItem('timerMuted') === 'true';
    alarmSound.muted = savedMuted;
    // クイック設定ボタンの表示更新 (必要なら)
    updateQuickSoundButton(savedMuted);
    console.log("ミュート状態読み込み完了:", savedMuted);
}

function saveBasicSettings() {
    const newDefaultMinutes = parseInt(defaultMinutesInput.value, 10) || 0;
    const newDefaultSeconds = parseInt(defaultSecondsInput.value, 10) || 0;

    localStorage.setItem('timerDefaultMinutes', newDefaultMinutes);
    localStorage.setItem('timerDefaultSeconds', newDefaultSeconds);

    initialMinutes = newDefaultMinutes;
    initialSeconds = newDefaultSeconds;

    // メイン入力欄にも反映
    minutesInput.value = String(initialMinutes).padStart(2, '0');
    secondsInput.value = String(initialSeconds).padStart(2, '0');

    // タイマーが動いていない場合のみ表示更新
    if (!timerInterval) {
        updateDisplay(initialMinutes * 60 + initialSeconds);
    }

    alert('基本設定を保存しました！');
    console.log("基本設定保存:", initialMinutes, "分", initialSeconds, "秒");
    // closeSettingsModal(); // 保存後にモーダルを閉じる場合
}

// 音声設定を保存する関数
function saveSoundSettings() {
    const selectedAlarm = alarmSelect.value;
    const selectedVolume = volumeSlider.value;

    localStorage.setItem('timerAlarmSound', selectedAlarm);
    localStorage.setItem('timerVolume', selectedVolume);

    // Audio要素にも反映 (リアルタイム更新で既に反映されているが念のため)
    alarmSound.src = selectedAlarm;
    alarmSound.volume = parseFloat(selectedVolume);

    alert('音声設定を保存しました！');
    console.log("音声設定保存: 音源=", selectedAlarm, "音量=", selectedVolume);
    // closeSettingsModal(); // 保存後にモーダルを閉じる場合
}

// 詳細設定を保存する関数
function saveAdvancedSettings() {
    const enableMilliseconds = enableMillisecondsCheckbox.checked;
    localStorage.setItem('timerEnableMilliseconds', enableMilliseconds); // ブール値をそのまま（または文字列として）保存

    alert('詳細設定を保存しました！');
    console.log("詳細設定保存: ミリ秒表示=", enableMilliseconds);
     // ここでミリ秒表示の有効/無効を実際のタイマー表示ロジックに反映させる処理が必要になるが、今回は省略
    // closeSettingsModal(); // 保存後にモーダルを閉じる場合
}


// --- クイック設定関連 ---
let longPressTimer = null;
const longPressDuration = 500; // 長押しと判定する時間 (ms)
let isLongPress = false; // 長押し判定フラグ
let touchMoved = false; // タッチ移動判定フラグ

function showQuickMenu(event) {
    // デフォルトのコンテキストメニューを抑制 (PC用)
    if (event.type === 'contextmenu') {
        event.preventDefault();
    }
    quickSettingsMenu.classList.add('show');
    // メニュー外クリックで閉じるリスナーを追加
    setTimeout(() => { // 少し遅延させて、表示直後のクリックで閉じないように
        document.addEventListener('click', handleClickOutsideQuickMenu, { capture: true, once: true });
        document.addEventListener('touchstart', handleClickOutsideQuickMenu, { capture: true, once: true }); // スマホ用
    }, 10);
}

function hideQuickMenu() {
    quickSettingsMenu.classList.remove('show');
    // 念のためリスナー削除 (once: true でも良いが)
    document.removeEventListener('click', handleClickOutsideQuickMenu, { capture: true });
    document.removeEventListener('touchstart', handleClickOutsideQuickMenu, { capture: true });
}

function handleClickOutsideQuickMenu(event) {
    // メニュー自体やメニュー内の要素をクリックした場合は閉じない
    if (!quickSettingsMenu.contains(event.target)) {
        hideQuickMenu();
    } else {
        // メニュー内のボタンがクリックされた場合も閉じるため、再度リスナーを設定
         document.addEventListener('click', handleClickOutsideQuickMenu, { capture: true, once: true });
         document.addEventListener('touchstart', handleClickOutsideQuickMenu, { capture: true, once: true });
    }
}

// クイック設定のアクションを処理
function handleQuickSettingAction(action, value) {
    console.log("Quick Action:", action, value);
    switch (action) {
        case 'set-time':
            if (timerInterval) return; // タイマー動作中は変更しない
            const totalSecs = parseInt(value, 10);
            const mins = Math.floor(totalSecs / 60);
            const secs = totalSecs % 60;
            minutesInput.value = String(mins).padStart(2, '0');
            secondsInput.value = String(secs).padStart(2, '0');
            updateInitialTimeFromInputs();
            break;
        case 'toggle-theme':
            const themes = ['default', 'dark', 'ocean'];
            const currentTheme = localStorage.getItem('timerTheme') || 'default';
            const currentIndex = themes.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            applyTheme(themes[nextIndex]);
             // 設定モーダル内のラジオボタンも更新
            const nextThemeRadio = document.querySelector(`input[name="theme"][value="${themes[nextIndex]}"]`);
            if (nextThemeRadio) {
                nextThemeRadio.checked = true;
            }
            break;
        case 'toggle-sound':
            const newMutedState = !alarmSound.muted;
            alarmSound.muted = newMutedState;
            localStorage.setItem('timerMuted', newMutedState);
            updateQuickSoundButton(newMutedState);
            break;
    }
    // アクション実行後にメニューを閉じる
    hideQuickMenu();
}

// クイック設定のサウンドボタン表示を更新
function updateQuickSoundButton(isMuted) {
     const soundButton = quickSettingsMenu.querySelector('button[data-action="toggle-sound"]');
     if (soundButton) {
         soundButton.textContent = isMuted ? 'サウンドOFF' : 'サウンドON';
         // スタイル変更なども可能
         // soundButton.style.opacity = isMuted ? 0.6 : 1;
     }
}


// テーマを適用し、設定を保存する関数
function applyTheme(themeName) {
    // bodyから既存のテーマクラスを削除
    document.body.classList.remove('theme-dark', 'theme-ocean'); // 他のテーマもあれば追記

    // 新しいテーマクラスを追加 (default以外)
    if (themeName !== 'default') {
        document.body.classList.add(`theme-${themeName}`);
    }

    // 設定をlocalStorageに保存
    localStorage.setItem('timerTheme', themeName);
    console.log("テーマ適用:", themeName);
}


// --- 初期化 ---
loadSettings(); // 設定を読み込む (デフォルト時間、テーマ、音声、詳細、ミュート)

// 初期表示を更新 (loadSettings内で行うので不要になる場合がある)
// updateDisplay(initialMinutes * 60 + initialSeconds);
// updateInitialTimeFromInputs(); // loadSettingsで初期値設定済み

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateDisplay(seconds) {
    timerDisplay.textContent = formatTime(seconds);
    updateProgressRing(seconds);
}

// 円形プログレスバー更新関数
function updateProgressRing(seconds) {
    if (!progressRingCircle) return;

    const totalTime = initialMinutes * 60 + initialSeconds;
    const progress = totalTime > 0 ? (seconds / totalTime) : 0; // 0から1の割合
    const offset = circumference - progress * circumference;
    progressRingCircle.style.strokeDashoffset = offset;

    // 残り時間に応じて色を変化 (stroke color)
    const percentage = progress * 100;
    if (percentage < 20) {
        progressRingCircle.style.stroke = '#dc3545'; // 赤 (テーマCSSで上書きされる可能性あり)
    } else if (percentage < 50) {
        progressRingCircle.style.stroke = '#ffc107'; // 黄 (テーマCSSで上書きされる可能性あり)
    } else {
        progressRingCircle.style.stroke = '#28a745'; // 緑 (テーマCSSで上書きされる可能性あり)
    }
    // テーマCSSで定義された色を優先させる場合は、JSでの色変更を削除または条件分岐する
}

function updateInitialTimeFromInputs() {
    const mins = parseInt(minutesInput.value, 10) || 0;
    const secs = parseInt(secondsInput.value, 10) || 0;
    initialMinutes = mins;
    initialSeconds = secs;
    // タイマーが動いていない時だけ表示を更新
    if (!timerInterval) {
        updateDisplay(initialMinutes * 60 + initialSeconds);
    }
}

function startTimer() {
    if (timerInterval) return; // すでに実行中の場合は何もしない

    updateInitialTimeFromInputs(); // 開始時の入力値を取得
    totalSeconds = initialMinutes * 60 + initialSeconds;

    if (totalSeconds <= 0) return; // 時間が0以下の場合は開始しない

    // 円形プログレスバーをリセット
    if (progressRingCircle) {
        progressRingCircle.style.strokeDashoffset = 0; // 満タン状態
        progressRingCircle.style.stroke = '#28a745'; // 初期色: 緑 (テーマCSSで上書きされる可能性あり)
        // アニメーションをリセットするために一度transitionを無効化（必要なら）
        // progressRingCircle.style.transition = 'none';
        // requestAnimationFrame(() => { // 次のフレームでtransitionを戻す
        //     progressRingCircle.style.transition = 'stroke-dashoffset 1s linear, stroke 0.3s ease';
        // });
    }

    // ボタンと入力欄、スライダーの状態を更新
    startButton.disabled = true;
    stopButton.disabled = false;
    minutesInput.disabled = true;
    secondsInput.disabled = true;
    minutesSlider.disabled = true;
    secondsSlider.disabled = true;

    // 開始アニメーションクラスを追加
    timerDisplay.classList.remove('timer-stopped');
    timerDisplay.classList.add('timer-started');

    updateDisplay(totalSeconds); // 開始直後に表示を更新

    timerInterval = setInterval(() => {
        totalSeconds--;
        updateDisplay(totalSeconds);

        if (totalSeconds <= 0) {
            stopTimer(true); // アラームを鳴らす
        }
    }, 1000);
}

function stopTimer(playAlarm = false) {
    clearInterval(timerInterval);
    timerInterval = null;

    // ボタンと入力欄、スライダーの状態を更新
    startButton.disabled = false;
    stopButton.disabled = true;
    minutesInput.disabled = false;
    secondsInput.disabled = false;
    minutesSlider.disabled = false;
    secondsSlider.disabled = false;

    // 停止アニメーションクラスを追加
    timerDisplay.classList.remove('timer-started');
    timerDisplay.classList.add('timer-stopped');

    if (playAlarm) {
        alarmSound.play().catch(e => console.error("アラーム再生エラー:", e)); // エラーハンドリング追加
        // アラームを一定時間後に停止するなどの処理を追加可能
    }
}

function resetTimer() {
    stopTimer(); // タイマーを停止 (アニメーションクラスもここで適用される)
    updateInitialTimeFromInputs(); // リセット時も入力値から初期時間を再取得
    totalSeconds = initialMinutes * 60 + initialSeconds;
    updateDisplay(totalSeconds); // 表示を初期状態に更新
    // リセット時はプログレスバーも初期状態に戻す
    if (progressRingCircle) {
        progressRingCircle.style.strokeDashoffset = 0;
        progressRingCircle.style.stroke = '#28a745'; // 初期色
    }
    // アニメーションクラスをリセット
    timerDisplay.classList.remove('timer-started', 'timer-stopped');
}

// 時間調整機能 (amount は秒単位)
function adjustTime(amountInSeconds) {
    // タイマー動作中は時間を変更しない
    if (timerInterval) return;

    const mins = parseInt(minutesInput.value, 10) || 0;
    const secs = parseInt(secondsInput.value, 10) || 0;
    let total = mins * 60 + secs + amountInSeconds;

    if (total < 0) total = 0;
    // 99分59秒を上限とする場合 (任意)
    // if (total > 99 * 60 + 59) total = 99 * 60 + 59;

    const newMins = Math.floor(total / 60);
    const newSecs = total % 60;
    
    minutesInput.value = String(newMins).padStart(2, '0'); // 分も0埋め
    secondsInput.value = String(newSecs).padStart(2, '0');
    
    // スライダーの値も更新
    minutesSlider.value = newMins;
    secondsSlider.value = newSecs;
    
    updateInitialTimeFromInputs();
}

// スライダーと入力フィールドを連動させる関数
function syncMinutesInputAndSlider() {
    const minutesValue = parseInt(minutesInput.value) || 0;
    minutesSlider.value = minutesValue;
    updateInitialTimeFromInputs();
}

function syncSecondsInputAndSlider() {
    const secondsValue = parseInt(secondsInput.value) || 0;
    secondsSlider.value = secondsValue;
    updateInitialTimeFromInputs();
}

function syncMinutesSliderAndInput() {
    minutesInput.value = minutesSlider.value;
    updateInitialTimeFromInputs();
}

function syncSecondsSliderAndInput() {
    secondsInput.value = secondsSlider.value;
    updateInitialTimeFromInputs();
}

// イベントリスナーの設定
startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', () => stopTimer(false)); // ストップボタンではアラーム鳴らさない
resetButton.addEventListener('click', resetTimer);

// 数値入力フィールドのイベントリスナー
minutesInput.addEventListener('change', syncMinutesInputAndSlider);
secondsInput.addEventListener('change', syncSecondsInputAndSlider);
minutesInput.addEventListener('input', syncMinutesInputAndSlider); // 入力途中でも反映させる

secondsInput.addEventListener('input', syncSecondsInputAndSlider); // 入力途中でも反映させる

// スライダーのイベントリスナー
minutesSlider.addEventListener('input', syncMinutesSliderAndInput);
secondsSlider.addEventListener('input', syncSecondsSliderAndInput);

// --- ジェスチャー操作 ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const swipeThreshold = 50; // スワイプと判定する最小移動距離 (px)
const swipeTimeAdjustment = 10; // スワイプ1回あたりの時間調整量 (秒)

timerDisplay.addEventListener('touchstart', (e) => {
    // 最初のタッチポイントを取得
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

timerDisplay.addEventListener('touchmove', (e) => {
    // 長押し中に少し動いただけでもキャンセルするように
    clearTimeout(longPressTimer);
    longPressTimer = null;
    touchMoved = true; // 移動したフラグ
    // スワイプ処理のための座標記録 (必要なら継続)
    // touchEndX = e.changedTouches[0].screenX;
    // touchEndY = e.changedTouches[0].screenY;
}, { passive: true });

timerDisplay.addEventListener('touchend', (e) => {
    clearTimeout(longPressTimer); // 長押しタイマー解除
    longPressTimer = null;

    if (!isLongPress && !touchMoved) { // 長押しでもなく、移動もしていない場合 (スワイプ処理へ)
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe(); // スワイプ判定へ
    }

    // リセット
    isLongPress = false;
    touchMoved = false;
    touchStartX = 0; // スワイプ用にリセット
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;

}, { passive: true });

// 右クリック(contextmenu)でクイックメニュー表示 (PC用)
timerDisplay.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // デフォルトの右クリックメニューを抑制
    showQuickMenu(e);
});


function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // スワイプ距離が閾値より小さい場合は無視 (ダブルタップや単なるタップとの区別)
    if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) {
        // ここでタップイベントを処理することもできるが、dblclickがあるので不要かも
        console.log("Swipe threshold not met.");
        return;
    }

    // 左右スワイプか上下スワイプかを判定
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 左右スワイプ
        if (deltaX > 0) {
            // 右スワイプ -> 時間増加
            console.log("右スワイプ");
            adjustTime(swipeTimeAdjustment);
        } else {
            // 左スワイプ -> 時間減少
            console.log("左スワイプ");
            adjustTime(-swipeTimeAdjustment);
        }
    } else {
        // 上下スワイプ
        if (deltaY > 0) {
            // 下スワイプ -> 設定パネル非表示
            console.log("下スワイプ - 設定パネル非表示");
            closeSettingsModal();
        } else {
            // 上スワイプ -> 設定パネル表示
            console.log("上スワイプ - 設定パネル表示");
            openSettingsModal();
        }
    }

    // リセットタッチ座標
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
}

// --- ダブルタップ操作 ---
timerDisplay.addEventListener('dblclick', () => {
    if (timerInterval) {
        // タイマー実行中なら停止
        stopTimer(false);
        console.log("ダブルタップ: タイマー停止");
    } else {
        // タイマー停止中なら開始
        startTimer();
        console.log("ダブルタップ: タイマー開始");
    }
});

// --- 設定モーダル関連 ---

// モーダルを開く関数
function openSettingsModal() {
    settingsModal.classList.add('show');
}

// モーダルを閉じる関数
function closeSettingsModal() {
    settingsModal.classList.remove('show');
}

// 設定ボタンクリックでモーダルを開く
settingsButton.addEventListener('click', openSettingsModal);

// 閉じるボタンクリックでモーダルを閉じる
closeButton.addEventListener('click', closeSettingsModal);

// モーダルの外側クリックでモーダルを閉じる
window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        closeSettingsModal();
    }
});

// タブ切り替え機能
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;

        // すべてのタブボタンとコンテンツから active クラスを削除
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // クリックされたタブボタンと対応するコンテンツに active クラスを追加
        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// 基本設定保存ボタンのイベントリスナー
saveBasicSettingsButton.addEventListener('click', saveBasicSettings);

// テーマ選択ラジオボタンのイベントリスナー
themeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        applyTheme(event.target.value);
    });
});

// 音量スライダーのリアルタイム更新
volumeSlider.addEventListener('input', (event) => {
    const volume = parseFloat(event.target.value);
    alarmSound.volume = volume;
    volumeValueSpan.textContent = `${Math.round(volume * 100)}%`;
});

// アラーム音選択のリアルタイム更新
alarmSelect.addEventListener('change', (event) => {
    alarmSound.src = event.target.value;
    // 必要であればここでテスト再生など
    // alarmSound.play().catch(e => console.error("テスト再生エラー:", e));
});

// 音声設定保存ボタンのイベントリスナー
saveSoundSettingsButton.addEventListener('click', saveSoundSettings);

// 詳細設定保存ボタンのイベントリスナー
saveAdvancedSettingsButton.addEventListener('click', saveAdvancedSettings);

// クイック設定メニュー内のボタンクリックリスナー (イベント委譲)
quickSettingsMenu.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const button = event.target;
        const action = button.dataset.action;
        const value = button.dataset.value;
        handleQuickSettingAction(action, value);
    }
});


// 初期状態でストップボタンを無効化
stopButton.disabled = true;
