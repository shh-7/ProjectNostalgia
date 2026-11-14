// ===================================================
// PROJECT NOSTALGIA - ARCADE HOME CLIENT LOGIC
// ===================================================

const net = window.GameNetwork;

// State
let playerProfile = {
    name: localStorage.getItem("nostalgia_player_name") || "Player " + Math.floor(100 + Math.random() * 900),
    avatar: localStorage.getItem("nostalgia_player_avatar") || "👾",
    theme: localStorage.getItem("nostalgia_theme") || "paper"
};

// DOM Elements - Nav & Profile
const navAvatarEl = document.getElementById("navAvatar");
const navPlayerNameEl = document.getElementById("navPlayerName");
const playerProfileBtn = document.getElementById("playerProfileBtn");
const howToPlayBtn = document.getElementById("howToPlayBtn");
const statsBtn = document.getElementById("statsBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const audioToggleBtn = document.getElementById("audioToggleBtn");
const audioIconEl = document.getElementById("audioIcon");
const themeIconEl = document.getElementById("themeIcon");

// DOM Elements - Hub Cards & Buttons
const openCreateRoomBtn = document.getElementById("openCreateRoomBtn");
const openJoinRoomBtn = document.getElementById("openJoinRoomBtn");
const soloPlayBtn = document.getElementById("soloPlayBtn");
const dailyPlayBtn = document.getElementById("dailyPlayBtn");
const customDuelBtn = document.getElementById("customDuelBtn");
const dailyDateText = document.getElementById("dailyDateText");
const dailyCategoryText = document.getElementById("dailyCategoryText");
const onlineStatus = document.getElementById("onlineStatus");

// DOM Elements - Modals
const profileModal = document.getElementById("profileModal");
const profileNameInput = document.getElementById("profileNameInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const avatarPicker = document.getElementById("avatarPicker");

const createRoomModal = document.getElementById("createRoomModal");
const roomCategorySelect = document.getElementById("roomCategorySelect");
const roomTimerSelect = document.getElementById("roomTimerSelect");
const roomModeSelect = document.getElementById("roomModeSelect");
const confirmCreateRoomBtn = document.getElementById("confirmCreateRoomBtn");

const joinRoomModal = document.getElementById("joinRoomModal");
const joinCodeInput = document.getElementById("joinCodeInput");
const confirmJoinRoomBtn = document.getElementById("confirmJoinRoomBtn");

const howToPlayModal = document.getElementById("howToPlayModal");
const statsModal = document.getElementById("statsModal");

// Stats Elements
const statsTotalGames = document.getElementById("statsTotalGames");
const statsTotalWins = document.getElementById("statsTotalWins");
const statsBestStreak = document.getElementById("statsBestStreak");
const statsWinRate = document.getElementById("statsWinRate");

// ===================================================
// INITIALIZATION
// ===================================================

function applyTheme(theme) {
    document.body.className = theme === "midnight" ? "theme-midnight" : "theme-paper";
    localStorage.setItem("nostalgia_theme", theme);
    themeIconEl.textContent = theme === "midnight" ? "☀️" : "🌙";
}

function updateProfileUI() {
    navAvatarEl.textContent = playerProfile.avatar;
    navPlayerNameEl.textContent = playerProfile.name;
    profileNameInput.value = playerProfile.name;

    // Highlight selected avatar
    document.querySelectorAll(".avatar-option").forEach(btn => {
        if (btn.dataset.avatar === playerProfile.avatar) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });
}

function updateAudioUI() {
    if (window.soundFX) {
        audioIconEl.textContent = window.soundFX.isMuted() ? "🔇" : "🔊";
    }
}

applyTheme(playerProfile.theme);
updateProfileUI();
updateAudioUI();

// Set daily word metadata immediately from local dictionary
if (window.NostalgiaWords) {
    const daily = window.NostalgiaWords.getDailyWord();
    dailyDateText.textContent = `📅 ${daily.dateString}`;
    dailyCategoryText.textContent = daily.categoryName;
}

// Attempt API fetch if running on Node backend
fetch("/api/daily").then(res => res.json()).then(data => {
    if (data) {
        dailyDateText.textContent = `📅 ${data.date}`;
        dailyCategoryText.textContent = data.categoryName;
    }
}).catch(() => {});

fetch("/api/stats").then(res => res.json()).then(data => {
    if (data && data.metrics) {
        onlineStatus.textContent = `🟢 Online • ${data.activeRooms} Active Rooms • ${data.totalWords} Curated Words`;
    }
}).catch(() => {});

// ===================================================
// AUDIO & THEME TOGGLES
// ===================================================

audioToggleBtn.addEventListener("click", () => {
    if (window.soundFX) {
        window.soundFX.toggleMute();
        updateAudioUI();
        window.soundFX.playClick();
    }
});

themeToggleBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    playerProfile.theme = playerProfile.theme === "paper" ? "midnight" : "paper";
    applyTheme(playerProfile.theme);
});

