/* ============================================================
   PERSONAL WEBSITE - Javier Xie
   Main JavaScript - Language Toggle, Navigation, Portfolio Filter
   ============================================================ */

(function () {
    'use strict';

    // ==================== STATE ====================
    let currentLang = localStorage.getItem('lang') || 'zh';
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-links a');

    // ==================== INIT ====================
    document.addEventListener('DOMContentLoaded', () => {
        initAOS();
        applyLanguage(currentLang);
        initLanguageToggle();
        initNavbarScroll();
        initMobileMenu();
        initPortfolioFilter();
        initActiveNavOnScroll();
        initSmoothScroll();
    });

    // ==================== AOS INIT ====================
    function initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-expo',
                once: true,
                offset: 40,
                disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            });
        }
    }

    // ==================== LANGUAGE SYSTEM ====================
    // All bilingual text is stored in data attributes (data-zh, data-en) in HTML.
    // This function walks the DOM and swaps textContent based on the lang.

    function applyLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

        // Update all elements with data-zh and data-en
        document.querySelectorAll('[data-zh][data-en]').forEach(el => {
            // Only update text content for leaf text nodes
            const text = el.getAttribute(lang === 'zh' ? 'data-zh' : 'data-en');
            if (text !== null) {
                // Check if this element has child elements (mixed content)
                if (el.children.length === 0) {
                    el.textContent = text;
                } else {
                    // For elements with children, update the text node only
                    updateFirstTextNode(el, text);
                }
            }
        });

        // Update language toggle button
        updateLangToggleUI(lang);

        // Save preference
        localStorage.setItem('lang', lang);
    }

    function updateFirstTextNode(el, text) {
        // Find and update the first direct text node
        for (let node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                // Preserve leading/trailing whitespace
                const leading = node.textContent.match(/^\s*/)[0];
                const trailing = node.textContent.match(/\s*$/)[0];
                node.textContent = leading + text + trailing;
                break;
            }
        }
    }

    function initLanguageToggle() {
        const toggle = document.getElementById('langToggle');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            const newLang = currentLang === 'zh' ? 'en' : 'zh';
            applyLanguage(newLang);
        });
    }

    function updateLangToggleUI(lang) {
        const zhEl = document.querySelector('.lang-zh');
        const enEl = document.querySelector('.lang-en');
        if (!zhEl || !enEl) return;

        zhEl.classList.toggle('active', lang === 'zh');
        enEl.classList.toggle('active', lang === 'en');
    }

    // ==================== NAVBAR SCROLL EFFECT ====================
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (window.scrollY > 60) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ==================== MOBILE MENU ====================
    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // ==================== ACTIVE NAV ON SCROLL ====================
    function initActiveNavOnScroll() {
        if (sections.length === 0 || navLinksAll.length === 0) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    let current = '';
                    sections.forEach(section => {
                        const sectionTop = section.offsetTop - 120;
                        if (window.scrollY >= sectionTop) {
                            current = section.getAttribute('id');
                        }
                    });

                    navLinksAll.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + current) {
                            link.classList.add('active');
                        }
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ==================== SMOOTH SCROLL (fallback) ====================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ==================== PORTFOLIO FILTER ====================
    function initPortfolioFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');

        if (filterBtns.length === 0 || portfolioItems.length === 0) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                // Filter items
                portfolioItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.classList.remove('hidden');
                        // Re-trigger AOS for newly shown items
                        if (typeof AOS !== 'undefined') {
                            item.setAttribute('data-aos', 'fade-up');
                            AOS.refresh();
                        }
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

})();
