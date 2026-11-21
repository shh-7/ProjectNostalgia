// Retro Pixel Confetti Celebration Engine (Zero-dependency, Canvas-based)

(function () {
    let canvas = null;
    let ctx = null;
    let particles = [];
    let animationId = null;

    const COLORS = [
        "#e53935", "#d81b60", "#8e24aa", "#3949ab",
        "#1e88e5", "#00acc1", "#00897b", "#43a047",
        "#7cb342", "#fdd835", "#ffb300", "#fb8c00"
    ];

    function initCanvas() {
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "nostalgiaConfettiCanvas";
            canvas.style.position = "fixed";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.width = "100vw";
            canvas.style.height = "100vh";
            canvas.style.pointerEvents = "none";
            canvas.style.zIndex = "99999";
            document.body.appendChild(canvas);
            ctx = canvas.getContext("2d");

            window.addEventListener("resize", resizeCanvas);
            resizeCanvas();
        }
    }

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = -20 - Math.random() * 50;
            this.size = Math.random() * 8 + 6;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.vx = (Math.random() - 0.5) * 6;
            this.vy = Math.random() * 5 + 4;
            this.rotation = Math.random() * 360;
            this.vRotation = (Math.random() - 0.5) * 8;
            this.opacity = 1;
            this.shape = Math.random() > 0.5 ? "rect" : "circle";
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.vRotation;
            this.vy += 0.12; // gravity

            if (this.y > canvas.height - 100) {
                this.opacity -= 0.025;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.fillStyle = this.color;

            if (this.shape === "rect") {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.7);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function loop() {
        if (!ctx || particles.length === 0) {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();

            if (p.opacity <= 0 || p.y > canvas.height + 50) {
                particles.splice(i, 1);
            }
        }

        animationId = requestAnimationFrame(loop);
    }

    window.fireConfetti = function (count = 70) {
        initCanvas();
        resizeCanvas();

        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }

        if (!animationId) {
            loop();
        }
    };
})();