// ===================================================
// MODAL CONTROLLER HELPER
// ===================================================

function openModal(modalEl) {
    if (window.soundFX) window.soundFX.playClick();
    modalEl.style.display = "flex";
}

function closeModal(modalEl) {
    modalEl.style.display = "none";
}

// Close buttons binding
document.querySelectorAll(".modal-close-btn, [data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.playClick();
        const targetId = btn.dataset.close || btn.closest(".modal-overlay").id;
        const modal = document.getElementById(targetId);
        if (modal) closeModal(modal);
    });
});

// Close modal on backdrop click or ESC
window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
        closeModal(e.target);
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay").forEach(m => closeModal(m));
    }
});

// ===================================================
// PROFILE CUSTOMIZATION
// ===================================================

playerProfileBtn.addEventListener("click", () => {
    openModal(profileModal);
    profileNameInput.focus();
});

avatarPicker.querySelectorAll(".avatar-option").forEach(btn => {
    btn.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.playClick();
        playerProfile.avatar = btn.dataset.avatar;
        updateProfileUI();
    });
});

saveProfileBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    const cleanName = profileNameInput.value.trim().substring(0, 20);
    if (cleanName) {
        playerProfile.name = cleanName;
        localStorage.setItem("nostalgia_player_name", cleanName);
        localStorage.setItem("gameName", cleanName);
        localStorage.setItem("nostalgia_player_avatar", playerProfile.avatar);
        updateProfileUI();
    }
    closeModal(profileModal);
});

// ===================================================
// GAME LAUNCHERS
// ===================================================

// Solo Play
soloPlayBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    window.location.href = "solo.html";
});

// Daily Challenge
dailyPlayBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    window.location.href = "solo.html?mode=daily";
});

// Custom Word Duel (Preselects custom mode)
customDuelBtn.addEventListener("click", () => {
    roomModeSelect.value = "custom";
    openModal(createRoomModal);
});

// Create Room Modal
openCreateRoomBtn.addEventListener("click", () => {
    roomModeSelect.value = "standard";
    openModal(createRoomModal);
});

confirmCreateRoomBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    confirmCreateRoomBtn.disabled = true;
    confirmCreateRoomBtn.textContent = "Creating...";

    net.emit("createRoom", {
        playerName: playerProfile.name,
        avatar: playerProfile.avatar,
        category: roomCategorySelect.value,
        timerSeconds: roomTimerSelect.value,
        mode: roomModeSelect.value
    });
});

net.on("roomCreated", (data) => {
    window.location.href = `room.html?code=${data.roomCode}`;
});

// Join Room Modal
openJoinRoomBtn.addEventListener("click", () => {
    joinCodeInput.value = "";
    openModal(joinRoomModal);
    setTimeout(() => joinCodeInput.focus(), 50);
});

confirmJoinRoomBtn.addEventListener("click", () => {
    const code = joinCodeInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length >= 4) {
        if (window.soundFX) window.soundFX.playClick();
        window.location.href = `room.html?code=${code}`;
    } else {
        alert("Please enter a valid 5-character room code.");
    }
});

joinCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        confirmJoinRoomBtn.click();
    }
});

// How to Play & Stats Modals
howToPlayBtn.addEventListener("click", () => {
    openModal(howToPlayModal);
});

statsBtn.addEventListener("click", () => {
    const wins = parseInt(localStorage.getItem("nostalgia_solo_wins") || "0", 10);
    const bestStreak = parseInt(localStorage.getItem("nostalgia_solo_best_streak") || "0", 10);
    const totalGames = wins + parseInt(localStorage.getItem("nostalgia_solo_losses") || "0", 10);
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    statsTotalGames.textContent = totalGames;
    statsTotalWins.textContent = wins;
    statsBestStreak.textContent = bestStreak;
    statsWinRate.textContent = `${winRate}%`;

    openModal(statsModal);
});

// URL Auto-Join (e.g. ?code=XYZ)
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get("join") || urlParams.get("code");
    if (joinCode) {
        const clean = joinCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (clean) window.location.href = `room.html?code=${clean}`;
    }
});
