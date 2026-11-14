// Procedural 8-bit Retro Audio Synthesizer (Web Audio API)
// Provides instant nostalgic sound effects without external audio files

class RetroAudio {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem("nostalgia_muted") === "true";
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem("nostalgia_muted", this.muted);
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    // Play crisp button / menu click
    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }

    // Mechanical keypress click when typing letters
    playKeyPress() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(220 + Math.random() * 40, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
    }

    // Correct letter guess chime (happy ascending two-tone)
    playCorrect() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + i * 0.07);

            gain.gain.setValueAtTime(0.15, now + i * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.18);
        });
    }

    // Wrong letter buzzer (retro low discordant buzz)
    playWrong() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.22);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    // Timer urgency tick (when < 10 seconds remaining)
    playTick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // Round victory fanfare
    playWin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "square";
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);

            gain.gain.setValueAtTime(0.12, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.22);
        });
    }

    // Game over sound (descending sad tones)
    playGameOver() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, D#4, C4
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, now + idx * 0.16);

            gain.gain.setValueAtTime(0.15, now + idx * 0.16);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.26);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.16);
            osc.stop(now + idx * 0.16 + 0.26);
        });
    }
}

// Global audio instance
window.soundFX = new RetroAudio();
