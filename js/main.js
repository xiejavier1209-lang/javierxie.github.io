/* ============================================================
   JAVIER XIE · CREATIVE ARCHIVE
   Interactions: Archive · Language · Dust · Chronicle
   ============================================================ */
(function () {
    'use strict';

    let currentLang = localStorage.getItem('lang') || 'zh';

    // ==================== INIT ====================
    document.addEventListener('DOMContentLoaded', () => {
        applyLanguage(currentLang);
        initArchiveEntrance();
        initLanguageToggle();
        initChronicleToggles();
        initDustParticles();
        initSmoothScroll();
    });

    // ==================== LANGUAGE ====================
    function applyLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

        document.querySelectorAll('[data-zh][data-en]').forEach(el => {
            const text = el.getAttribute(lang === 'zh' ? 'data-zh' : 'data-en');
            if (text !== null && el.children.length === 0) {
                el.textContent = text;
            }
        });

        updateBookmarkUI(lang);
        localStorage.setItem('lang', lang);
    }

    function initLanguageToggle() {
        document.querySelectorAll('.lang-bookmark').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                if (lang) applyLanguage(lang);
            });
        });
    }

    function updateBookmarkUI(lang) {
        document.querySelectorAll('.lang-bookmark').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
    }

    // ==================== ARCHIVE ENTRANCE ====================
    function initArchiveEntrance() {
        const box = document.getElementById('archiveBox');
        if (!box) return;

        box.addEventListener('click', () => {
            // Play subtle sound
            playSound('open');

            // Animate box opening
            box.classList.add('opened');

            // After animation, scroll to identity record
            setTimeout(() => {
                const target = document.getElementById('identity-record');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }, 400);
        });

        // Hover sound
        box.addEventListener('mouseenter', () => {
            playSound('hover');
        });
    }

    // ==================== CHRONICLE TOGGLES ====================
    function initChronicleToggles() {
        document.querySelectorAll('.chronicle-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const entry = toggle.closest('.chronicle-entry');
                entry.classList.toggle('expanded');
                playSound('page');
            });
        });
    }

    // ==================== DUST PARTICLES (Canvas) ====================
    function initDustParticles() {
        const canvas = document.getElementById('dust-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const particles = [];
        const MAX_PARTICLES = 30;

        function resize() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Create particles
        for (let i = 0; i < MAX_PARTICLES; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.15,
                speedY: (Math.random() - 0.5) * 0.15 - 0.05,
                opacity: Math.random() * 0.25 + 0.05,
                life: Math.random() * 300 + 100,
                maxLife: 300 + Math.random() * 200
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                p.x += p.speedX;
                p.y += p.speedY;
                p.life--;

                // Gentle drift
                p.speedX += (Math.random() - 0.5) * 0.003;
                p.speedY += (Math.random() - 0.5) * 0.003;

                // Clamp speed
                p.speedX = Math.max(-0.2, Math.min(0.2, p.speedX));
                p.speedY = Math.max(-0.2, Math.min(0.2, p.speedY));

                // Reset particle at edges or end of life
                if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height || p.life <= 0) {
                    p.x = Math.random() * canvas.width;
                    p.y = canvas.height * 0.2 + Math.random() * canvas.height * 0.6;
                    p.life = p.maxLife;
                    p.opacity = Math.random() * 0.25 + 0.05;
                    p.speedX = (Math.random() - 0.5) * 0.15;
                    p.speedY = -Math.random() * 0.1;
                }

                // Fade near end of life
                const fade = p.life < 40 ? p.life / 40 : 1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(232, 200, 96, ${p.opacity * fade})`;
                ctx.fill();
            }

            requestAnimationFrame(animate);
        }

        // Only animate if canvas is visible
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animate();
                observer.disconnect();
            }
        });
        observer.observe(canvas);
    }

    // ==================== AUDIO (Web Audio API) ====================
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function playSound(type) {
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            switch (type) {
                case 'hover':
                    // Subtle brass tick
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
                    gain.gain.setValueAtTime(0.02, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.08);
                    break;

                case 'open':
                    // Wood + brass unlock
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
                    gain.gain.setValueAtTime(0.03, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);

                    // Second tone — brass click
                    const osc2 = ctx.createOscillator();
                    const gain2 = ctx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(ctx.destination);
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(1200, now + 0.1);
                    osc2.frequency.exponentialRampToValueAtTime(600, now + 0.15);
                    gain2.gain.setValueAtTime(0.015, now + 0.1);
                    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                    osc2.start(now + 0.1);
                    osc2.stop(now + 0.15);
                    break;

                case 'page':
                    // Paper rustle
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.setValueAtTime(250, now + 0.05);
                    osc.frequency.setValueAtTime(350, now + 0.1);
                    gain.gain.setValueAtTime(0.01, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;
            }
        } catch (e) {
            // Audio not supported — silent fallback
        }
    }

    // ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

})();