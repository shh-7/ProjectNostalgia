// ===================================================
// PROJECT NOSTALGIA - SOLO & DAILY PRACTICE LOGIC
// ===================================================

const SOLO_WORD_BANK = {
    nostalgia: {
        name: "📼 90s & 2000s Nostalgia",
        items: [
            { word: "TAMAGOTCHI", hint: "Iconic Japanese handheld digital egg pet from 1996" },
            { word: "WALKMAN", hint: "Sony's revolutionary portable cassette player" },
            { word: "GAMEBOY", hint: "Nintendo's 8-bit handheld that came bundled with Tetris" },
            { word: "CASSETTE", hint: "Magnetic tape audio format you wound with a pencil" },
            { word: "DIALUP", hint: "Internet that screeched through the home telephone line" },
            { word: "BLOCKBUSTER", hint: "Neighborhood video rental store where you 'Be Kind, Rewind'" },
            { word: "ROLLERBLADES", hint: "Inline skates that were huge in 90s street culture" },
            { word: "POKEMON", hint: "Gotta catch 'em all! Pocket monsters craze" },
            { word: "SLINKY", hint: "Spring toy that walks down stairs alone or in pairs" },
            { word: "MINICLIP", hint: "Beloved website for flash games during school computer lab" },
            { word: "NICKELODEON", hint: "TV channel famous for orange splats and green slime" },
            { word: "DISCMAN", hint: "Portable CD player that skipped every time you ran" },
            { word: "NINTENDO", hint: "64-bit console with a three-pronged controller" },
            { word: "BOOMBOX", hint: "Heavy portable cassette stereo carried on shoulders" },
            { word: "FLOPPY DISK", hint: "The 3.5-inch plastic square that held 1.44 MB of data" },
            { word: "LUNCHBOX", hint: "Metal container featuring cartoons with a matching thermos" },
            { word: "CHUCK E CHEESE", hint: "Arcade and pizza palace where a mouse played guitar" },
            { word: "PLAYSTATION", hint: "Sony's 1994 console with the legendary startup chime" },
            { word: "VIEW MASTER", hint: "Stereoscopic 3D toy using reels with circular slides" }
        ]
    },
    videogames: {
        name: "🕹️ Classic Video Games",
        items: [
            { word: "PACMAN", hint: "Yellow pellet-chomper avoiding Blinky, Pinky, Inky & Clyde" },
            { word: "TETRIS", hint: "Addictive falling tetromino puzzle created in the Soviet Union" },
            { word: "SUPER MARIO", hint: "Mushroom Kingdom plumber rescuing Princess Peach" },
            { word: "ZELDA", hint: "Hyrule hero Link wielding the Master Sword against Ganon" },
            { word: "SONIC", hint: "Blue hedgehog collecting golden rings at supersonic speed" },
            { word: "DONKEY KONG", hint: "Classic arcade gorilla throwing barrels at Jumpman" },
            { word: "METROID", hint: "Bounty hunter Samus Aran exploring alien planet Zebes" },
            { word: "DOOM", hint: "1993 pioneer FPS featuring the iconic BFG9000 on Mars" },
            { word: "SPACE INVADERS", hint: "1978 arcade phenomenon where aliens march down screen" },
            { word: "STREET FIGHTER", hint: "Ryu and Ken throwing Hadoukens in the arcade" },
            { word: "MEGA MAN", hint: "Capcom's blue bomber defeating Robot Masters for powers" },
            { word: "MORTAL KOMBAT", hint: "Brutal fighting game famous for 'FINISH HIM!' fatalities" },
            { word: "FROGGER", hint: "Amphibian dodging heavy traffic and jumping on floating logs" },
            { word: "PONG", hint: "Atari's historic 1972 table tennis arcade machine" },
            { word: "CONTRA", hint: "Run-and-gun arcade game that popularized the Konami Code" },
            { word: "CRASH BANDICOOT", hint: "Spinning marsupial smashing Wumpa fruit crates" },
            { word: "SPYRO", hint: "Purple dragon gliding through worlds to rescue elders" },
            { word: "DUCK HUNT", hint: "NES light gun shooter with a laughing hunting dog" }
        ]
    },
    cartoons: {
        name: "📺 Cartoons & Movies",
        items: [
            { word: "SCOOBY DOO", hint: "Mystery Inc.'s cowardly Great Dane who loves Scooby Snacks" },
            { word: "TOM AND JERRY", hint: "Cat and mouse duo engaged in eternal chaotic rivalry" },
            { word: "SPONGEBOB", hint: "Yellow sea sponge who lives in a pineapple under the sea" },
            { word: "THE LION KING", hint: "Simba learning the Circle of Life and 'Hakuna Matata'" },
            { word: "ALADDIN", hint: "Street urchin who finds a magic lamp with a blue Genie" },
            { word: "TOY STORY", hint: "Woody and Buzz Lightyear discovering friendship" },
            { word: "JURASSIC PARK", hint: "Theme park where prehistoric clones break loose" },
            { word: "THE MATRIX", hint: "Neo choosing between the blue pill and the red pill" },
            { word: "BACK TO THE FUTURE", hint: "Marty McFly and Doc Brown traveling in a DeLorean" },
            { word: "STAR WARS", hint: "Epic galactic conflict with Jedi, Sith, and lightsabers" },
            { word: "GHOSTBUSTERS", hint: "Who you gonna call when ectoplasm invades NYC?" },
            { word: "POWERPUFF GIRLS", hint: "Sugar, spice, and chemical X created Blossom, Bubbles & Buttercup" },
            { word: "DEXTERS LAB", hint: "Boy genius whose secret laboratory is ruined by sister Dee Dee" },
            { word: "DUCK TALES", hint: "Scrooge McDuck swimming in a vault of gold coins" },
            { word: "RUGRATS", hint: "Tommy Pickles and toddler squad on imaginary adventures" }
        ]
    },
    tech: {
        name: "💾 Retro Tech & Computing",
        items: [
            { word: "JAVASCRIPT", hint: "Programming language created in 10 days in 1995" },
            { word: "COMPUTER", hint: "Electronic brain running on silicon microprocessors" },
            { word: "ALGORITHM", hint: "Step-by-step mathematical recipe to solve a problem" },
            { word: "INTERNET", hint: "Global network of interconnected information servers" },
            { word: "KEYBOARD", hint: "Clicky mechanical typing apparatus with QWERTY layout" },
            { word: "MONITOR", hint: "Heavy CRT glass tube screen emitting a warm hum" },
            { word: "HARD DRIVE", hint: "Spinning magnetic platters storing your computer files" },
            { word: "TERMINAL", hint: "Text-only command interface for power users" },
            { word: "FLOPPY", hint: "Square magnetic diskette used to boot games from DOS" },
            { word: "WEBCAM", hint: "Grainy 240p eyeball camera for MSN Messenger video calls" },
            { word: "WINDOWS", hint: "Operating system made famous by Windows 95 and Solitaire" },
            { word: "LINUX", hint: "Open source penguin OS kernel created by Linus Torvalds" }
        ]
    },
    treats: {
        name: "🍭 Childhood Treats & Snacks",
        items: [
            { word: "DUNKAROOS", hint: "Kangaroo cookies dipped in sweet rainbow sprinkle frosting" },
            { word: "POP TARTS", hint: "Toaster pastries filled with fruit jelly and hard icing" },
            { word: "FUN DIP", hint: "Sugar stick dipped directly into fruit-flavored candy powders" },
            { word: "RING POP", hint: "Wearable lollipop gem that turned your fingers sticky" },
            { word: "CAPRI SUN", hint: "Silver foil juice pouch with the impossible-to-poke straw" },
            { word: "BUBBLE TAPE", hint: "Six feet of bubble gum rolled inside a plastic clam shell" },
            { word: "FRUIT ROLL UP", hint: "Stretchy sheet of fruit candy that left temporary tongue tattoos" },
            { word: "PUSH POP", hint: "Cylindrical candy you pushed up from the bottom with your finger" }
        ]
    },
    animals: {
        name: "🐾 Animals & Nature",
        items: [
            { word: "ELEPHANT", hint: "Gentle giant with a long trunk and remarkable memory" },
            { word: "CHAMELEON", hint: "Reptile with independently moving eyes that changes colors" },
            { word: "PENGUIN", hint: "Flightless aquatic bird dressed in a sleek natural tuxedo" },
            { word: "KANGAROO", hint: "Australian marsupial that hops and carries joeys in pouches" },
            { word: "FLAMINGO", hint: "Pink wading bird that famously stands on a single leg" },
            { word: "CHEETAH", hint: "The fastest land mammal capable of accelerating to 70 mph" },
            { word: "GIRAFFE", hint: "Tallest living terrestrial animal with an elongated neck" },
            { word: "DOLPHIN", hint: "Highly intelligent aquatic mammal using echolocation" }
        ]
    }
};

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

