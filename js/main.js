window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.classList.remove('is-loading');
        setTimeout(() => { preloader.style.display = 'none'; type(); }, 600); 
    }, 150);
});

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// -------------------------------------------------------------
// ENGR NOTE: Ambient Glowing Grid Background
// High-performance canvas overlay that matches the 30px CSS grid.
// Randomly lights up cells without polluting the DOM with nodes.
// -------------------------------------------------------------
const initAmbientGrid = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0'; canvas.style.left = '0';
    canvas.style.width = '100vw'; canvas.style.height = '100vh';
    canvas.style.zIndex = '1'; canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    const gridSize = 30; // Matches CSS background-size
    
    // Neon green, soft cyan, subtle purple
    const colors = ['0, 255, 65', '0, 243, 255', '183, 0, 255'];
    let glowingCells = [];

    const resize = () => {
        width = window.innerWidth; height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr; canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
        ctx.clearRect(0, 0, width, height);
        
        if (Math.random() < 0.05 && glowingCells.length < 15) {
            const x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
            const y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
            
            if (!glowingCells.some(c => c.x === x && c.y === y)) {
                glowingCells.push({
                    x, y, life: 0,
                    maxLife: 300 + Math.random() * 300,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    maxOpacity: 0.03 + Math.random() * 0.07
                });
            }
        }

        for (let i = glowingCells.length - 1; i >= 0; i--) {
            let cell = glowingCells[i];
            cell.life++;
            const progress = cell.life / cell.maxLife;
            
            if (progress >= 1) { glowingCells.splice(i, 1); continue; }
            
            const currentOpacity = Math.sin(progress * Math.PI) * cell.maxOpacity;
            ctx.fillStyle = `rgba(${cell.color}, ${currentOpacity})`;
            ctx.fillRect(cell.x, cell.y, gridSize, gridSize);
        }
        requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
};
initAmbientGrid();

const initCursor = () => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    document.body.classList.add('custom-cursor-active');

    let mouseX = window.innerWidth / 2; let mouseY = window.innerHeight / 2;
    let currentX = mouseX; let currentY = mouseY;
    let isHovering = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (!isHovering) { isHovering = true; cursor.style.opacity = '1'; }
    }, { passive: true });

    document.addEventListener('mouseleave', () => { isHovering = false; cursor.style.opacity = '0'; });

    const interactables = document.querySelectorAll('a, button, .card');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
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
};
initCursor();

const text = "SYS_ADMIN // READY";
let index = 0;
const typeEl = document.getElementById('typewriter-text');
function type() {
    if (!typeEl) return;
    if (index < text.length) {
        typeEl.textContent += text.charAt(index); index++;
        setTimeout(type, 80 + Math.random() * 50);
    }
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-up, .card, .timeline-item').forEach(el => observer.observe(el));

// -------------------------------------------------------------
// ENGR NOTE: Button Cipher Glitch Effect
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const chars = '#X9@!_V3R$%^&*()[]{}|;:,.<>?';
    document.querySelectorAll('.cipher-btn').forEach(btn => {
        const textSpan = btn.querySelector('.btn-text');
        if (!textSpan) return;
        const originalText = btn.dataset.text;
        let timeout;
        let interval;
        
        btn.addEventListener('mouseenter', () => {
            clearInterval(interval);
            clearTimeout(timeout);
            
            interval = setInterval(() => {
                textSpan.innerText = Array.from(originalText).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            }, 50);
            
            timeout = setTimeout(() => {
                clearInterval(interval);
                textSpan.innerText = originalText;
            }, 300); // Exposes original text after 300ms
        });
        
        btn.addEventListener('mouseleave', () => {
            clearInterval(interval);
            clearTimeout(timeout);
            textSpan.innerText = originalText;
        });
    });
});