const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { getCategories, getRandomWord, getStartingClues, getDailyWord, WORD_BANK } = require("./words");

const app = express();
const server = http.createServer(app);

// Enable Socket.IO with CORS support
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Global metrics
const metrics = {
    totalRoomsCreated: 0,
    totalGamesPlayed: 0,
    totalGuesses: 0
};

// Serve static client assets
const clientPath = path.join(__dirname, "../client");
app.use(express.static(clientPath));

// API Routes
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        activeRooms: Object.keys(rooms).length,
        metrics
    });
});

app.get("/api/categories", (req, res) => {
    res.json(getCategories());
});

app.get("/api/daily", (req, res) => {
    const daily = getDailyWord();
    res.json({
        categoryName: daily.categoryName,
        categoryKey: daily.categoryKey,
        length: daily.word.length,
        hint: daily.hint,
        date: daily.dateString
    });
});

app.get("/api/stats", (req, res) => {
    let totalWords = 0;
    Object.keys(WORD_BANK).forEach(k => {
        totalWords += WORD_BANK[k].items.length;
    });

    res.json({
        activeRooms: Object.keys(rooms).length,
        totalWords,
        metrics
    });
});

// HTML Page Routes
app.get("/room", (req, res) => {
    res.sendFile(path.join(clientPath, "room.html"));
});

app.get("/solo", (req, res) => {
    res.sendFile(path.join(clientPath, "solo.html"));
});

// Store active game rooms
// Key: roomCode -> room data
const rooms = {};

// Helper: Generate unique 5-character alphanumeric room code
function generateRoomCode() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if (rooms[code]) {
        return generateRoomCode();
    }
    return code;
}

// Helper: Build sanitized room state for sending to clients
function getSanitizedRoomState(room) {
    if (!room) return null;

    let maskedGame = null;
    if (room.game) {
        const showFullWord = room.gameState === "roundOver";
        maskedGame = {
            categoryName: room.game.categoryName,
            categoryKey: room.game.categoryKey,
            hint: room.game.hint,
            displayLetters: showFullWord ? room.game.word.split("") : room.game.maskedWord,
            wordLength: room.game.word.length,
            revealedWord: showFullWord ? room.game.word : null,
            guessedLetters: room.game.guessedLetters,
            wrongGuesses: room.game.wrongGuesses,
            maxLives: room.game.maxLives,
            currentTurnId: room.game.turnPlayerId,
            currentTurnName: room.game.turnPlayerName,
            puzzleCreatorName: room.game.puzzleCreatorName,
            turnExpiresAt: room.game.turnExpiresAt,
            timerSeconds: room.timerSeconds,
            winnerName: room.game.winnerName,
            isVictory: room.game.isVictory
        };
    }

    return {
        roomCode: room.code,
        category: room.category,
        mode: room.mode || "standard",
        timerSeconds: room.timerSeconds || 0,
        gameState: room.gameState, // 'lobby' | 'playing' | 'roundOver'
        roundNumber: room.roundNumber || 0,
        hostId: room.hostId,
        players: room.players.map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar || "👾",
            score: p.score,
            roundsWon: p.roundsWon,
            isHost: p.id === room.hostId
        })),
        game: maskedGame,
        chatMessages: room.chatMessages.slice(-25)
    };
}

// Turn Timer Management
function resetTurnTimer(room) {
    if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
    }

    if (room.timerSeconds && room.timerSeconds > 0 && room.gameState === "playing" && room.game) {
        room.game.turnExpiresAt = Date.now() + (room.timerSeconds * 1000);

        room.timerInterval = setTimeout(() => {
            handleTurnTimeout(room.code);
        }, room.timerSeconds * 1000);
    } else if (room.game) {
        room.game.turnExpiresAt = null;
    }
}

