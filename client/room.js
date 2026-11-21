// ===================================================
// PROJECT NOSTALGIA - ROOM & MULTIPLAYER LOGIC
// Compatible with both Node.js Socket.IO and WebRTC (GitHub Pages)
// ===================================================

const net = window.GameNetwork;

// Parse room code from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const roomCode = (urlParams.get("code") || "").trim().toUpperCase();

if (!roomCode) {
    alert("No room code specified. Returning to home.");
    window.location.href = "index.html";
}

// Local State
let currentRoomState = null;
let playerName = getCookie("nostalgia_player_name") || localStorage.getItem("nostalgia_player_name") || "Player " + Math.floor(100 + Math.random() * 900);
let playerAvatar = getCookie("nostalgia_player_avatar") || localStorage.getItem("nostalgia_player_avatar") || "👾";
let activeTheme = localStorage.getItem("nostalgia_theme") || "paper";
let timerInterval = null;
let lastActivityTime = Date.now();
let inactivityTimer = null;

// ===================================================
// COOKIE HELPERS
// ===================================================
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/`;
}

function getCookie(name) {
    return document.cookie.split("; ").reduce((acc, pair) => {
        const [k, v] = pair.split("=");
        return k === name ? decodeURIComponent(v || "") : acc;
    }, "");
}

// Save player identity in both cookies and localStorage
function savePlayerIdentity(name, avatar) {
    playerName = name;
    playerAvatar = avatar;
    localStorage.setItem("nostalgia_player_name", name);
    localStorage.setItem("nostalgia_player_avatar", avatar);
    setCookie("nostalgia_player_name", name, 365);
    setCookie("nostalgia_player_avatar", avatar, 365);
}

// ===================================================
// DOM Elements - Navigation & Shared
// ===================================================
const headerRoomCodeEl = document.getElementById("headerRoomCode");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
const audioToggleBtn = document.getElementById("audioToggleBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

// DOM Elements - Lobby View
const lobbyView = document.getElementById("lobbyView");
const lobbyRoomCodeEl = document.getElementById("lobbyRoomCode");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const shareQRBtn = document.getElementById("shareQRBtn");
const copyToast = document.getElementById("copyToast");
const modeSelect = document.getElementById("modeSelect");
const categorySelectGroup = document.getElementById("categorySelectGroup");
const categorySelect = document.getElementById("categorySelect");
const timerSelect = document.getElementById("timerSelect");
const roomPasswordInput = document.getElementById("roomPasswordInput");
const categoryHint = document.getElementById("categoryHint");
const playersListEl = document.getElementById("playersList");
const lobbyStatusEl = document.getElementById("lobbyStatus");
const startGameBtn = document.getElementById("startGameBtn");
const inactivityWarning = document.getElementById("inactivityWarning");
const inactivityCountdownEl = document.getElementById("inactivityCountdown");

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

// Custom Puzzle Builder Elements
const customPuzzleModal = document.getElementById("customPuzzleModal");
const closePuzzleModalBtn = document.getElementById("closePuzzleModalBtn");
const puzzleWordInput = document.getElementById("puzzleWordInput");
const puzzleClueInput = document.getElementById("puzzleClueInput");
const btnAllBlanks = document.getElementById("btnAllBlanks");
const btnRevealOne = document.getElementById("btnRevealOne");
const btnRevealTwo = document.getElementById("btnRevealTwo");
const puzzleTilesGrid = document.getElementById("puzzleTilesGrid");
const puzzlePreviewText = document.getElementById("puzzlePreviewText");
const puzzlePreviewStats = document.getElementById("puzzlePreviewStats");
const cancelPuzzleBtn = document.getElementById("cancelPuzzleBtn");
const launchPuzzleBtn = document.getElementById("launchPuzzleBtn");

// Puzzle Builder State
let puzzleTiles = []; // [{char, isClue, isSpace}]

headerRoomCodeEl.textContent = roomCode;
lobbyRoomCodeEl.textContent = roomCode;

// ===================================================
// IDENTITY HELPERS
// ===================================================

function getMyId() {
    if (net.mode === "webrtc") {
        return net.isHost ? "host" : "guest";
    }
    return net.socket ? net.socket.id : null;
}

function isMe(player) {
    if (!player) return false;
    const myId = getMyId();
    if (myId && player.id === myId) return true;
    return player.name === playerName;
}

function checkIsMyTurn(game) {
    if (!game) return false;
    const myId = getMyId();
    if (myId && game.currentTurnId) {
        return game.currentTurnId === myId;
    }
    return game.currentTurnName === playerName;
}

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
// ACTIVITY TRACKING & INACTIVITY DISBAND (120s)
// ===================================================

function markActivity() {
    lastActivityTime = Date.now();
    // Reset inactivity warning if visible
    if (inactivityWarning) inactivityWarning.style.display = "none";
}

function startInactivityWatch() {
    if (inactivityTimer) clearInterval(inactivityTimer);
    const DISBAND_MS = 120000;
    const WARN_MS = 90000;

    inactivityTimer = setInterval(() => {
        const idle = Date.now() - lastActivityTime;
        if (idle >= DISBAND_MS) {
            clearInterval(inactivityTimer);
            if (inactivityWarning) inactivityWarning.style.display = "none";
            alert("⏳ Room disbanded due to 120 seconds of inactivity.");
            window.location.href = "index.html";
        } else if (idle >= WARN_MS) {
            const secsLeft = Math.ceil((DISBAND_MS - idle) / 1000);
            if (inactivityWarning) {
                inactivityWarning.style.display = "flex";
                if (inactivityCountdownEl) inactivityCountdownEl.textContent = secsLeft;
            }
        }
    }, 1000);
}

// Listen for any user action to reset activity
["mousemove", "keydown", "click", "touchstart"].forEach(evt => {
    document.addEventListener(evt, markActivity, { passive: true });
});

// Also treat network events as activity
net.on("roomUpdated", () => markActivity());
net.on("guessResult", () => markActivity());
net.on("chatMessage", () => markActivity());

startInactivityWatch();

// ===================================================
// COPY & SHARE ACTIONS
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
    const pwd = roomPasswordInput ? roomPasswordInput.value.trim() : "";
    const inviteUrl = `${window.location.origin}${window.location.pathname}?code=${roomCode}${pwd ? "&pwd=" + encodeURIComponent(pwd) : ""}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
        showToast("✓ Invite link copied! Share it with your friend.");
    }).catch(() => {
        showToast(`Link: ${inviteUrl}`);
    });
});

