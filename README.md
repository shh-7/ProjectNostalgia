# 🕹️ Project Nostalgia

> **Childhood games. Online again.**  
> A genuine retro arcade web gaming platform featuring real-time multiplayer, nostalgic trivia, customizable avatars, and childhood paper classics.

---

## 🌐 Play Online Instantly

The entire game runs **100% fully online** directly from this repository via GitHub Pages:

### 👉 **[Play Live on GitHub Pages](https://shh-7.github.io/ProjectNostalgia/)**

- **Solo Practice Mode**: Instant single-player word games with clues and streak tracking.
- **Daily Word Challenge**: Deterministic daily puzzle synchronized for players worldwide.
- **1v1 Real-Time Multiplayer**: Built with a dual-engine architecture:
  - **PeerJS WebRTC (Serverless P2P)**: Direct browser-to-browser real-time data channels for rooms on GitHub Pages (zero server costs).
  - **Socket.IO (WebSocket Server)**: Ultra-fast server-coordinated matchmaking when hosted on Node.js / Render / Railway.

---

## ✨ Features & Game Modes

### 1. ⚔️ Classic Hangman Multiplayer (1v1 Duel)
- **Room Matchmaking**: Create or join private 5-character rooms (e.g. `7K3Q9`).
- **Direct Invite Link**: One-click link copying (`https://shh-7.github.io/ProjectNostalgia/room.html?code=7K3Q9`).
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

- **Client**: Vanilla HTML5, CSS3, JavaScript (ES6+), Web Audio API, HTML5 Canvas
- **P2P Multiplayer**: PeerJS WebRTC (zero-configuration serverless data channels on GitHub Pages)
- **Node Server**: Express 5, Socket.IO 4.8 (for dedicated cloud deployments)
- **CI/CD**: GitHub Actions workflow to auto-deploy on every push to `main`

---

## 🚀 How to Enable GitHub Pages (In this Repo)

1. Open your repository on GitHub: [`github.com/shh-7/ProjectNostalgia`](https://github.com/shh-7/ProjectNostalgia).
2. Go to **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment > Source**:
   - Select **GitHub Actions** (recommended — uses the included [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).
   - *Or* select **Deploy from a branch** -> `main` / `(root)`.
4. Your game will be live at:
   ```
   https://shh-7.github.io/ProjectNostalgia/
   ```

---

## 🖥️ Local Development

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

### 3. Open in Browser
Visit [http://localhost:3000](http://localhost:3000).

---

## ☁️ Cloud Server Deployment (Optional)

If you prefer a dedicated Node.js WebSocket backend:
- **Render**: Connect repository. Uses [`render.yaml`](render.yaml) automatically.
- **Railway / Heroku**: Uses [`Procfile`](Procfile) and `package.json` automatically.

---

## 📄 License
ISC License
