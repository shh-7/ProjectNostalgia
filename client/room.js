// ===================================================
// PROJECT NOSTALGIA - ROOM & MULTIPLAYER LOGIC
// ===================================================

const socket = io();

// Parse room code from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const roomCode = (urlParams.get("code") || "").trim().toUpperCase();

if (!roomCode) {
    alert("No room code specified. Returning to home.");
    window.location.href = "index.html";
}

// Local State
let currentRoomState = null;
let playerName = localStorage.getItem("nostalgia_player_name") || "Player " + Math.floor(100 + Math.random() * 900);
let playerAvatar = localStorage.getItem("nostalgia_player_avatar") || "👾";
let activeTheme = localStorage.getItem("nostalgia_theme") || "paper";
let timerInterval = null;

// DOM Elements - Navigation & Shared
const headerRoomCodeEl = document.getElementById("headerRoomCode");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
const audioToggleBtn = document.getElementById("audioToggleBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

// DOM Elements - Lobby View
const lobbyView = document.getElementById("lobbyView");
const lobbyRoomCodeEl = document.getElementById("lobbyRoomCode");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const copyToast = document.getElementById("copyToast");
const categorySelect = document.getElementById("categorySelect");
const timerSelect = document.getElementById("timerSelect");
const categoryHint = document.getElementById("categoryHint");
const playersListEl = document.getElementById("playersList");
const lobbyStatusEl = document.getElementById("lobbyStatus");
const startGameBtn = document.getElementById("startGameBtn");

// DOM Elements - Game Arena View
const gameView = document.getElementById("gameView");
const gameCategoryBadge = document.getElementById("gameCategoryBadge");
const timerIndicator = document.getElementById("timerIndicator");
const timerCountdown = document.getElementById("timerCountdown");
const livesHearts = document.getElementById("livesHearts");
const scoreboard = document.getElementById("scoreboard");
const turnBanner = document.getElementById("turnBanner");
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
const nextRoundBtn = document.getElementById("nextRoundBtn");
const backToLobbyBtn = document.getElementById("backToLobbyBtn");
const reactionsArea = document.getElementById("reactionsArea");

// Chat Elements
const chatMessagesEl = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

// Custom Word Modal Elements
const customWordModal = document.getElementById("customWordModal");
const customWordInput = document.getElementById("customWordInput");
const customHintInput = document.getElementById("customHintInput");
const cancelCustomWordBtn = document.getElementById("cancelCustomWordBtn");
const submitCustomWordBtn = document.getElementById("submitCustomWordBtn");

headerRoomCodeEl.textContent = roomCode;
lobbyRoomCodeEl.textContent = roomCode;

// ===================================================
// THEME & AUDIO MANAGEMENT
// ===================================================

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

// ===================================================
// COPY ACTIONS
// ===================================================

function showToast(message) {
    copyToast.textContent = message;
    copyToast.style.display = "block";
    setTimeout(() => {
        copyToast.style.display = "none";
    }, 2500);
}

copyCodeBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    navigator.clipboard.writeText(roomCode).then(() => {
        showToast("✓ Room code copied to clipboard!");
    }).catch(() => {
        showToast(`Code: ${roomCode}`);
    });
});

copyLinkBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    const inviteUrl = `${window.location.origin}/room.html?code=${roomCode}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
        showToast("✓ Invite link copied to clipboard!");
    }).catch(() => {
        showToast(`Link: ${inviteUrl}`);
    });
});

leaveRoomBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    if (confirm("Are you sure you want to exit the room?")) {
        window.location.href = "index.html";
    }
});

// ===================================================
// SOCKET INITIALIZATION & JOINING
// ===================================================

socket.on("connect", () => {
    lobbyStatusEl.textContent = "Connecting to room...";

    socket.emit("joinRoom", {
        roomCode: roomCode,
        playerName: playerName,
        avatar: playerAvatar
    });
});

socket.on("joinError", (err) => {
    alert(err);
    window.location.href = "index.html";
});

socket.on("roomError", (err) => {
    alert(err);
    window.location.href = "index.html";
});

// ===================================================
// STATE SYNCHRONIZATION
// ===================================================

socket.on("roomUpdated", (state) => {
    currentRoomState = state;
    renderRoom(state);
});

socket.on("gameStarted", (state) => {
    currentRoomState = state;
    if (window.soundFX) window.soundFX.playClick();
    renderRoom(state);
});

socket.on("playerJoinedAnnouncement", (msg) => {
    lobbyStatusEl.textContent = msg;
    if (window.soundFX) window.soundFX.playCorrect();
});

socket.on("playerLeftAnnouncement", (msg) => {
    lobbyStatusEl.textContent = msg;
    if (window.soundFX) window.soundFX.playWrong();
});

socket.on("turnNotice", (msg) => {
    gameMessage.textContent = msg;
    if (window.soundFX) window.soundFX.playWrong();
});

socket.on("guessResult", (data) => {
    if (data.isRoundOver) {
        if (data.isVictory) {
            if (window.soundFX) window.soundFX.playWin();
            if (window.fireConfetti) window.fireConfetti(90);
        } else {
            if (window.soundFX) window.soundFX.playGameOver();
        }
    } else {
        if (data.correct) {
            if (window.soundFX) window.soundFX.playCorrect();
            gameMessage.textContent = `✅ ${data.byPlayer} correctly guessed '${data.letter}'!`;
        } else {
            if (window.soundFX) window.soundFX.playWrong();
            gameMessage.textContent = `❌ ${data.byPlayer} guessed '${data.letter}', which is not in the word!`;

            // Screen Shake Effect
            arenaStage.classList.remove("shake");
            void arenaStage.offsetWidth; // re-flow
            arenaStage.classList.add("shake");
        }
    }
});

// ===================================================
// RENDER FUNCTIONS
// ===================================================

function renderRoom(state) {
    if (!state) return;

    const me = state.players.find(p => p.id === socket.id) || { isHost: false };
    const isHost = me.isHost;

    if (state.gameState === "lobby") {
        lobbyView.style.display = "block";
        gameView.style.display = "none";
        renderLobby(state, isHost);
    } else {
        lobbyView.style.display = "none";
        gameView.style.display = "block";
        renderGame(state, me);
    }

    renderChat(state.chatMessages || []);
}

// 1. Render Lobby Screen
function renderLobby(state, isHost) {
    categorySelect.value = state.category || "random";
    categorySelect.disabled = !isHost;

    timerSelect.value = (state.timerSeconds || 0).toString();
    timerSelect.disabled = !isHost;

    categoryHint.textContent = isHost
        ? "Host: customize category and timer settings"
        : "Waiting for host to configure match settings";

    // Players list
    playersListEl.innerHTML = "";
    state.players.forEach((p, idx) => {
        const item = document.createElement("div");
        item.className = "player-item";
        item.innerHTML = `
            <div class="player-avatar">${p.avatar || "👾"}</div>
            <div class="player-info">
                <span class="player-name">${p.name} ${p.id === socket.id ? "(You)" : ""}</span>
                <span class="player-badge-tag">${p.isHost ? "👑 Host" : `Player ${idx + 1}`} • Score: ${p.score}</span>
            </div>
        `;
        playersListEl.appendChild(item);
    });

    if (state.players.length === 1) {
        const waitingItem = document.createElement("div");
        waitingItem.className = "player-item player-item-waiting";
        waitingItem.innerHTML = `<span>Waiting for friend to enter room code...</span>`;
        playersListEl.appendChild(waitingItem);
    }

    if (state.players.length >= 2) {
        lobbyStatusEl.textContent = isHost
            ? "Ready! Both players connected."
            : "Both players connected! Waiting for host to start...";
        startGameBtn.disabled = !isHost;
        startGameBtn.textContent = isHost ? "START MATCH ➔" : "WAITING FOR HOST TO START...";
    } else {
        lobbyStatusEl.textContent = "Waiting for Player 2 to join with code...";
        if (isHost) {
            startGameBtn.disabled = false;
            startGameBtn.textContent = "START PRACTICE (SOLO)";
        } else {
            startGameBtn.disabled = true;
            startGameBtn.textContent = "WAITING FOR PLAYERS...";
        }
    }
}

// Settings changes (Host only)
function pushSettings() {
    socket.emit("updateSettings", {
        roomCode: roomCode,
        category: categorySelect.value,
        timerSeconds: timerSelect.value
    });
}

categorySelect.addEventListener("change", () => {
    if (window.soundFX) window.soundFX.playClick();
    pushSettings();
});

timerSelect.addEventListener("change", () => {
    if (window.soundFX) window.soundFX.playClick();
    pushSettings();
});

// Start Game Handler
startGameBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();

    if (currentRoomState && currentRoomState.mode === "custom") {
        // Prompt for custom secret word
        customWordInput.value = "";
        customHintInput.value = "";
        customWordModal.style.display = "flex";
        setTimeout(() => customWordInput.focus(), 50);
    } else {
        socket.emit("startGame", { roomCode: roomCode });
    }
});

// Custom Word Modal Handlers
cancelCustomWordBtn.addEventListener("click", () => {
    customWordModal.style.display = "none";
});

submitCustomWordBtn.addEventListener("click", () => {
    const word = customWordInput.value.trim().toUpperCase().replace(/[^A-Z]/g, "");
    const hint = customHintInput.value.trim();

    if (word.length < 3) {
        alert("Please enter a word with at least 3 letters.");
        return;
    }

    customWordModal.style.display = "none";
    socket.emit("startGame", {
        roomCode: roomCode,
        customWord: word,
        customHint: hint
    });
});

// 2. Render Game Arena
function renderGame(state, me) {
    const game = state.game;
    if (!game) return;

    // Category Badge
    gameCategoryBadge.textContent = game.categoryName || "Hangman";

    // Nostalgia Hint
    if (game.hint) {
        hintToggleBtn.style.display = "inline-block";
        hintText.textContent = game.hint;
    } else {
        hintToggleBtn.style.display = "none";
        hintText.style.display = "none";
    }

    // Timer Countdown
    if (game.turnExpiresAt && state.gameState === "playing") {
        timerIndicator.style.display = "flex";
        startTurnCountdown(game.turnExpiresAt);
    } else {
        timerIndicator.style.display = "none";
        if (timerInterval) clearInterval(timerInterval);
    }

    // Lives Counter
    const maxLives = game.maxLives || 6;
    const wrong = game.wrongGuesses || 0;
    const remainingLives = Math.max(0, maxLives - wrong);
    let heartsStr = "";
    for (let i = 0; i < maxLives; i++) {
        heartsStr += i < remainingLives ? "❤️" : "🖤";
    }
    livesHearts.textContent = heartsStr;

    // Gallows Step
    gallows.className = `gallows step-${Math.min(wrong, 6)}`;

    // Scoreboard
    scoreboard.innerHTML = "";
    state.players.forEach(p => {
        const card = document.createElement("div");
        const isCurrentTurn = game.currentTurnId === p.id && state.gameState === "playing";
        card.className = `score-card ${isCurrentTurn ? "active-turn" : ""}`;
        card.innerHTML = `
            <span class="score-avatar">${p.avatar || "👾"}</span>
            <span class="score-name">${p.isHost ? "👑 " : ""}${p.name} ${p.id === socket.id ? "(You)" : ""}</span>
            <span class="score-points">${p.score} pts</span>
            ${p.roundsWon > 0 ? `<span>⭐ ${p.roundsWon}</span>` : ""}
        `;
        scoreboard.appendChild(card);
    });

    // Turn Banner
    const isMyTurn = game.currentTurnId === socket.id;
    if (state.gameState === "playing") {
        roundOverCard.style.display = "none";
        if (state.players.length === 1) {
            turnBanner.className = "turn-banner my-turn";
            turnText.textContent = "🎯 YOUR TURN TO GUESS A LETTER!";
        } else if (isMyTurn) {
            turnBanner.className = "turn-banner my-turn";
            turnText.textContent = "🎯 YOUR TURN! Pick a letter on screen or keyboard.";
        } else {
            turnBanner.className = "turn-banner";
            turnText.textContent = `⏳ Waiting for ${game.currentTurnName || "opponent"} to guess...`;
        }
    } else {
        turnBanner.className = "turn-banner";
        turnText.textContent = game.isVictory ? "🎉 ROUND COMPLETED!" : "💀 ROUND OVER!";
        roundOverCard.style.display = "block";

        if (game.isVictory) {
            roundOverTitle.textContent = "🎉 VICTORY!";
            roundOverTitle.style.color = "#2e7d32";
            roundOverMessage.innerHTML = `Word guessed correctly: <strong>${game.revealedWord}</strong>!<br>Round Winner: <strong>${game.winnerName}</strong> (+50 pts)`;
        } else {
            roundOverTitle.textContent = "💀 GAME OVER!";
            roundOverTitle.style.color = "#c62828";
            roundOverMessage.innerHTML = `Ran out of lives! The secret word was: <strong>${game.revealedWord}</strong>`;
        }
    }

    // Secret Word Slots
    wordSlots.innerHTML = "";
    game.displayLetters.forEach(char => {
        const slot = document.createElement("div");
        if (char === " ") {
            slot.className = "letter-slot space";
        } else if (char !== null) {
            slot.className = "letter-slot revealed";
            slot.textContent = char;
            if (state.gameState === "roundOver" && !game.isVictory) {
                const wasGuessed = game.guessedLetters.some(g => g.letter === char);
                if (!wasGuessed) slot.classList.add("revealed-lost");
            }
        } else {
            slot.className = "letter-slot";
            slot.textContent = "";
        }
        wordSlots.appendChild(slot);
    });

    // Virtual Keyboard
    renderKeyboard(game, isMyTurn && state.gameState === "playing");
}

// Turn Timer Countdown
function startTurnCountdown(expiresAt) {
    if (timerInterval) clearInterval(timerInterval);

    function tick() {
        const remainingMs = expiresAt - Date.now();
        const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
        timerCountdown.textContent = `${seconds}s`;

        if (seconds <= 8) {
            timerIndicator.classList.add("urgent");
            if (window.soundFX) window.soundFX.playTick();
        } else {
            timerIndicator.classList.remove("urgent");
        }

        if (seconds <= 0) {
            clearInterval(timerInterval);
        }
    }

    tick();
    timerInterval = setInterval(tick, 1000);
}

// Hint Button Handler
hintToggleBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    const isHidden = hintText.style.display === "none";
    hintText.style.display = isHidden ? "block" : "none";
    hintToggleBtn.textContent = isHidden ? "💡 Hide Nostalgia Hint" : "💡 Show Nostalgia Hint";
});

// 3. Render Virtual Keyboard
const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
];

function renderKeyboard(game, canGuess) {
    virtualKeyboard.innerHTML = "";
    const guessedMap = {};
    (game.guessedLetters || []).forEach(g => {
        guessedMap[g.letter] = g.correct ? "correct" : "wrong";
    });

    KEYBOARD_ROWS.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "keyboard-row";

        row.forEach(letter => {
            const btn = document.createElement("button");
            btn.className = "key-btn";
            btn.textContent = letter;

            const status = guessedMap[letter];
            if (status) {
                btn.classList.add(status);
                btn.disabled = true;
            } else if (!canGuess) {
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
    if (!currentRoomState || currentRoomState.gameState !== "playing") return;
    const game = currentRoomState.game;
    if (!game) return;

    if (currentRoomState.players.length > 1 && game.currentTurnId !== socket.id) {
        return;
    }

    const alreadyGuessed = (game.guessedLetters || []).some(g => g.letter === letter);
    if (alreadyGuessed) return;

    if (window.soundFX) window.soundFX.playKeyPress();

    socket.emit("guessLetter", {
        roomCode: roomCode,
        letter: letter
    });
}

// Physical Keyboard Listener
window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
    }
});

// Next Round Handler
nextRoundBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    socket.emit("nextRound", { roomCode: roomCode });
});

// Return to Lobby Handler
backToLobbyBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    lobbyView.style.display = "block";
    gameView.style.display = "none";
});

// ===================================================
// IN-GAME CHAT
// ===================================================

function renderChat(messages) {
    chatMessagesEl.innerHTML = "";
    messages.forEach(msg => {
        const b = document.createElement("div");
        b.className = "chat-bubble";
        b.innerHTML = `
            <span class="chat-sender">${msg.avatar || "👾"} ${msg.sender}:</span>
            <span class="chat-text">${escapeHtml(msg.text)}</span>
        `;
        chatMessagesEl.appendChild(b);
    });
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;

    socket.emit("sendChatMessage", {
        roomCode: roomCode,
        text: text
    });

    chatInput.value = "";
}

sendChatBtn.addEventListener("click", sendChat);
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendChat();
    }
});

socket.on("chatMessage", (msg) => {
    const b = document.createElement("div");
    b.className = "chat-bubble";
    b.innerHTML = `
        <span class="chat-sender">${msg.avatar || "👾"} ${msg.sender}:</span>
        <span class="chat-text">${escapeHtml(msg.text)}</span>
    `;
    chatMessagesEl.appendChild(b);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
});

// ===================================================
// FLOATING REACTIONS SYSTEM
// ===================================================

document.querySelectorAll(".reaction-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const emoji = btn.dataset.emoji;
        if (!emoji) return;
        if (window.soundFX) window.soundFX.playClick();
        socket.emit("sendReaction", {
            roomCode: roomCode,
            emoji: emoji,
            playerName: playerName
        });
    });
});

socket.on("reactionReceived", (data) => {
    spawnFloatingEmoji(data.emoji);
});

function spawnFloatingEmoji(emoji) {
    const el = document.createElement("div");
    el.className = "floating-emoji";
    el.textContent = emoji;
    el.style.left = `${Math.floor(10 + Math.random() * 70)}px`;
    reactionsArea.appendChild(el);

    setTimeout(() => {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }, 2200);
}