// Clues calculation based on difficulty
function getStartingClues(word, diff) {
    const lettersOnly = word.replace(/[^A-Z]/g, "");
    let count = 0;
    if (diff === "easy") count = lettersOnly.length > 7 ? 2 : 1;
    else if (diff === "normal") count = lettersOnly.length > 9 ? 1 : 0;
    else count = 0;

    const uniqueLetters = Array.from(new Set(lettersOnly.split("")));
    const revealed = [];
    while (revealed.length < count && uniqueLetters.length > 0) {
        const randIndex = Math.floor(Math.random() * uniqueLetters.length);
        revealed.push(uniqueLetters.splice(randIndex, 1)[0]);
    }
    return revealed;
}

// Start Game Round
async function startSoloRound() {
    const diff = difficultySelect.value;
    if (diff === "easy") maxLives = 7;
    else if (diff === "hard") maxLives = 5;
    else maxLives = 6;

    let selectedCatName = "";

    if (isDailyMode) {
        soloModeTitle.textContent = "DAILY CHALLENGE";
        soloCategorySelect.style.display = "none";
        difficultySelect.style.display = "none";

        try {
            const res = await fetch("/api/daily");
            const data = await res.json();
            currentWord = data.word ? data.word.toUpperCase() : "POKEMON";
            currentHint = data.hint || "Today's daily challenge!";
            selectedCatName = data.categoryName || "Daily Word";
        } catch {
            currentWord = "TAMAGOTCHI";
            currentHint = "Iconic Japanese handheld digital egg pet from 1996";
            selectedCatName = "📼 Nostalgia Daily";
        }
    } else {
        soloModeTitle.textContent = "SOLO PRACTICE";
        categoryKey = soloCategorySelect.value;
        const keys = Object.keys(SOLO_WORD_BANK);
        let selectedCat = categoryKey;
        if (categoryKey === "random" || !SOLO_WORD_BANK[categoryKey]) {
            selectedCat = keys[Math.floor(Math.random() * keys.length)];
        }

        const items = SOLO_WORD_BANK[selectedCat].items;
        const chosen = items[Math.floor(Math.random() * items.length)];
        currentWord = chosen.word.toUpperCase();
        currentHint = chosen.hint;
        selectedCatName = SOLO_WORD_BANK[selectedCat].name;
    }

    hintText.textContent = currentHint;
    hintText.style.display = "none";
    hintToggleBtn.textContent = "💡 Show Nostalgia Hint";

    const clueLetters = getStartingClues(currentWord, diff);

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