function handleTurnTimeout(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.gameState !== "playing" || !room.game) return;

    // Timeout penalty: counts as 1 wrong guess & switches turn
    room.game.wrongGuesses += 1;

    io.to(roomCode).emit("turnNotice", `⏰ ${room.game.turnPlayerName} ran out of time! (-1 life)`);

    if (room.game.wrongGuesses >= room.game.maxLives) {
        room.gameState = "roundOver";
        room.game.isVictory = false;
        room.game.winnerName = null;

        if (room.timerInterval) clearInterval(room.timerInterval);

        io.to(roomCode).emit("guessResult", {
            letter: "",
            correct: false,
            byPlayer: room.game.turnPlayerName,
            isRoundOver: true,
            isVictory: false
        });
    } else {
        // Pass turn
        if (room.players.length > 1) {
            room.game.currentTurnIndex = (room.game.currentTurnIndex + 1) % room.players.length;
            const nextPlayer = room.players[room.game.currentTurnIndex];
            room.game.turnPlayerId = nextPlayer.id;
            room.game.turnPlayerName = nextPlayer.name;
        }
        resetTurnTimer(room);
    }

    io.to(roomCode).emit("roomUpdated", getSanitizedRoomState(room));
}

// Inactivity watchdog: disband room after 120s of no activity
function startRoomInactivityWatch(code) {
    const room = rooms[code];
    if (!room) return;
    if (room.inactivityTimer) clearInterval(room.inactivityTimer);

    room.lastActivityAt = Date.now();
    room.inactivityTimer = setInterval(() => {
        const r = rooms[code];
        if (!r) { clearInterval(room.inactivityTimer); return; }
        const idleMs = Date.now() - (r.lastActivityAt || Date.now());
        if (idleMs >= 120000) {
            clearInterval(r.inactivityTimer);
            if (r.timerInterval) clearInterval(r.timerInterval);
            io.to(code).emit("roomDisbanded", "⏳ Room disbanded due to 120 seconds of inactivity.");
            console.log(`[Room Disbanded] ${code} due to inactivity.`);
            delete rooms[code];
        }
    }, 5000);
}

// Update room activity timestamp
function touchRoom(code) {
    const room = rooms[code];
    if (room) room.lastActivityAt = Date.now();
}

// Start a new game round
function initNewRound(room, customPuzzle = null) {
    let word, hint, catKey, catName, maskedWord, clueLetters;

    if (customPuzzle && customPuzzle.word) {
        word = customPuzzle.word.toUpperCase().trim();
        hint = customPuzzle.hint || "Custom secret puzzle!";
        catKey = "custom";
        catName = `✍️ ${customPuzzle.creatorName || "Player"}'s Custom Puzzle`;
        maskedWord = customPuzzle.maskedWord || word.split("").map(c => c === " " ? " " : null);
        clueLetters = customPuzzle.clueLetters || [];
    } else {
        const selected = getRandomWord(room.category);
        word = selected.word;
        hint = selected.hint;
        catKey = selected.categoryKey;
        catName = selected.categoryName;
        clueLetters = getStartingClues(word, "normal");
        maskedWord = word.split("").map(char => {
            if (char === " ") return " ";
            if (clueLetters.includes(char)) return char;
            return null;
        });
    }

    let turnIndex = 0;
    if (customPuzzle && room.players.length > 1) {
        const creatorIndex = room.players.findIndex(p => p.name === customPuzzle.creatorName);
        turnIndex = creatorIndex === 0 ? 1 : 0;
    } else if (room.players.length > 1) {
        turnIndex = room.roundNumber ? room.roundNumber % room.players.length : 0;
    }

    const turnPlayer = room.players[turnIndex] || room.players[0];

    const initialGuessed = clueLetters.map(letter => ({
        letter,
        correct: true
    }));

    room.game = {
        word: word,
        hint: hint,
        categoryKey: catKey,
        categoryName: catName,
        maskedWord: maskedWord,
        guessedLetters: initialGuessed,
        wrongGuesses: 0,
        maxLives: 6,
        currentTurnIndex: turnIndex,
        turnPlayerId: turnPlayer.id,
        turnPlayerName: turnPlayer.name,
        puzzleCreatorName: customPuzzle ? customPuzzle.creatorName : null,
        turnExpiresAt: null,
        winnerName: null,
        isVictory: false
    };

    room.gameState = "playing";
    room.roundNumber = (room.roundNumber || 0) + 1;
    metrics.totalGamesPlayed += 1;

    resetTurnTimer(room);
}

