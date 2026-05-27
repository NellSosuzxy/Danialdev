
(() => {
    "use strict";

    const App = {
        init() {
            this.bindEvents();
            this.initAmbientGrid();
            this.initCursor();
            this.initObserver();
            this.initCipherButtons();
        },

        bindEvents() {
            // Menggunakan DOMContentLoaded supaya tak tunggu gambar/font rendering yang lambat
            document.addEventListener("DOMContentLoaded", () => {
                this.handlePreloader();
                if (typeof lucide !== "undefined") lucide.createIcons();
            });

            // Failsafe jika DOM sudah sedia (cth: load dari cache)
            if (document.readyState === "interactive" || document.readyState === "complete") {
                this.handlePreloader();
            }
        },

        handlePreloader() {
            if (this.preloaderFired) return;
            this.preloaderFired = true;

            const preloader = document.getElementById("preloader");
            
            // Masa menunggu diringkaskan dari 150ms -> 50ms, dan 600ms -> 300ms
            setTimeout(() => {
                if (preloader) {
                    preloader.classList.add("hidden");
                    setTimeout(() => {
                        preloader.style.display = "none";
                        this.typewriterEffect();
                    }, 300);
                } else {
                    this.typewriterEffect();
                }
                document.body.classList.remove("is-loading");
            }, 50);
        },

        typewriterEffect() {
            const text = "SYS_ADMIN // READY";
            const typeEl = document.getElementById("typewriter-text");
            if (!typeEl) return;

            let index = 0;
            const type = () => {
                if (index < text.length) {
                    typeEl.textContent += text.charAt(index);
                    index++;
                    setTimeout(type, 80 + Math.random() * 50);
                }
            };
            type();
        },

        initAmbientGrid() {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const canvas = document.createElement("canvas");
            Object.assign(canvas.style, {
                position: "fixed",
                top: "0",
                left: "0",
                width: "100vw",
                height: "100vh",
                zIndex: "1",
                pointerEvents: "none"
            });
            document.body.prepend(canvas);

            const ctx = canvas.getContext("2d");
            let width, height;
            const gridSize = 30;
            const colors = ["0, 255, 65", "0, 243, 255", "183, 0, 255"];
            const glowingCells = [];

            const resize = () => {
                width = window.innerWidth;
                height = window.innerHeight;
                const dpr = window.devicePixelRatio || 1;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);
            };

            window.addEventListener("resize", resize);
            resize();

            const draw = () => {
                ctx.clearRect(0, 0, width, height);

                if (Math.random() < 0.05 && glowingCells.length < 15) {
                    const x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
                    const y = Math.floor(Math.random() * (height / gridSize)) * gridSize;

                    if (!glowingCells.some(c => c.x === x && c.y === y)) {
                        glowingCells.push({
                            x, y,
                            life: 0,
                            maxLife: 300 + Math.random() * 300,
                            color: colors[Math.floor(Math.random() * colors.length)],
                            maxOpacity: 0.03 + Math.random() * 0.07
                        });
                    }
                }

                for (let i = glowingCells.length - 1; i >= 0; i--) {
                    const cell = glowingCells[i];
                    cell.life++;
                    const progress = cell.life / cell.maxLife;

                    if (progress >= 1) {
                        glowingCells.splice(i, 1);
                        continue;
                    }

                    const currentOpacity = Math.sin(progress * Math.PI) * cell.maxOpacity;
                    ctx.fillStyle = `rgba(${cell.color}, ${currentOpacity})`;
                    ctx.fillRect(cell.x, cell.y, gridSize, gridSize);
                }
                requestAnimationFrame(draw);
            };
            requestAnimationFrame(draw);
        },

        initCursor() {
            if (!window.matchMedia("(pointer: fine)").matches) return;
            const cursor = document.getElementById("custom-cursor");
            if (!cursor) return;

            document.body.classList.add("custom-cursor-active");

            let mouseX = window.innerWidth / 2;
            let mouseY = window.innerHeight / 2;
            let currentX = mouseX;
            let currentY = mouseY;
            let isHovering = false;

            window.addEventListener("mousemove", (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                if (!isHovering) {
                    isHovering = true;
                    cursor.style.opacity = "1";
                }
            }, { passive: true });

            document.addEventListener("mouseleave", () => {
                isHovering = false;
                cursor.style.opacity = "0";
            });

            const interactables = document.querySelectorAll("a, button, .card");
            interactables.forEach(el => {
                el.addEventListener("mouseenter", () => cursor.classList.add("hovering"));
                el.addEventListener("mouseleave", () => cursor.classList.remove("hovering"));
            });

            const updateCursor = () => {
                if (isHovering) {
                    currentX += (mouseX - currentX) * 0.25;
                    currentY += (mouseY - currentY) * 0.25;
                    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                }
                requestAnimationFrame(updateCursor);
            };
            updateCursor();
        },

        initObserver() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            document.querySelectorAll(".fade-up, .card, .timeline-item").forEach(el => observer.observe(el));
        },

        initCipherButtons() {
            const chars = "#X9@!_V3R$%^&*()[]{}|;:,.<>?";
            document.querySelectorAll(".cipher-btn").forEach(btn => {
                const textSpan = btn.querySelector(".btn-text");
                if (!textSpan) return;
                
                const originalText = btn.dataset.text || textSpan.innerText || "VIEW_REPO";
                let timeout, interval;

                btn.addEventListener("mouseenter", () => {
                    clearInterval(interval);
                    clearTimeout(timeout);

                    interval = setInterval(() => {
                        textSpan.innerText = Array.from(originalText)
                            .map(() => chars[Math.floor(Math.random() * chars.length)])
                            .join("");
                    }, 50);

                    timeout = setTimeout(() => {
                        clearInterval(interval);
                        textSpan.innerText = originalText;
                    }, 600);
                });

                btn.addEventListener("mouseleave", () => {
                    clearInterval(interval);
                    clearTimeout(timeout);
                    textSpan.innerText = originalText;
                });
            });
        }
    };

    App.init();
})();