// WhatsApp quick share
if (shareQRBtn) {
    shareQRBtn.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.playClick();
        const pwd = roomPasswordInput ? roomPasswordInput.value.trim() : "";
        const inviteUrl = `${window.location.origin}${window.location.pathname}?code=${roomCode}${pwd ? "&pwd=" + encodeURIComponent(pwd) : ""}`;
        const text = `🕹️ Join my Nostalgia Hangman room!\nRoom Code: *${roomCode}*\nLink: ${inviteUrl}`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(waUrl, "_blank");
    });
}

leaveRoomBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    if (confirm("Are you sure you want to exit the room?")) {
        window.location.href = "index.html";
    }
});

// ===================================================
// NETWORK INITIALIZATION & JOINING
// ===================================================

const isHostParam = urlParams.get("host") === "true";
const urlPwd = urlParams.get("pwd") || "";
let hostSettings = {};
try {
    const raw = sessionStorage.getItem("nostalgia_host_settings");
    if (raw) hostSettings = JSON.parse(raw);
} catch (e) {}

if (isHostParam) {
    lobbyStatusEl.textContent = "Creating and hosting room...";
    setTimeout(() => {
        net.emit("createRoom", {
            roomCode: roomCode,
            playerName: playerName,
            avatar: playerAvatar,
            category: hostSettings.category || "random",
            timerSeconds: hostSettings.timerSeconds || 0,
            mode: hostSettings.mode || "standard",
            password: hostSettings.password || ""
        });
    }, 150);
} else {
    lobbyStatusEl.textContent = "Connecting to room...";
    setTimeout(() => {
        net.emit("joinRoom", {
            roomCode: roomCode,
            playerName: playerName,
            avatar: playerAvatar,
            password: urlPwd
        });
    }, 150);
}

net.on("roomCreated", (data) => {
    if (data && data.roomCode) {
        headerRoomCodeEl.textContent = data.roomCode;
        lobbyRoomCodeEl.textContent = data.roomCode;
    }
});

net.on("joinError", (err) => {
    alert(err);
    window.location.href = "index.html";
});

net.on("roomError", (err) => {
    alert(err);
    window.location.href = "index.html";
});

// ===================================================
// STATE SYNCHRONIZATION
// ===================================================

net.on("roomUpdated", (state) => {
    if (state && state.roomCode) {
        headerRoomCodeEl.textContent = state.roomCode;
        lobbyRoomCodeEl.textContent = state.roomCode;
    }
    currentRoomState = state;
    renderRoom(state);
});

