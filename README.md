# 🕹️ Project Nostalgia

> **Childhood games. Online again.**  
> A genuine retro arcade web gaming platform featuring real-time multiplayer, nostalgic trivia, customizable avatars, and childhood paper classics.

---

## ✨ Features & Game Modes

### 1. ⚔️ Classic Hangman Multiplayer (1v1 Duel)
- **Room Matchmaking**: Create or join private 5-character rooms (e.g. `7K3Q9`).
- **Direct Invite Link**: One-click link copying (`https://your-domain.com/room.html?code=7K3Q9`).
- **Custom Player Avatars**: Choose from 12 retro pixel avatars (👾, 🕹️, 📼, 🐱, 🚀, 🤠, 🍕, 🎸, 🦊, 🤖, 🎮, ⚡).
- **Turn Timer**: Choose between Relaxed (no timer), 30s Blitz, or 45s Normal with real-time countdown urgency.
- **In-Game Live Chat & Log**: Chat with opponents and see real-time guess events.
- **Floating Reactions**: Instant multiplayer emoji reactions (👏, 🔥, 😱, 💡, 🎉, 💀).
- **Rematch Persistence**: Play infinite consecutive rounds without needing to re-create rooms.

### 2. ⚡ Solo Practice Mode
- **Zero Wait**: Play immediately against the word bank.
- **Difficulty Modes**: Easy (7 lives, starting clues), Normal (6 lives, 1 clue), Hard (5 lives, 0 clues).
- **Streak Tracker**: Tracks your current winning streak, all-time best streak, and total wins locally.

### 3. 📅 Daily Nostalgia Challenge
- **Word of the Day**: A synchronized daily mystery word generated deterministically for everyone worldwide.
- Can you solve today's riddle with all lives intact?

### 4. ✍️ Custom Word Creator
- Write your own secret word and clue to challenge a friend! (Just like in school notebooks).

### 5. 💡 Nostalgia Trivia & Hints
- Over 120+ curated words across 6 nostalgic categories:
  - 📼 **90s & 2000s Nostalgia** (*Tamagotchi, Walkman, Game Boy, Cassette, Dial-Up...*)
  - 🕹️ **Classic Video Games** (*Pac-Man, Tetris, Super Mario, Zelda, Sonic, Doom...*)
  - 📺 **Cartoons & Movies** (*Scooby-Doo, Tom & Jerry, SpongeBob, Lion King, Jurassic Park...*)
  - 💾 **Retro Tech & Computing** (*JavaScript, Computer, Algorithm, Floppy, Webcam, Linux...*)
  - 🍭 **Childhood Treats & Snacks** (*Dunkaroos, Pop Tarts, Fun Dip, Ring Pop, Capri Sun...*)
  - 🐾 **Animals & Nature** (*Chameleon, Penguin, Kangaroo, Flamingo, Cheetah...*)

### 6. 🎨 Visual & Audio Polish
- **Dual Themes**: Toggle between 📜 **Classic Parchment Paper** (`#f4efe3`) and 🕹️ **Midnight Arcade** (`#14151f`).
- **Procedural 8-bit Audio**: Zero-lag synthesized retro audio via native Web Audio API (mechanical clicks, correct chime, wrong buzz, timer tick, win fanfare).
- **Canvas Confetti**: High-performance pixel confetti explosion on victory.
- **Screen Shake**: Subtle tactile shake animation on wrong guesses.
- **Dual Input**: Full virtual touch keyboard for mobile and native physical keyboard typing (`A`–`Z`).

---

## 🛠️ Tech Stack

- **Server**: Node.js, Express 5, Socket.IO 4.8
- **Client**: Vanilla HTML5, CSS3, JavaScript (ES6+), Web Audio API, HTML5 Canvas
- **Networking**: WebSockets via Socket.IO with automatic HTTP long-polling fallback

---

## 🚀 Quick Start (Local)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Game Server
```bash
npm start
```
For auto-reloading development:
```bash
npm run dev
```

### 3. Play
Visit [http://localhost:3000](http://localhost:3000) in your browser.  
Open a second browser tab (or incognito window) to join your own room code and test real-time multiplayer!

---

## 🌐 Cloud Hosting (1-Click Ready)

- **Port Handling**: Configured with `process.env.PORT || 3000`.
- **Healthcheck**: `/health` and `/api/stats` endpoints for platform uptime monitors.
- **Render**: Connect repo, set Build Command to `npm install` and Start Command to `npm start`.
- **Railway**: Click "New Project from GitHub Repo" — detects `package.json` automatically.
- **VPS (PM2)**:
  ```bash
  npm install -g pm2
  pm2 start server/server.js --name "project-nostalgia"
  ```

---

## 📁 Project Structure

```text
ProjectNostalgia/
├── server/
│   ├── server.js         # Express + Socket.IO server (lobbies, timer, chat, game engine)
│   └── words.js          # 120+ words with nostalgic trivia hints & daily word generator
├── client/
│   ├── index.html        # Game arcade portal (hub, modals, profile, stats)
│   ├── index.css         # Parchment & Midnight themes, Neobrutalist design
│   ├── index.js          # Profile customizer, modals, daily word fetcher
│   ├── room.html         # Multiplayer lobby, live arena, in-game chat
│   ├── room.css          # Scaffold, arena shake, responsive touch keyboard
│   ├── room.js           # Real-time state synchronization, turn timers, chat
│   ├── solo.html         # Solo practice & Daily Challenge view
│   ├── solo.js           # Offline engine, streak tracker, difficulty selector
│   ├── audio.js          # Procedural Web Audio 8-bit retro sound synthesizer
│   └── confetti.js       # HTML5 Canvas particle confetti engine
├── package.json          # Node.js manifest & scripts
└── README.md             # Documentation & hosting guide
```

---

## 📄 License
ISC License
