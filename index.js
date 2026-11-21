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
const GOOGLE_CLIENT_ID = "957266937128-mcoeuhc89oq49c7lo8sscqa95novq83p.apps.googleusercontent.com";

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

// ===================================================
// QR CODE SCANNER (Instant Join via Camera)
// ===================================================

const openScanQRBtn = document.getElementById("openScanQRBtn");
const modalScanQRBtn = document.getElementById("modalScanQRBtn");
const qrScannerModal = document.getElementById("qrScannerModal");
const scannerVideo = document.getElementById("scannerVideo");
const scannerCanvas = document.getElementById("scannerCanvas");
const scannerStatusText = document.getElementById("scannerStatusText");
const scannerErrorMsg = document.getElementById("scannerErrorMsg");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const qrFileInput = document.getElementById("qrFileInput");

let scannerStream = null;
let isScanning = false;
let currentFacingMode = "environment";
let scanAnimFrame = null;
let barcodeDetectorInstance = null;

if (typeof window !== "undefined" && "BarcodeDetector" in window) {
    try {
        barcodeDetectorInstance = new BarcodeDetector({ formats: ["qr_code"] });
    } catch (e) {
        barcodeDetectorInstance = null;
    }
}

async function startQRScanner() {
    if (!scannerVideo || !qrScannerModal) return;
    openModal(qrScannerModal);
    
    if (scannerErrorMsg) scannerErrorMsg.style.display = "none";
    if (scannerStatusText) scannerStatusText.textContent = "Starting camera...";
    
    try {
        stopQRScanner();
        
        const constraints = {
            video: {
                facingMode: { ideal: currentFacingMode },
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        };
        
        scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
        scannerVideo.srcObject = scannerStream;
        await scannerVideo.play();
        
        isScanning = true;
        if (scannerStatusText) scannerStatusText.textContent = "Point camera at room QR code...";
        
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === "videoinput");
            if (switchCameraBtn) {
                switchCameraBtn.style.display = videoDevices.length > 1 ? "inline-block" : "none";
            }
        } catch (e) {}
        
        requestAnimationFrame(scanVideoLoop);
    } catch (err) {
        console.error("Camera access error:", err);
        isScanning = false;
        if (scannerStatusText) scannerStatusText.textContent = "Camera unavailable";
        if (scannerErrorMsg) {
            scannerErrorMsg.textContent = "Camera access error (" + (err.message || err.name) + "). You can upload a QR image or enter code manually.";
            scannerErrorMsg.style.display = "block";
        }
    }
}

function stopQRScanner() {
    isScanning = false;
    if (scanAnimFrame) {
        cancelAnimationFrame(scanAnimFrame);
        scanAnimFrame = null;
    }
    if (scannerStream) {
        scannerStream.getTracks().forEach(track => {
            try { track.stop(); } catch (e) {}
        });
        scannerStream = null;
    }
    if (scannerVideo) {
        scannerVideo.srcObject = null;
    }
}

async function scanVideoLoop() {
    if (!isScanning) return;
    
    if (scannerVideo.readyState === scannerVideo.HAVE_ENOUGH_DATA) {
        const vWidth = scannerVideo.videoWidth;
        const vHeight = scannerVideo.videoHeight;
        
        let detectedText = null;
        
        // 1. Hardware accelerated BarcodeDetector
        if (barcodeDetectorInstance) {
            try {
                const barcodes = await barcodeDetectorInstance.detect(scannerVideo);
                if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                    detectedText = barcodes[0].rawValue;
                }
            } catch (e) {}
        }
        
        // 2. jsQR universal fallback
        if (!detectedText && typeof jsQR !== "undefined" && scannerCanvas) {
            scannerCanvas.width = vWidth;
            scannerCanvas.height = vHeight;
            const ctx = scannerCanvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(scannerVideo, 0, 0, vWidth, vHeight);
            const imageData = ctx.getImageData(0, 0, vWidth, vHeight);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert"
            });
            if (code && code.data) {
                detectedText = code.data;
            }
        }
        
        if (detectedText) {
            const handled = handleDetectedQR(detectedText);
            if (handled) {
                return;
            }
        }
    }
    
    if (isScanning) {
        scanAnimFrame = requestAnimationFrame(scanVideoLoop);
    }
}

function handleDetectedQR(rawText) {
    if (!rawText) return false;
    const text = rawText.trim();
    console.log("[QR Scanner] Detected raw text:", text);
    
    let targetCode = "";
    let targetPwd = "";
    let isFullUrl = false;
    let finalUrl = "";
    
    try {
        let parsedUrl = null;
        if (text.startsWith("http://") || text.startsWith("https://")) {
            parsedUrl = new URL(text);
        } else if (text.includes("room.html") || text.includes("code=")) {
            parsedUrl = new URL(text, window.location.origin);
        }
        
        if (parsedUrl) {
            targetCode = (parsedUrl.searchParams.get("code") || "").trim().toUpperCase();
            targetPwd = parsedUrl.searchParams.get("pwd") || "";
            if (targetCode && targetCode.length >= 4) {
                isFullUrl = true;
                finalUrl = parsedUrl.toString();
            }
        }
    } catch (e) {}
    
    if (!targetCode) {
        const match = text.match(/[A-Z0-9]{5}/i);
        if (match) {
            targetCode = match[0].toUpperCase();
        }
    }
    
    if (targetCode && targetCode.length >= 4) {
        stopQRScanner();
        if (window.soundFX) window.soundFX.playWin();
        if (scannerStatusText) scannerStatusText.textContent = "✅ Found Room " + targetCode + "! Entering...";
        
        setTimeout(() => {
            if (isFullUrl && finalUrl.includes("room.html")) {
                window.location.href = finalUrl;
            } else {
                let dest = "room.html?code=" + encodeURIComponent(targetCode);
                if (targetPwd) dest += "&pwd=" + encodeURIComponent(targetPwd);
                window.location.href = dest;
            }
        }, 400);
        return true;
    } else {
        if (scannerErrorMsg) {
            scannerErrorMsg.textContent = "Unrecognized QR format: " + text.substring(0, 25);
            scannerErrorMsg.style.display = "block";
            setTimeout(() => {
                if (scannerErrorMsg) scannerErrorMsg.style.display = "none";
            }, 3000);
        }
        return false;
    }
}

if (switchCameraBtn) {
    switchCameraBtn.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.playClick();
        currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
        startQRScanner();
    });
}

if (qrFileInput) {
    qrFileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = scannerCanvas || document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                
                let found = null;
                if (typeof jsQR !== "undefined") {
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code && code.data) found = code.data;
                }
                
                if (found) {
                    handleDetectedQR(found);
                } else {
                    if (scannerErrorMsg) {
                        scannerErrorMsg.textContent = "No valid QR code found in uploaded image.";
                        scannerErrorMsg.style.display = "block";
                    }
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

if (openScanQRBtn) {
    openScanQRBtn.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.playClick();
        startQRScanner();
    });
}

if (modalScanQRBtn) {
    modalScanQRBtn.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.playClick();
        closeModal(joinRoomModal);
        startQRScanner();
    });
}

if (qrScannerModal) {
    const observer = new MutationObserver(() => {
        if (qrScannerModal.style.display === "none") {
            stopQRScanner();
        }
    });
    observer.observe(qrScannerModal, { attributes: true, attributeFilter: ["style"] });
}

document.querySelectorAll("[data-close='qrScannerModal']").forEach(el => {
    el.addEventListener("click", () => {
        stopQRScanner();
        if (qrScannerModal) closeModal(qrScannerModal);
    });
});
