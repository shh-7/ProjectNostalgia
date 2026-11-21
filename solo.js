// ===================================================
// PROJECT NOSTALGIA - SOLO & DAILY PRACTICE LOGIC
// 100% Offline and GitHub Pages Compatible
// ===================================================

const wordsEngine = window.NostalgiaWords;

// URL Parameters
const urlParams = new URLSearchParams(window.location.search);
const isDailyMode = urlParams.get("mode") === "daily";

// State
let currentWord = "";
let currentHint = "";
let categoryKey = "random";
let maskedWord = [];
let guessedLetters = [];
let wrongGuesses = 0;
let maxLives = 6;
let isGameOver = false;
let activeTheme = localStorage.getItem("nostalgia_theme") || "paper";

// DOM Elements
const soloModeTitle = document.getElementById("soloModeTitle");
const soloCategorySelect = document.getElementById("soloCategorySelect");
const difficultySelect = document.getElementById("difficultySelect");
const livesHearts = document.getElementById("livesHearts");
const streakCountEl = document.getElementById("streakCount");
const bestStreakEl = document.getElementById("bestStreak");
const totalWinsEl = document.getElementById("totalWins");
const turnText = document.getElementById("turnText");
const arenaStage = document.getElementById("arenaStage");
const gallows = document.getElementById("gallows");
const wordSlots = document.getElementById("wordSlots");
const gameMessage = document.getElementById("gameMessage");
const virtualKeyboard = document.getElementById("virtualKeyboard");
const hintToggleBtn = document.getElementById("hintToggleBtn");
const hintText = document.getElementById("hintText");

// Round Over Elements
const roundOverCard = document.getElementById("roundOverCard");
const roundOverTitle = document.getElementById("roundOverTitle");
const roundOverMessage = document.getElementById("roundOverMessage");
const newWordBtn = document.getElementById("newWordBtn");
const restartSoloBtn = document.getElementById("restartSoloBtn");
const leaveSoloBtn = document.getElementById("leaveSoloBtn");
const audioToggleBtn = document.getElementById("audioToggleBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

// Theme & Audio
function applyTheme(theme) {
    document.body.className = theme === "midnight" ? "theme-midnight" : "theme-paper";
    localStorage.setItem("nostalgia_theme", theme);
}

applyTheme(activeTheme);

themeToggleBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    activeTheme = activeTheme === "paper" ? "midnight" : "paper";
    applyTheme(activeTheme);
});

function updateAudioBtn() {
    if (window.soundFX) {
        audioToggleBtn.textContent = window.soundFX.isMuted() ? "🔇" : "🔊";
    }
}
updateAudioBtn();

audioToggleBtn.addEventListener("click", () => {
    if (window.soundFX) {
        window.soundFX.toggleMute();
        updateAudioBtn();
        window.soundFX.playClick();
    }
});

leaveSoloBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    window.location.href = "index.html";
});

// Stats Management
function getStreak() {
    return parseInt(localStorage.getItem("nostalgia_solo_streak") || "0", 10);
}
function getBestStreak() {
    return parseInt(localStorage.getItem("nostalgia_solo_best_streak") || "0", 10);
}
function getTotalWins() {
    return parseInt(localStorage.getItem("nostalgia_solo_wins") || "0", 10);
}

function updateStatsUI() {
    streakCountEl.textContent = getStreak();
    bestStreakEl.textContent = getBestStreak();
    totalWinsEl.textContent = getTotalWins();
}

function incrementStreak() {
    const current = getStreak() + 1;
    localStorage.setItem("nostalgia_solo_streak", current);
    const best = Math.max(current, getBestStreak());
    localStorage.setItem("nostalgia_solo_best_streak", best);
    localStorage.setItem("nostalgia_solo_wins", getTotalWins() + 1);
    updateStatsUI();
}

function resetStreak() {
    localStorage.setItem("nostalgia_solo_streak", "0");
    const losses = parseInt(localStorage.getItem("nostalgia_solo_losses") || "0", 10) + 1;
    localStorage.setItem("nostalgia_solo_losses", losses);
    updateStatsUI();
}

updateStatsUI();

// Hint Toggle
hintToggleBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    const isHidden = hintText.style.display === "none";
    hintText.style.display = isHidden ? "block" : "none";
    hintToggleBtn.textContent = isHidden ? "💡 Hide Nostalgia Hint" : "💡 Show Nostalgia Hint";
});

// Start Game Round
function startSoloRound() {
    const diff = difficultySelect.value;
    if (diff === "easy") maxLives = 7;
    else if (diff === "hard") maxLives = 5;
    else maxLives = 6;

    let selectedCatName = "";

    if (isDailyMode) {
        soloModeTitle.textContent = "DAILY CHALLENGE";
        soloCategorySelect.style.display = "none";
        difficultySelect.style.display = "none";

        const daily = wordsEngine.getDailyWord();
        currentWord = daily.word;
        currentHint = daily.hint;
        selectedCatName = daily.categoryName;
    } else {
        soloModeTitle.textContent = "SOLO PRACTICE";
        categoryKey = soloCategorySelect.value;

        const chosen = wordsEngine.getRandomWord(categoryKey);
        currentWord = chosen.word;
        currentHint = chosen.hint;
        selectedCatName = chosen.categoryName;
    }

    hintText.textContent = currentHint;
    hintText.style.display = "none";
    hintToggleBtn.textContent = "💡 Show Nostalgia Hint";

    const clueLetters = wordsEngine.getStartingClues(currentWord, diff);

    maskedWord = currentWord.split("").map(char => {
        if (char === " ") return " ";
        if (clueLetters.includes(char)) return char;
        return null;
    });

    guessedLetters = clueLetters.map(letter => ({ letter, correct: true }));
    wrongGuesses = 0;
    isGameOver = false;

    roundOverCard.style.display = "none";
    turnText.textContent = "🎯 GUESS A LETTER TO SAVE THE HANGMAN!";
    gameMessage.textContent = `Theme: ${selectedCatName}`;

    renderUI();
}

