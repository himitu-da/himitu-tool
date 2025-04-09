// タイマーツール スクリプト
const timerDisplay = document.getElementById('timer-display');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');
const alarmSound = document.getElementById('alarm-sound');

let timerInterval = null;
let totalSeconds = 0;
let initialMinutes = 5; // デフォルト値
let initialSeconds = 0; // デフォルト値

// 初期表示を更新
updateDisplay(initialMinutes * 60 + initialSeconds);
updateInitialTimeFromInputs(); // 入力フィールドから初期時間を取得

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateDisplay(seconds) {
    timerDisplay.textContent = formatTime(seconds);
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

    // ボタンの状態を更新
    startButton.disabled = true;
    stopButton.disabled = false;
    minutesInput.disabled = true;
    secondsInput.disabled = true;

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

    // ボタンの状態を更新
    startButton.disabled = false;
    stopButton.disabled = true;
    minutesInput.disabled = false;
    secondsInput.disabled = false;

    if (playAlarm) {
        alarmSound.play().catch(e => console.error("アラーム再生エラー:", e)); // エラーハンドリング追加
        // アラームを一定時間後に停止するなどの処理を追加可能
    }
}

function resetTimer() {
    stopTimer(); // タイマーを停止
    updateInitialTimeFromInputs(); // リセット時も入力値から初期時間を再取得
    totalSeconds = initialMinutes * 60 + initialSeconds;
    updateDisplay(totalSeconds);
}

// イベントリスナーの設定
startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', () => stopTimer(false)); // ストップボタンではアラーム鳴らさない
resetButton.addEventListener('click', resetTimer);
minutesInput.addEventListener('change', updateInitialTimeFromInputs);
secondsInput.addEventListener('change', updateInitialTimeFromInputs);
minutesInput.addEventListener('input', updateInitialTimeFromInputs); // 入力途中でも反映させる場合
secondsInput.addEventListener('input', updateInitialTimeFromInputs); // 入力途中でも反映させる場合

// 初期状態でストップボタンを無効化
stopButton.disabled = true;
