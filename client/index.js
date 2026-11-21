// ===================================================
// PROJECT NOSTALGIA - ARCADE HOME CLIENT LOGIC
// ===================================================

const net = window.GameNetwork;

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

// State - read from cookie first, then localStorage
let playerProfile = {
    name: getCookie("nostalgia_player_name") || localStorage.getItem("nostalgia_player_name") || "",
    avatar: getCookie("nostalgia_player_avatar") || localStorage.getItem("nostalgia_player_avatar") || "👾",
    theme: localStorage.getItem("nostalgia_theme") || "paper"
};

// If no name, generate a placeholder (shown in welcome modal)
if (!playerProfile.name) {
    playerProfile.name = "Player " + Math.floor(100 + Math.random() * 900);
}

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
const welcomeModal = document.getElementById("welcomeModal");
const welcomeNameInput = document.getElementById("welcomeNameInput");
const welcomeSaveBtn = document.getElementById("welcomeSaveBtn");
const welcomeAvatarPicker = document.getElementById("welcomeAvatarPicker");

// Stats Elements
const statsTotalGames = document.getElementById("statsTotalGames");
const statsTotalWins = document.getElementById("statsTotalWins");
const statsBestStreak = document.getElementById("statsBestStreak");
const statsWinRate = document.getElementById("statsWinRate");

// ===================================================
// INITIALIZATION
// ===================================================

function saveProfile(name, avatar) {
    playerProfile.name = name;
    playerProfile.avatar = avatar;
    localStorage.setItem("nostalgia_player_name", name);
    localStorage.setItem("nostalgia_player_avatar", avatar);
    setCookie("nostalgia_player_name", name, 365);
    setCookie("nostalgia_player_avatar", avatar, 365);
}

function applyTheme(theme) {
    document.body.className = theme === "midnight" ? "theme-midnight" : "theme-paper";
    localStorage.setItem("nostalgia_theme", theme);
    themeIconEl.textContent = theme === "midnight" ? "☀️" : "🌙";
}

function updateProfileUI() {
    navAvatarEl.textContent = playerProfile.avatar;
    navPlayerNameEl.textContent = playerProfile.name;
    profileNameInput.value = playerProfile.name;

    // Highlight selected avatar in main profile picker
    document.querySelectorAll("#avatarPicker .avatar-option").forEach(btn => {
        btn.classList.toggle("selected", btn.dataset.avatar === playerProfile.avatar);
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
// FIRST-VISIT WELCOME MODAL (uses cookies to remember)
// ===================================================

const IS_FIRST_VISIT = !getCookie("nostalgia_visited");

function openWelcomeModal() {
    if (!welcomeModal) return;
    // Pre-fill with placeholder
    welcomeNameInput.value = "";
    welcomeNameInput.placeholder = playerProfile.name;
    welcomeModal.style.display = "flex";
    setTimeout(() => welcomeNameInput.focus(), 100);
}

// Welcome avatar picker
let welcomeChosenAvatar = "👾";
if (welcomeAvatarPicker) {
    welcomeAvatarPicker.querySelectorAll(".avatar-option").forEach(btn => {
        btn.addEventListener("click", () => {
            if (window.soundFX) window.soundFX.playClick();
            welcomeChosenAvatar = btn.dataset.avatar;
            welcomeAvatarPicker.querySelectorAll(".avatar-option").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
        });
    });
}

if (welcomeSaveBtn) {
    welcomeSaveBtn.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.playClick();
        const name = welcomeNameInput.value.trim().substring(0, 20) || welcomeNameInput.placeholder || playerProfile.name;
        saveProfile(name, welcomeChosenAvatar);
        setCookie("nostalgia_visited", "1", 365);
        updateProfileUI();
        welcomeModal.style.display = "none";
    });
}

if (welcomeNameInput) {
    welcomeNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") welcomeSaveBtn && welcomeSaveBtn.click();
    });
}

// Show welcome on first visit (delay slightly for smooth load)
window.addEventListener("DOMContentLoaded", () => {
    if (IS_FIRST_VISIT && welcomeModal) {
        setTimeout(openWelcomeModal, 600);
    }

    // URL Auto-Join (e.g. ?code=XYZ)
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get("join") || urlParams.get("code");
    if (joinCode) {
        const clean = joinCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (clean) window.location.href = `room.html?code=${clean}`;
    }
});

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

// Close modal on backdrop click (not for welcome on first visit)
window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
        if (e.target.id === "welcomeModal" && IS_FIRST_VISIT) return; // Don't dismiss without saving
        closeModal(e.target);
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay").forEach(m => {
            if (m.id === "welcomeModal" && IS_FIRST_VISIT) return;
            closeModal(m);
        });
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
        saveProfile(cleanName, playerProfile.avatar);
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

