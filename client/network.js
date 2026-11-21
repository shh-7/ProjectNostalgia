// ===================================================
// PROJECT NOSTALGIA - UNIFIED NETWORK ADAPTER
// Supports:
// 1. Socket.IO (when hosted with Node backend)
// 2. PeerJS / WebRTC (100% serverless on GitHub Pages)
// ===================================================

class NetworkAdapter {
    constructor() {
        this.listeners = {};
        this.mode = "detecting"; // 'socket' | 'webrtc'
        this.socket = null;
        this.peer = null;
        this.connections = []; // For Host in WebRTC mode
        this.connToHost = null; // For Guest in WebRTC mode
        this.isHost = false;
        this.roomState = null;
        this.roomCode = null;
        this.timerInterval = null;

        this.init();
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emitEvent(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    init() {
        const isStaticHost = window.location.hostname.includes("github.io") ||
                             window.location.protocol === "file:" ||
                             window.location.hostname.includes("pages.dev");

        if (isStaticHost || typeof io === "undefined") {
            this.mode = "webrtc";
            console.log("[Network] GitHub Pages / Static hosting detected. Operating in WebRTC Serverless P2P mode.");
        } else {
            try {
                this.socket = io({
                    reconnectionAttempts: 2,
                    timeout: 2000
                });

                this.socket.on("connect", () => {
                    this.mode = "socket";
                    console.log("[Network] Connected to Node Socket.IO backend:", this.socket.id);
                });

                this.socket.on("connect_error", () => {
                    if (this.mode === "detecting") {
                        console.warn("[Network] Socket.IO connection unavailable. Switching to WebRTC P2P mode.");
                        this.mode = "webrtc";
                    }
                });

                const socketEvents = [
                    "roomCreated", "roomJoined", "roomUpdated", "gameStarted",
                    "guessResult", "turnNotice", "playerJoinedAnnouncement",
                    "playerLeftAnnouncement", "reactionReceived", "chatMessage",
                    "joinError", "roomError"
                ];

                socketEvents.forEach(evt => {
                    this.socket.on(evt, (data) => this.emitEvent(evt, data));
                });

            } catch (e) {
                this.mode = "webrtc";
            }
        }
    }

    emit(event, payload) {
        if (this.mode === "socket" && this.socket && this.socket.connected) {
            this.socket.emit(event, payload);
        } else {
            this.handleWebRTCAction(event, payload);
        }
    }

    // ===============================================
    // WEBRTC SERVERLESS P2P IMPLEMENTATION
    // ===============================================

    getPeerPrefix(code) {
        return "nostalgia-rm-" + code.toLowerCase();
    }

    handleWebRTCAction(event, payload) {
        switch (event) {
            case "createRoom":
                this.webrtcCreateRoom(payload);
                break;
            case "joinRoom":
                this.webrtcJoinRoom(payload);
                break;
            case "updateSettings":
                this.webrtcUpdateSettings(payload);
                break;
            case "startGame":
                this.webrtcStartGame(payload);
                break;
            case "guessLetter":
                this.webrtcGuessLetter(payload);
                break;
            case "nextRound":
                this.webrtcNextRound(payload);
                break;
            case "sendReaction":
                this.webrtcSendReaction(payload);
                break;
            case "sendChatMessage":
                this.webrtcSendChatMessage(payload);
                break;
        }
    }

    generateCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let c = "";
        for (let i = 0; i < 5; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
        return c;
    }

    webrtcCreateRoom(payload) {
        this.isHost = true;
        const code = (payload.roomCode || this.generateCode()).trim().toUpperCase();
        this.roomCode = code;
        const peerId = this.getPeerPrefix(code);

        this.initHostPeer(peerId, payload, code);
    }

    initHostPeer(peerId, payload, code) {
        if (typeof Peer === "undefined") {
            alert("PeerJS library is loading. Please try again in a moment.");
            return;
        }

        try {
            if (this.peer) {
                try { this.peer.destroy(); } catch (e) {}
            }

            this.peer = new Peer(peerId, {
                host: "0.peerjs.com",
                port: 443,
                path: "/",
                secure: true,
                debug: 1
            });

            this.peer.on("open", (id) => {
                console.log("[WebRTC Host] Room opened with Peer ID:", id);

                this.roomState = {
                    roomCode: code,
                    category: payload.category || "random",
                    mode: payload.mode || "standard",
                    timerSeconds: parseInt(payload.timerSeconds, 10) || 0,
                    password: (payload.password || "").trim(),
                    gameState: "lobby",
                    roundNumber: 0,
                    hostId: "host",
                    players: [
                        {
                            id: "host",
                            name: (payload.playerName || "Player 1").substring(0, 20),
                            avatar: payload.avatar || "👾",
                            score: 0,
                            roundsWon: 0,
                            isHost: true
                        }
                    ],
                    game: null,
                    chatMessages: []
                };

                this.emitEvent("roomCreated", { roomCode: code, playerName: payload.playerName });
                this.emitEvent("roomUpdated", this.getSanitizedState());
            });

            this.peer.on("connection", (conn) => {
                this.setupHostConnection(conn);
            });

            this.peer.on("error", (err) => {
                console.error("[WebRTC Host Error]", err);
                if (err.type === "unavailable-id") {
                    // ID taken, generate new code and update URL
                    const newCode = this.generateCode();
                    this.roomCode = newCode;
                    if (window.history && window.history.replaceState) {
                        window.history.replaceState({}, '', `?code=${newCode}&host=true`);
                    }
                    this.webrtcCreateRoom({ ...payload, roomCode: newCode });
                }
            });

        } catch (e) {
            console.error("[WebRTC Init Error]", e);
        }
    }

    setupHostConnection(conn) {
        conn.on("open", () => {
            console.log("[WebRTC Host] Guest connected:", conn.peer);
            this.connections.push(conn);
        });

        conn.on("data", (data) => {
            this.handleHostReceivedData(data, conn);
        });

        conn.on("close", () => {
            console.log("[WebRTC Host] Guest disconnected");
            this.connections = this.connections.filter(c => c !== conn);
            if (this.roomState && this.roomState.players.length > 1) {
                const leaving = this.roomState.players[1];
                this.roomState.players.splice(1, 1);
                this.broadcast("playerLeftAnnouncement", `${leaving.name} left the room.`);
                this.broadcastRoomState();
            }
        });
    }

    handleHostReceivedData(msg, conn) {
        if (!msg || !msg.type) return;

        switch (msg.type) {
            case "guestJoin":
                if (this.roomState.players.length >= 2) {
                    conn.send({ type: "joinError", error: "Room is already full." });
                    return;
                }
                // Password check in WebRTC mode
                if (this.roomState.password && this.roomState.password !== (msg.password || "").trim()) {
                    conn.send({ type: "joinError", error: "🔒 Incorrect room password." });
                    return;
                }
                const guestPlayer = {
                    id: "guest",
                    name: (msg.playerName || "Player 2").substring(0, 20),
                    avatar: msg.avatar || "🎮",
                    score: 0,
                    roundsWon: 0,
                    isHost: false
                };
                this.roomState.players.push(guestPlayer);

                conn.send({ type: "roomJoined", roomCode: this.roomState.roomCode });
                this.broadcast("playerJoinedAnnouncement", `${guestPlayer.name} joined!`);
                this.broadcastRoomState();
                break;

            case "guessLetter":
                this.processGuess(msg.letter, "guest");
                break;

            case "startGame":
                this.webrtcStartGame(msg);
                break;

            case "nextRound":
                this.webrtcNextRound(msg);
                break;

            case "sendReaction":
                this.broadcast("reactionReceived", msg);
                break;

            case "sendChatMessage":
                const chatMsg = {
                    id: Date.now(),
                    sender: msg.sender,
                    avatar: msg.avatar,
                    text: msg.text,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                this.roomState.chatMessages.push(chatMsg);
                if (this.roomState.chatMessages.length > 30) this.roomState.chatMessages.shift();
                this.broadcast("chatMessage", chatMsg);
                break;
        }
    }

    webrtcJoinRoom(payload) {
        this.isHost = false;
        const code = (payload.roomCode || "").trim().toUpperCase();
        const hostPeerId = this.getPeerPrefix(code);

        if (typeof Peer === "undefined") {
            alert("PeerJS library is loading. Please try again in a moment.");
            return;
        }

        try {
            if (this.peer) {
                try { this.peer.destroy(); } catch (e) {}
            }

            this.peer = new Peer({
                host: "0.peerjs.com",
                port: 443,
                path: "/",
                secure: true,
                debug: 1
            });

            let retryCount = 0;
            const maxRetries = 3;

            const connectToHost = () => {
                console.log(`[WebRTC Guest] Attempting connection to Host Peer (${hostPeerId}). Attempt ${retryCount + 1}/${maxRetries}`);
                const conn = this.peer.connect(hostPeerId, { reliable: true });

                let connected = false;

                conn.on("open", () => {
                    connected = true;
                    this.connToHost = conn;
                    console.log("[WebRTC Guest] Connected to host successfully!");
                    conn.send({
                        type: "guestJoin",
                        playerName: payload.playerName,
                        avatar: payload.avatar,
                        password: payload.password || ""
                    });
                });

                conn.on("data", (data) => {
                    this.handleGuestReceivedData(data);
                });

                conn.on("close", () => {
                    console.log("[WebRTC Guest] Connection to host closed");
                });

                conn.on("error", (err) => {
                    console.error("[WebRTC Guest Conn Error]", err);
                });

                // If not connected after 2.5s, retry
                setTimeout(() => {
                    if (!connected && retryCount < maxRetries) {
                        retryCount++;
                        connectToHost();
                    } else if (!connected) {
                        this.emitEvent("joinError", `Could not find room "${code}". Make sure your friend has the room open!`);
                    }
                }, 2500);
            };

            this.peer.on("open", () => {
                connectToHost();
            });

            this.peer.on("error", (err) => {
                console.error("[WebRTC Guest Peer Error]", err);
                if (err.type === "peer-unavailable" && retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(connectToHost, 1500);
                } else {
                    this.emitEvent("joinError", `Could not locate room "${code}". Make sure your friend has the room open!`);
                }
            });

        } catch (e) {
            console.error("[WebRTC Join Init Error]", e);
        }
    }

    handleGuestReceivedData(data) {
        if (!data || !data.type) return;

        switch (data.type) {
            case "roomJoined":
                this.emitEvent("roomJoined", data);
                break;
            case "roomUpdated":
                this.emitEvent("roomUpdated", data.state);
                break;
            case "gameStarted":
                this.emitEvent("gameStarted", data.state);
                break;
            case "guessResult":
                this.emitEvent("guessResult", data);
                break;
            case "turnNotice":
                this.emitEvent("turnNotice", data.msg);
                break;
            case "playerJoinedAnnouncement":
                this.emitEvent("playerJoinedAnnouncement", data.msg);
                break;
            case "playerLeftAnnouncement":
                this.emitEvent("playerLeftAnnouncement", data.msg);
                break;
            case "reactionReceived":
                this.emitEvent("reactionReceived", data);
                break;
            case "chatMessage":
                this.emitEvent("chatMessage", data);
                break;
            case "joinError":
                this.emitEvent("joinError", data.error);
                break;
        }
    }

    broadcast(type, data) {
        const payload = typeof data === "object" ? { type, ...data } : { type, msg: data };
        this.emitEvent(type, payload);
        this.connections.forEach(conn => {
            if (conn.open) conn.send(payload);
        });
    }

    broadcastRoomState() {
        const state = this.getSanitizedState();
        this.emitEvent("roomUpdated", state);
        this.connections.forEach(conn => {
            if (conn.open) conn.send({ type: "roomUpdated", state });
        });
    }

    getSanitizedState() {
        if (!this.roomState) return null;
        let maskedGame = null;
        if (this.roomState.game) {
            const showFull = this.roomState.gameState === "roundOver";
            maskedGame = {
                categoryName: this.roomState.game.categoryName,
                categoryKey: this.roomState.game.categoryKey,
                hint: this.roomState.game.hint,
                displayLetters: showFull ? this.roomState.game.word.split("") : this.roomState.game.maskedWord,
                wordLength: this.roomState.game.word.length,
                revealedWord: showFull ? this.roomState.game.word : null,
                guessedLetters: this.roomState.game.guessedLetters,
                wrongGuesses: this.roomState.game.wrongGuesses,
                maxLives: this.roomState.game.maxLives,
                currentTurnId: this.roomState.game.turnPlayerId,
                currentTurnName: this.roomState.game.turnPlayerName,
                puzzleCreatorName: this.roomState.game.puzzleCreatorName,
                turnExpiresAt: this.roomState.game.turnExpiresAt,
                timerSeconds: this.roomState.timerSeconds,
                winnerName: this.roomState.game.winnerName,
                isVictory: this.roomState.game.isVictory
            };
        }

        return {
            roomCode: this.roomState.roomCode,
            category: this.roomState.category,
            mode: this.roomState.mode,
            timerSeconds: this.roomState.timerSeconds,
            gameState: this.roomState.gameState,
            roundNumber: this.roomState.roundNumber || 0,
            hostId: "host",
            players: this.roomState.players,
            game: maskedGame,
            chatMessages: this.roomState.chatMessages
        };
    }

    webrtcUpdateSettings(payload) {
        if (!this.isHost || !this.roomState) return;
        if (payload.category) this.roomState.category = payload.category;
        if (payload.mode) this.roomState.mode = payload.mode;
        if (payload.timerSeconds !== undefined) this.roomState.timerSeconds = parseInt(payload.timerSeconds, 10);
        this.broadcastRoomState();
    }

    webrtcStartGame(payload) {
        if (this.isHost) {
            if (!this.roomState) return;
            this.initRound(payload.customPuzzle);
            const state = this.getSanitizedState();
            this.emitEvent("gameStarted", state);
            this.connections.forEach(conn => {
                if (conn.open) conn.send({ type: "gameStarted", state });
            });
        } else if (this.connToHost && this.connToHost.open) {
            this.connToHost.send({ type: "startGame", ...payload });
        }
    }

    initRound(customPuzzle) {
        let word, hint, catKey, catName, maskedWord, clueLetters;

        if (customPuzzle && customPuzzle.word) {
            word = customPuzzle.word.toUpperCase().trim();
            hint = customPuzzle.hint || "Custom secret puzzle!";
            catKey = "custom";
            catName = `✍️ ${customPuzzle.creatorName || "Player"}'s Custom Puzzle`;
            maskedWord = customPuzzle.maskedWord;
            clueLetters = customPuzzle.clueLetters || [];
        } else {
            const selected = window.NostalgiaWords.getRandomWord(this.roomState.category);
            word = selected.word;
            hint = selected.hint;
            catKey = selected.categoryKey;
            catName = selected.categoryName;
            clueLetters = window.NostalgiaWords.getStartingClues(word, "normal");
            maskedWord = word.split("").map(char => {
                if (char === " ") return " ";
                if (clueLetters.includes(char)) return char;
                return null;
            });
        }

        const roundNum = (this.roomState.roundNumber || 0);
        let turnIndex = 0;
        if (customPuzzle && this.roomState.players.length > 1) {
            const creatorIndex = this.roomState.players.findIndex(p => p.name === customPuzzle.creatorName);
            turnIndex = creatorIndex === 0 ? 1 : 0;
        } else if (this.roomState.players.length > 1) {
            turnIndex = roundNum % this.roomState.players.length;
        }

        const turnPlayer = this.roomState.players[turnIndex] || this.roomState.players[0];

        this.roomState.game = {
            word,
            hint,
            categoryKey: catKey,
            categoryName: catName,
            maskedWord,
            guessedLetters: clueLetters.map(l => ({ letter: l, correct: true })),
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

        this.roomState.gameState = "playing";
        this.roomState.roundNumber = roundNum + 1;
    }

    webrtcGuessLetter(payload) {
        if (this.isHost) {
            this.processGuess(payload.letter, "host");
        } else if (this.connToHost && this.connToHost.open) {
            this.connToHost.send({ type: "guessLetter", letter: payload.letter });
        }
    }

    processGuess(char, playerId) {
        if (!this.roomState || this.roomState.gameState !== "playing" || !this.roomState.game) return;
        const letter = (char || "").toUpperCase();
        const game = this.roomState.game;

        if (this.roomState.players.length > 1 && game.turnPlayerId !== playerId) {
            if (playerId === "host") this.emitEvent("turnNotice", "Not your turn!");
            return;
        }

        if (game.guessedLetters.some(g => g.letter === letter)) return;

        const isMatch = game.word.includes(letter);
        const player = this.roomState.players.find(p => p.id === playerId);

        if (isMatch) {
            let count = 0;
            for (let i = 0; i < game.word.length; i++) {
                if (game.word[i] === letter) {
                    game.maskedWord[i] = letter;
                    count++;
                }
            }
            if (player) player.score += count * 10;
            game.guessedLetters.push({ letter, correct: true });

            const solved = game.maskedWord.every(c => c !== null);
            if (solved) {
                this.roomState.gameState = "roundOver";
                game.isVictory = true;
                game.winnerName = player ? player.name : "Players";
                if (player) {
                    player.score += 50;
                    player.roundsWon += 1;
                }
                this.broadcast("guessResult", {
                    letter,
                    correct: true,
                    byPlayer: player ? player.name : "Player",
                    isRoundOver: true,
                    isVictory: true
                });
                this.broadcastRoomState();
                return;
            } else {
                this.broadcast("guessResult", {
                    letter,
                    correct: true,
                    byPlayer: player ? player.name : "Player",
                    isRoundOver: false
                });
            }
        } else {
            game.wrongGuesses += 1;
            game.guessedLetters.push({ letter, correct: false });

            if (game.wrongGuesses >= game.maxLives) {
                this.roomState.gameState = "roundOver";
                game.isVictory = false;
                game.winnerName = null;

                this.broadcast("guessResult", {
                    letter,
                    correct: false,
                    byPlayer: player ? player.name : "Player",
                    isRoundOver: true,
                    isVictory: false
                });
                this.broadcastRoomState();
                return;
            }

            if (this.roomState.players.length > 1) {
                game.currentTurnIndex = (game.currentTurnIndex + 1) % this.roomState.players.length;
                const nextPlayer = this.roomState.players[game.currentTurnIndex];
                game.turnPlayerId = nextPlayer.id;
                game.turnPlayerName = nextPlayer.name;
            }

            this.broadcast("guessResult", {
                letter,
                correct: false,
                byPlayer: player ? player.name : "Player",
                isRoundOver: false
            });
        }

        this.broadcastRoomState();
    }

    webrtcNextRound(payload) {
        if (this.isHost) {
            if (!this.roomState) return;
            this.initRound(payload ? payload.customPuzzle : null);
            const state = this.getSanitizedState();
            this.emitEvent("gameStarted", state);
            this.connections.forEach(conn => {
                if (conn.open) conn.send({ type: "gameStarted", state });
            });
        } else if (this.connToHost && this.connToHost.open) {
            this.connToHost.send({ type: "nextRound", ...payload });
        }
    }

    webrtcSendReaction(payload) {
        if (this.isHost) {
            this.broadcast("reactionReceived", payload);
        } else if (this.connToHost && this.connToHost.open) {
            this.connToHost.send({ type: "sendReaction", ...payload });
        }
    }

    webrtcSendChatMessage(payload) {
        if (this.isHost) {
            const chatMsg = {
                id: Date.now(),
                sender: payload.playerName || "Host",
                avatar: payload.avatar || "👾",
                text: payload.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            this.roomState.chatMessages.push(chatMsg);
            this.broadcast("chatMessage", chatMsg);
        } else if (this.connToHost && this.connToHost.open) {
            this.connToHost.send({
                type: "sendChatMessage",
                sender: payload.playerName || "Guest",
                avatar: payload.avatar || "🎮",
                text: payload.text
            });
        }
    }
}

// Global Singleton
window.GameNetwork = new NetworkAdapter();