// Socket.IO event handling
io.on("connection", (socket) => {
    // CREATE ROOM
    socket.on("createRoom", ({ roomCode, playerName, avatar, category, timerSeconds, mode, password }) => {
        const safeName = (playerName || "Player 1").trim().substring(0, 20);
        const safeAvatar = avatar || "👾";
        const code = (roomCode || generateRoomCode()).trim().toUpperCase();

        rooms[code] = {
            code: code,
            hostId: socket.id,
            category: category || "random",
            mode: mode || "standard",
            timerSeconds: parseInt(timerSeconds, 10) || 0,
            password: (password || "").trim().substring(0, 20),
            gameState: "lobby",
            roundNumber: 0,
            chatMessages: [],
            players: [
                {
                    id: socket.id,
                    name: safeName,
                    avatar: safeAvatar,
                    score: 0,
                    roundsWon: 0
                }
            ],
            game: null,
            timerInterval: null,
            lastActivityAt: Date.now(),
            inactivityTimer: null
        };

        // Start inactivity watchdog
        startRoomInactivityWatch(code);

        metrics.totalRoomsCreated += 1;
        socket.join(code);
        socket.currentRoom = code;

        console.log(`[Room Created] ${code} by ${safeName} (${safeAvatar})`);

        socket.emit("roomCreated", {
            roomCode: code,
            playerName: safeName
        });

        io.to(code).emit("roomUpdated", getSanitizedRoomState(rooms[code]));
    });

    // JOIN ROOM
    socket.on("joinRoom", ({ roomCode, playerName, avatar, password }) => {
        const code = (roomCode || "").trim().toUpperCase();
        const safeName = (playerName || "Guest").trim().substring(0, 20);
        const safeAvatar = avatar || "🎮";
        const room = rooms[code];

        if (!room) {
            socket.emit("joinError", "Room does not exist. Check code and try again.");
            return;
        }

        // Password check
        if (room.password && room.password !== (password || "").trim()) {
            socket.emit("joinError", "🔒 Incorrect room password. Ask your friend for the password.");
            return;
        }

        const existingPlayer = room.players.find(p => p.id === socket.id);
        if (existingPlayer) {
            existingPlayer.name = safeName;
            existingPlayer.avatar = safeAvatar;
            socket.join(code);
            socket.currentRoom = code;
            socket.emit("roomJoined", { roomCode: code });
            io.to(code).emit("roomUpdated", getSanitizedRoomState(room));
            return;
        }

        if (room.players.length >= 2) {
            socket.emit("joinError", "Room is already full (maximum 2 players).");
            return;
        }

        room.players.push({
            id: socket.id,
            name: safeName,
            avatar: safeAvatar,
            score: 0,
            roundsWon: 0
        });

        // Mark activity when someone joins
        room.lastActivityAt = Date.now();

        socket.join(code);
        socket.currentRoom = code;

        console.log(`[Room Joined] ${safeName} (${safeAvatar}) joined ${code}`);

        // Add welcome message in chat
        room.chatMessages.push({
            id: Date.now(),
            sender: "SYSTEM",
            avatar: "📢",
            text: `${safeName} joined the room!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        socket.emit("roomJoined", { roomCode: code });
        io.to(code).emit("roomUpdated", getSanitizedRoomState(room));
        io.to(code).emit("playerJoinedAnnouncement", `${safeName} joined the room!`);
    });

    // UPDATE ROOM SETTINGS (Host only)
    socket.on("updateSettings", ({ roomCode, category, timerSeconds, mode, password }) => {
        const room = rooms[roomCode];
        if (!room || room.hostId !== socket.id) return;

        if (category) room.category = category;
        if (mode) room.mode = mode;
        if (timerSeconds !== undefined) room.timerSeconds = parseInt(timerSeconds, 10);
        if (password !== undefined) room.password = (password || "").trim().substring(0, 20);
        touchRoom(roomCode);

        io.to(roomCode).emit("roomUpdated", getSanitizedRoomState(room));
    });

    // START GAME
    socket.on("startGame", ({ roomCode, customWord, customHint, customPuzzle }) => {
        const room = rooms[roomCode];
        if (!room) return;

        touchRoom(roomCode);

        let puzzle = customPuzzle;
        if (!puzzle && customWord) {
            puzzle = {
                word: customWord,
                hint: customHint,
                maskedWord: customWord.split("").map(c => c === " " ? " " : null),
                clueLetters: [],
                creatorName: "Host"
            };
        }

        initNewRound(room, puzzle);
        console.log(`[Game Started] Room ${roomCode}: Word "${room.game.word}" (${room.game.categoryName})`);

        io.to(roomCode).emit("gameStarted", getSanitizedRoomState(room));
        io.to(roomCode).emit("roomUpdated", getSanitizedRoomState(room));
    });

    // GUESS LETTER
    socket.on("guessLetter", ({ roomCode, letter }) => {
        const room = rooms[roomCode];
        if (!room || room.gameState !== "playing" || !room.game) return;
        touchRoom(roomCode);

        const char = (letter || "").toUpperCase();
        if (!/^[A-Z]$/.test(char)) return;

        if (room.players.length > 1 && room.game.turnPlayerId !== socket.id) {
            socket.emit("turnNotice", "It's not your turn yet!");
            return;
        }

        const alreadyGuessed = room.game.guessedLetters.some(g => g.letter === char);
        if (alreadyGuessed) {
            socket.emit("turnNotice", `Letter "${char}" was already guessed!`);
            return;
        }

        metrics.totalGuesses += 1;
        const word = room.game.word;
        const isMatch = word.includes(char);
        const currentPlayer = room.players.find(p => p.id === socket.id);

        if (isMatch) {
            let count = 0;
            for (let i = 0; i < word.length; i++) {
                if (word[i] === char) {
                    room.game.maskedWord[i] = char;
                    count++;
                }
            }

            if (currentPlayer) {
                currentPlayer.score += count * 10;
            }

            room.game.guessedLetters.push({ letter: char, correct: true });

            const allSolved = room.game.maskedWord.every(c => c !== null);

            if (allSolved) {
                room.gameState = "roundOver";
                room.game.isVictory = true;
                room.game.winnerName = currentPlayer ? currentPlayer.name : "Players";

                if (room.timerInterval) clearInterval(room.timerInterval);

                if (currentPlayer) {
                    currentPlayer.score += 50;
                    currentPlayer.roundsWon += 1;
                }

                io.to(roomCode).emit("guessResult", {
                    letter: char,
                    correct: true,
                    byPlayer: currentPlayer ? currentPlayer.name : "Player",
                    isRoundOver: true,
                    isVictory: true
                });

                io.to(roomCode).emit("roomUpdated", getSanitizedRoomState(room));
                return;
            } else {
                resetTurnTimer(room);
                io.to(roomCode).emit("guessResult", {
                    letter: char,
                    correct: true,
                    byPlayer: currentPlayer ? currentPlayer.name : "Player",
                    isRoundOver: false
                });
            }

        } else {
            room.game.wrongGuesses += 1;
            room.game.guessedLetters.push({ letter: char, correct: false });

            if (room.game.wrongGuesses >= room.game.maxLives) {
                room.gameState = "roundOver";
                room.game.isVictory = false;
                room.game.winnerName = null;

                if (room.timerInterval) clearInterval(room.timerInterval);

                io.to(roomCode).emit("guessResult", {
                    letter: char,
                    correct: false,
                    byPlayer: currentPlayer ? currentPlayer.name : "Player",
                    isRoundOver: true,
                    isVictory: false
                });

                io.to(roomCode).emit("roomUpdated", getSanitizedRoomState(room));
                return;
            }

            if (room.players.length > 1) {
                room.game.currentTurnIndex = (room.game.currentTurnIndex + 1) % room.players.length;
                const nextPlayer = room.players[room.game.currentTurnIndex];
                room.game.turnPlayerId = nextPlayer.id;
                room.game.turnPlayerName = nextPlayer.name;
            }

            resetTurnTimer(room);

            io.to(roomCode).emit("guessResult", {
                letter: char,
                correct: false,
                byPlayer: currentPlayer ? currentPlayer.name : "Player",
                isRoundOver: false
            });
        }

        io.to(roomCode).emit("roomUpdated", getSanitizedRoomState(room));
    });

    // PLAY AGAIN / NEXT ROUND
    socket.on("nextRound", ({ roomCode, customWord, customHint, customPuzzle }) => {
        const room = rooms[roomCode];
        if (!room) return;

        touchRoom(roomCode);

        let puzzle = customPuzzle;
        if (!puzzle && customWord) {
            puzzle = {
                word: customWord,
                hint: customHint,
                maskedWord: customWord.split("").map(c => c === " " ? " " : null),
                clueLetters: [],
                creatorName: "Player"
            };
        }

        initNewRound(room, puzzle);
        io.to(roomCode).emit("gameStarted", getSanitizedRoomState(room));
        io.to(roomCode).emit("roomUpdated", getSanitizedRoomState(room));
    });

    // REACTION / EMOTE
    socket.on("sendReaction", ({ roomCode, emoji, playerName }) => {
        if (!emoji || !roomCode) return;
        io.to(roomCode).emit("reactionReceived", {
            emoji,
            playerName: (playerName || "Player").substring(0, 20)
        });
    });

    // IN-GAME CHAT
    socket.on("sendChatMessage", ({ roomCode, text }) => {
        const room = rooms[roomCode];
        if (!room || !text || !text.trim()) return;

        touchRoom(roomCode);

        const sender = room.players.find(p => p.id === socket.id) || { name: "Guest", avatar: "👾" };
        const msg = {
            id: Date.now(),
            sender: sender.name,
            avatar: sender.avatar,
            text: text.trim().substring(0, 100),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        room.chatMessages.push(msg);
        if (room.chatMessages.length > 30) room.chatMessages.shift();

        io.to(roomCode).emit("chatMessage", msg);
    });

    // PLAYER DISCONNECTS
    socket.on("disconnect", () => {
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                const leavingPlayer = room.players[playerIndex];
                room.players.splice(playerIndex, 1);

                if (room.players.length === 0) {
                    if (room.timerInterval) clearInterval(room.timerInterval);
                    if (room.inactivityTimer) clearInterval(room.inactivityTimer);
                    delete rooms[roomCode];
                    console.log(`[Room Deleted] ${roomCode} is empty.`);
                } else {
                    if (room.hostId === socket.id && room.players.length > 0) {
                        room.hostId = room.players[0].id;
                        console.log(`[New Host] Room ${roomCode} host assigned to ${room.players[0].name}`);
                    }

                    if (room.gameState === "playing" && room.game && room.game.turnPlayerId === socket.id) {
                        room.game.currentTurnIndex = 0;
                        room.game.turnPlayerId = room.players[0].id;
                        room.game.turnPlayerName = room.players[0].name;
                        resetTurnTimer(room);
                    }

                    room.chatMessages.push({
                        id: Date.now(),
                        sender: "SYSTEM",
                        avatar: "📢",
                        text: `${leavingPlayer.name} disconnected.`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });

                    io.to(roomCode).emit("playerLeftAnnouncement", `${leavingPlayer.name} left the room.`);
                    io.to(roomCode).emit("roomUpdated", getSanitizedRoomState(room));
                }
            }
        }
    });
});

// Start Server
server.listen(PORT, () => {
    console.log("==========================================");
    console.log("    🕹️  PROJECT NOSTALGIA SERVER READY  🕹️   ");
    console.log(`    Running at: http://localhost:${PORT}   `);
    console.log(`    Port: ${PORT} (Environment: ${process.env.NODE_ENV || "development"})`);
    console.log("==========================================");
});