net.on("gameStarted", (state) => {
    currentRoomState = state;
    if (window.soundFX) window.soundFX.playClick();
    renderRoom(state);
});

net.on("playerJoinedAnnouncement", (msg) => {
    lobbyStatusEl.textContent = msg;
    if (window.soundFX) window.soundFX.playCorrect();
});

net.on("playerLeftAnnouncement", (msg) => {
    lobbyStatusEl.textContent = msg;
    if (window.soundFX) window.soundFX.playWrong();
});

net.on("turnNotice", (msg) => {
    gameMessage.textContent = msg;
    if (window.soundFX) window.soundFX.playWrong();
});

net.on("guessResult", (data) => {
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

            arenaStage.classList.remove("shake");
            void arenaStage.offsetWidth;
            arenaStage.classList.add("shake");
        }
    }
});

net.on("roomDisbanded", (msg) => {
    alert(msg || "⏳ Room disbanded due to inactivity.");
    window.location.href = "index.html";
});

// ===================================================
// RENDER FUNCTIONS
// ===================================================

function renderRoom(state) {
    if (!state) return;

    const me = state.players.find(p => isMe(p)) || state.players[0] || { isHost: false };
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
    if (modeSelect) {
        modeSelect.value = state.mode || "standard";
        modeSelect.disabled = !isHost;
        // Show/hide category group
        if (categorySelectGroup) {
            categorySelectGroup.style.display = (state.mode === "custom") ? "none" : "block";
        }
    }

    categorySelect.value = state.category || "random";
    categorySelect.disabled = !isHost;

    timerSelect.value = (state.timerSeconds || 0).toString();
    timerSelect.disabled = !isHost;

    if (roomPasswordInput) {
        roomPasswordInput.disabled = !isHost;
        if (state.password && isHost) roomPasswordInput.placeholder = "Password set ✓";
    }

    categoryHint.textContent = isHost
        ? "Host: customize game mode, category and timer"
        : "Waiting for host to configure match settings";

    // Players list
    playersListEl.innerHTML = "";
    state.players.forEach((p, idx) => {
        const item = document.createElement("div");
        item.className = "player-item";
        item.innerHTML = `
            <div class="player-avatar">${p.avatar || "👾"}</div>
            <div class="player-info">
                <span class="player-name">${p.name} ${isMe(p) ? "(You)" : ""}</span>
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
            ? "✅ Ready! Both players connected."
            : "Both players connected! Waiting for host to start...";
        startGameBtn.disabled = !isHost;
        startGameBtn.textContent = isHost
            ? (state.mode === "custom" ? "✍️ CRAFT YOUR PUZZLE ➔" : "START MATCH ➔")
            : "WAITING FOR HOST TO START...";
    } else {
        lobbyStatusEl.textContent = "Waiting for Player 2 to join with code...";
        if (isHost) {
            startGameBtn.disabled = false;
            startGameBtn.textContent = state.mode === "custom" ? "✍️ CRAFT SOLO PUZZLE ➔" : "START PRACTICE (SOLO)";
        } else {
            startGameBtn.disabled = true;
            startGameBtn.textContent = "WAITING FOR PLAYERS...";
        }
    }
}

// Settings changes (Host only)
function pushSettings() {
    const pwd = roomPasswordInput ? roomPasswordInput.value.trim() : "";
    net.emit("updateSettings", {
        roomCode: roomCode,
        category: categorySelect.value,
        timerSeconds: timerSelect.value,
        mode: modeSelect ? modeSelect.value : "standard",
        password: pwd
    });
}

if (modeSelect) {
    modeSelect.addEventListener("change", () => {
        if (window.soundFX) window.soundFX.playClick();
        // Show/hide category group
        if (categorySelectGroup) {
            categorySelectGroup.style.display = modeSelect.value === "custom" ? "none" : "block";
        }
        pushSettings();
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

if (roomPasswordInput) {
    roomPasswordInput.addEventListener("change", () => {
        pushSettings();
    });
}

// ===================================================
// START GAME HANDLER
// ===================================================

function isCreatorForThisRound(state) {
    if (!state || state.players.length < 2) return true; // solo: always creator
    const roundNum = state.roundNumber || 0;
    const myId = getMyId();
    // Even rounds: players[0] creates, odd rounds: players[1] creates
    const creatorIndex = roundNum % 2;
    const creator = state.players[creatorIndex];
    if (!creator) return false;
    return creator.id === myId || creator.name === playerName;
}

startGameBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();

    if (currentRoomState && currentRoomState.mode === "custom") {
        openPuzzleBuilder("start");
    } else {
        net.emit("startGame", { roomCode: roomCode });
    }
});

// ===================================================
// CUSTOM PUZZLE BUILDER LOGIC
// ===================================================

let _pendingLaunchEvent = "startGame"; // 'startGame' or 'nextRound'

function openPuzzleBuilder(launchEvent) {
    _pendingLaunchEvent = launchEvent || "startGame";
    puzzleWordInput.value = "";
    puzzleClueInput.value = "";
    puzzleTiles = [];
    puzzleTilesGrid.innerHTML = `<span style="font-size:13px;color:var(--text-muted);font-style:italic;">Type a secret word above to start placing blanks...</span>`;
    puzzlePreviewText.textContent = "_ _ _ _ _ _";
    puzzlePreviewStats.textContent = "Blanks to guess: 0 • Clues revealed: 0";
    customPuzzleModal.style.display = "flex";
    setTimeout(() => puzzleWordInput.focus(), 50);
}

function buildTilesFromWord(raw) {
    const word = raw.toUpperCase().replace(/[^A-Z ]/g, "");
    // Preserve existing toggle states if word hasn't changed drastically
    const newTiles = word.split("").map((char, i) => {
        if (char === " ") return { char, isClue: false, isSpace: true };
        // Try to preserve old state
        const old = puzzleTiles[i];
        return { char, isClue: old && old.char === char ? old.isClue : false, isSpace: false };
    });
    puzzleTiles = newTiles;
}

function renderTilesGrid() {
    puzzleTilesGrid.innerHTML = "";
    if (puzzleTiles.length === 0) {
        puzzleTilesGrid.innerHTML = `<span style="font-size:13px;color:var(--text-muted);font-style:italic;">Type a secret word above to start placing blanks...</span>`;
        return;
    }

    puzzleTiles.forEach((tile, i) => {
        if (tile.isSpace) {
            const sp = document.createElement("div");
            sp.className = "puzzle-tile tile-space";
            sp.title = "Word space";
            puzzleTilesGrid.appendChild(sp);
            return;
        }

        const el = document.createElement("div");
        el.className = `puzzle-tile ${tile.isClue ? "is-clue" : "is-blank"}`;
        el.title = tile.isClue ? "Click to make this a Blank" : "Click to reveal as Starting Clue";
        el.innerHTML = `
            <span class="tile-letter">${tile.char}</span>
            <span class="tile-badge">${tile.isClue ? "CLUE" : "?"}</span>
        `;
        el.addEventListener("click", () => {
            puzzleTiles[i].isClue = !puzzleTiles[i].isClue;
            if (window.soundFX) window.soundFX.playClick();
            renderTilesGrid();
            updatePuzzlePreview();
        });
        puzzleTilesGrid.appendChild(el);
    });

    updatePuzzlePreview();
}

function updatePuzzlePreview() {
    if (puzzleTiles.length === 0) {
        puzzlePreviewText.textContent = "_ _ _ _ _ _";
        puzzlePreviewStats.textContent = "Blanks to guess: 0 • Clues revealed: 0";
        return;
    }

    let preview = "";
    let blanks = 0, clues = 0;
    puzzleTiles.forEach(tile => {
        if (tile.isSpace) {
            preview += "   ";
        } else if (tile.isClue) {
            preview += tile.char + " ";
            clues++;
        } else {
            preview += "_ ";
            blanks++;
        }
    });

    puzzlePreviewText.textContent = preview.trim();
    puzzlePreviewStats.textContent = `Blanks to guess: ${blanks} • Clues revealed: ${clues}`;

    launchPuzzleBtn.disabled = blanks === 0;
    launchPuzzleBtn.style.opacity = blanks === 0 ? "0.5" : "1";
}

// Word input live update
puzzleWordInput.addEventListener("input", () => {
    const raw = puzzleWordInput.value.toUpperCase().replace(/[^A-Z ]/g, "");
    puzzleWordInput.value = raw;
    buildTilesFromWord(raw);
    renderTilesGrid();
});

// Quick blank/clue buttons
btnAllBlanks.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    puzzleTiles.forEach(t => { if (!t.isSpace) t.isClue = false; });
    renderTilesGrid();
});

btnRevealOne.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    const eligible = puzzleTiles.filter(t => !t.isSpace && !t.isClue);
    if (eligible.length > 0) {
        const pick = eligible[Math.floor(Math.random() * eligible.length)];
        // Reveal ALL occurrences of this letter (for fairness)
        const letter = pick.char;
        puzzleTiles.forEach(t => { if (!t.isSpace && t.char === letter) t.isClue = true; });
        renderTilesGrid();
    }
});

btnRevealTwo.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    const usedLetters = new Set();
    let revealCount = 0;
    // Shuffle eligible letters
    const letters = [...new Set(puzzleTiles.filter(t => !t.isSpace && !t.isClue).map(t => t.char))];
    letters.sort(() => Math.random() - 0.5);
    letters.slice(0, 2).forEach(letter => {
        puzzleTiles.forEach(t => { if (!t.isSpace && t.char === letter) t.isClue = true; });
    });
    renderTilesGrid();
});

// Close modal
closePuzzleModalBtn.addEventListener("click", () => {
    customPuzzleModal.style.display = "none";
});

cancelPuzzleBtn.addEventListener("click", () => {
    customPuzzleModal.style.display = "none";
});

// Close on backdrop click
customPuzzleModal.addEventListener("click", (e) => {
    if (e.target === customPuzzleModal) customPuzzleModal.style.display = "none";
});

// Launch puzzle
launchPuzzleBtn.addEventListener("click", () => {
    const word = puzzleTiles.filter(t => !t.isSpace).map(t => t.char).join("");
    if (word.length < 3) {
        alert("Please enter a word with at least 3 letters.");
        return;
    }

    const blanksCount = puzzleTiles.filter(t => !t.isSpace && !t.isClue).length;
    if (blanksCount === 0) {
        alert("You must have at least 1 blank tile for the opponent to guess!");
        return;
    }

    const hint = puzzleClueInput.value.trim() || "A custom secret word!";
    const clueLetters = [...new Set(puzzleTiles.filter(t => !t.isSpace && t.isClue).map(t => t.char))];
    const fullWord = puzzleTiles.map(t => t.isSpace ? " " : t.char).join("");
    const maskedWord = puzzleTiles.map(t => {
        if (t.isSpace) return " ";
        if (t.isClue) return t.char;
        return null;
    });

    customPuzzleModal.style.display = "none";
    if (window.soundFX) window.soundFX.playClick();

    const customPuzzle = {
        word: fullWord,
        hint,
        maskedWord,
        clueLetters,
        creatorName: playerName
    };

    net.emit(_pendingLaunchEvent, { roomCode, customPuzzle });
});

// ===================================================
// 2. RENDER GAME ARENA
// ===================================================
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
        const isCurrentTurn = (game.currentTurnId === p.id || game.currentTurnName === p.name) && state.gameState === "playing";
        card.className = `score-card ${isCurrentTurn ? "active-turn" : ""}`;
        card.innerHTML = `
            <span class="score-avatar">${p.avatar || "👾"}</span>
            <span class="score-name">${p.isHost ? "👑 " : ""}${p.name} ${isMe(p) ? "(You)" : ""}</span>
            <span class="score-points">${p.score} pts</span>
            ${p.roundsWon > 0 ? `<span>⭐ ${p.roundsWon}</span>` : ""}
        `;
        scoreboard.appendChild(card);
    });

    // Turn Banner
    const isMyTurn = checkIsMyTurn(game);
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

        // Show puzzle creator badge
        if (game.puzzleCreatorName) {
            const badge = document.createElement("p");
            badge.style.cssText = "font-size:12px;color:var(--text-muted);margin-top:6px;";
            badge.textContent = `✍️ Puzzle crafted by ${game.puzzleCreatorName}`;
            roundOverMessage.appendChild(badge);
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

    if (currentRoomState.players.length > 1 && !checkIsMyTurn(game)) {
        return;
    }

    const alreadyGuessed = (game.guessedLetters || []).some(g => g.letter === letter);
    if (alreadyGuessed) return;

    if (window.soundFX) window.soundFX.playKeyPress();

    net.emit("guessLetter", {
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
    if (e.key === "Escape") {
        customPuzzleModal.style.display = "none";
    }
});

// Next Round Handler
nextRoundBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    if (currentRoomState && currentRoomState.mode === "custom") {
        // In custom mode, open puzzle builder for the next creator
        openPuzzleBuilder("nextRound");
    } else {
        net.emit("nextRound", { roomCode: roomCode });
    }
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
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;

    net.emit("sendChatMessage", {
        roomCode: roomCode,
        playerName: playerName,
        avatar: playerAvatar,
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

net.on("chatMessage", (msg) => {
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
        net.emit("sendReaction", {
            roomCode: roomCode,
            emoji: emoji,
            playerName: playerName
        });
    });
});

net.on("reactionReceived", (data) => {
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