// Render UI Elements
function renderUI() {
    const remaining = Math.max(0, maxLives - wrongGuesses);
    let hearts = "";
    for (let i = 0; i < maxLives; i++) {
        hearts += i < remaining ? "❤️" : "🖤";
    }
    livesHearts.textContent = hearts;

    gallows.className = `gallows step-${Math.min(wrongGuesses, 6)}`;

    wordSlots.innerHTML = "";
    maskedWord.forEach(char => {
        const slot = document.createElement("div");
        if (char === " ") {
            slot.className = "letter-slot space";
        } else if (char !== null) {
            slot.className = "letter-slot revealed";
            slot.textContent = char;
            if (isGameOver && remaining === 0) {
                const wasGuessed = guessedLetters.some(g => g.letter === char);
                if (!wasGuessed) slot.classList.add("revealed-lost");
            }
        } else {
            slot.className = "letter-slot";
            slot.textContent = "";
        }
        wordSlots.appendChild(slot);
    });

    renderKeyboard();
}

// Virtual Keyboard
const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
];

function renderKeyboard() {
    virtualKeyboard.innerHTML = "";
    const map = {};
    guessedLetters.forEach(g => {
        map[g.letter] = g.correct ? "correct" : "wrong";
    });

    KEYBOARD_ROWS.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "keyboard-row";

        row.forEach(letter => {
            const btn = document.createElement("button");
            btn.className = "key-btn";
            btn.textContent = letter;

            const status = map[letter];
            if (status) {
                btn.classList.add(status);
                btn.disabled = true;
            } else if (isGameOver) {
                btn.disabled = true;
            } else {
                btn.addEventListener("click", () => {
                    handleGuess(letter);
                });
            }

            rowDiv.appendChild(btn);
        });

        virtualKeyboard.appendChild(rowDiv);
    });
}

function handleGuess(letter) {
    if (isGameOver) return;
    const char = letter.toUpperCase();
    if (!/^[A-Z]$/.test(char)) return;

    if (guessedLetters.some(g => g.letter === char)) return;

    if (window.soundFX) window.soundFX.playKeyPress();

    if (currentWord.includes(char)) {
        for (let i = 0; i < currentWord.length; i++) {
            if (currentWord[i] === char) {
                maskedWord[i] = char;
            }
        }
        guessedLetters.push({ letter: char, correct: true });

        const solved = maskedWord.every(c => c !== null);
        if (solved) {
            isGameOver = true;
            incrementStreak();
            if (window.soundFX) window.soundFX.playWin();
            if (window.fireConfetti) window.fireConfetti(90);

            roundOverTitle.textContent = "🎉 VICTORY!";
            roundOverTitle.style.color = "#2e7d32";
            roundOverMessage.innerHTML = `Word guessed correctly: <strong>${currentWord}</strong>!<br>Current streak: <strong>${getStreak()}</strong> 🔥`;
            roundOverCard.style.display = "block";
        } else {
            if (window.soundFX) window.soundFX.playCorrect();
            gameMessage.textContent = `✅ Great guess! '${char}' is in the word.`;
        }
    } else {
        wrongGuesses++;
        guessedLetters.push({ letter: char, correct: false });

        arenaStage.classList.remove("shake");
        void arenaStage.offsetWidth;
        arenaStage.classList.add("shake");

        if (wrongGuesses >= maxLives) {
            isGameOver = true;
            resetStreak();
            if (window.soundFX) window.soundFX.playGameOver();

            maskedWord = currentWord.split("");

            roundOverTitle.textContent = "💀 GAME OVER!";
            roundOverTitle.style.color = "#c62828";
            roundOverMessage.innerHTML = `Ran out of lives! The word was: <strong>${currentWord}</strong>`;
            roundOverCard.style.display = "block";
        } else {
            if (window.soundFX) window.soundFX.playWrong();
            gameMessage.textContent = `❌ '${char}' is not in the word! (${maxLives - wrongGuesses} lives left)`;
        }
    }

    renderUI();
}

// Physical keyboard listener
window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
    }
});

soloCategorySelect.addEventListener("change", () => {
    if (window.soundFX) window.soundFX.playClick();
    startSoloRound();
});

difficultySelect.addEventListener("change", () => {
    if (window.soundFX) window.soundFX.playClick();
    startSoloRound();
});

newWordBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    startSoloRound();
});

restartSoloBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    soloCategorySelect.focus();
});

// Initial launch
startSoloRound();