function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let c = "";
    for (let i = 0; i < 5; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
    return c;
}

// Create Room Modal
openCreateRoomBtn.addEventListener("click", () => {
    roomModeSelect.value = "standard";
    openModal(createRoomModal);
});

confirmCreateRoomBtn.addEventListener("click", () => {
    if (window.soundFX) window.soundFX.playClick();
    const roomCode = generateRoomCode();
    const roomPasswordEl = document.getElementById("roomPasswordCreateInput");

    sessionStorage.setItem("nostalgia_host_settings", JSON.stringify({
        category: roomCategorySelect.value,
        timerSeconds: roomTimerSelect.value,
        mode: roomModeSelect.value,
        password: roomPasswordEl ? roomPasswordEl.value.trim() : ""
    }));

    window.location.href = `room.html?code=${roomCode}&host=true`;
});

// Join Room Modal
openJoinRoomBtn.addEventListener("click", () => {
    joinCodeInput.value = "";
    openModal(joinRoomModal);
    setTimeout(() => joinCodeInput.focus(), 50);
});

confirmJoinRoomBtn.addEventListener("click", () => {
    const code = joinCodeInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const pwdEl = document.getElementById("joinPasswordInput");
    const pwd = pwdEl ? pwdEl.value.trim() : "";
    if (code.length >= 4) {
        if (window.soundFX) window.soundFX.playClick();
        window.location.href = `room.html?code=${code}${pwd ? "&pwd=" + encodeURIComponent(pwd) : ""}`;
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

// ===================================================
// GOOGLE SIGN-IN + EMAIL LOGIN
// ===================================================

// Replace with your actual Google OAuth Client ID from console.cloud.google.com
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    } catch (e) { return null; }
}

function handleGoogleCredential(response) {
    const payload = parseJwt(response.credential);
    if (!payload) return;
    const name = (payload.given_name || payload.name || "").substring(0, 20);
    const email = payload.email || "";
    if (name) {
        saveProfile(name, playerProfile.avatar);
        localStorage.setItem("nostalgia_user_email", email);
        setCookie("nostalgia_visited", "1", 365);
        updateProfileUI();
        playerProfileBtn.classList.add("signed-in");
        const badge = document.createElement("span");
        badge.className = "signed-in-badge";
        badge.textContent = "GOOGLE";
        playerProfileBtn.appendChild(badge);
        if (welcomeModal) welcomeModal.style.display = "none";
    }
}

window.addEventListener("load", () => {
    if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredential,
            auto_select: false
        });
    }
});

const googleSignInBtn = document.getElementById("googleSignInBtn");
if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.playClick();
        if (window.google && window.google.accounts) {
            window.google.accounts.id.prompt();
        } else {
            alert("Google Sign-In is loading. Please try again in a moment.");
        }
    });
}

const emailSignInBtn = document.getElementById("emailSignInBtn");
const emailLoginModal = document.getElementById("emailLoginModal");

if (emailSignInBtn) {
    emailSignInBtn.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.playClick();
        if (welcomeModal) welcomeModal.style.display = "none";
        if (emailLoginModal) emailLoginModal.style.display = "flex";
    });
}

const emailLoginSubmitBtn = document.getElementById("emailLoginSubmitBtn");
const emailLoginInput = document.getElementById("emailLoginInput");
const emailLoginNameInput = document.getElementById("emailLoginNameInput");

if (emailLoginSubmitBtn) {
    emailLoginSubmitBtn.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.playClick();
        const email = emailLoginInput ? emailLoginInput.value.trim() : "";
        const name = emailLoginNameInput ? emailLoginNameInput.value.trim().substring(0, 20) : "";
        if (!email || !email.includes("@")) {
            alert("Please enter a valid email address.");
            return;
        }
        const displayName = name || email.split("@")[0].substring(0, 20);
        saveProfile(displayName, playerProfile.avatar);
        localStorage.setItem("nostalgia_user_email", email);
        setCookie("nostalgia_visited", "1", 365);
        updateProfileUI();
        playerProfileBtn.classList.add("signed-in");
        if (emailLoginModal) emailLoginModal.style.display = "none";
    });
}

// Close email login modal on backdrop click or close button
document.querySelectorAll("[data-close='emailLoginModal']").forEach(el => {
    el.addEventListener("click", () => {
        if (emailLoginModal) emailLoginModal.style.display = "none";
    });
});
